-- Shelfed — Supabase schema, Phase 1 (accounts + profiles).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- One profile row per auth user; username is public and unique.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Profile photo, stored inline as a small data URI (no storage bucket needed).
alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles enable row level security;

-- Any signed-in user can read profiles (needed to find/follow people);
-- a user may only insert/update their own row.
drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create an empty profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Let a signed-in user delete their own account (auth row + cascade to profile).
-- Required by the App Store and Google Play (in-app account deletion).
create or replace function public.delete_own_account()
returns void language plpgsql security definer set search_path = '' as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

-- Phase 2: cloud mirror of the shareable shelves (watched / watchlist / favorite).
-- Local SQLite stays the source of truth; this is a per-user mirror for
-- cross-device restore and (later) sharing. 'skipped' is never synced.
create table if not exists public.shelf_items (
  user_id     uuid not null references auth.users (id) on delete cascade,
  media_type  text not null,
  movie_id    text not null,
  type        text not null check (type in ('watched', 'watchlist', 'favorite')),
  title       text,
  poster_path text,
  year        int,
  updated_at  timestamptz not null default now(),
  primary key (user_id, media_type, movie_id, type)
);

alter table public.shelf_items enable row level security;

-- Private to the owner for now; relaxed to a follows/public model when sharing lands.
drop policy if exists "shelf_items private to owner" on public.shelf_items;
create policy "shelf_items private to owner"
  on public.shelf_items for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Phase 3: social graph (who follows whom).
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

alter table public.follows enable row level security;

drop policy if exists "follows visible to involved users" on public.follows;
create policy "follows visible to involved users"
  on public.follows for select to authenticated
  using (auth.uid() = follower_id or auth.uid() = followee_id);

drop policy if exists "follows insert own" on public.follows;
create policy "follows insert own"
  on public.follows for insert to authenticated with check (auth.uid() = follower_id);

drop policy if exists "follows delete own" on public.follows;
create policy "follows delete own"
  on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- Phase 3: let followers READ a user's shelf (writes stay owner-only). This
-- replaces the owner-only "for all" policy above with per-command policies.
drop policy if exists "shelf_items private to owner" on public.shelf_items;
drop policy if exists "shelf_items select owner or follower" on public.shelf_items;
create policy "shelf_items select owner or follower"
  on public.shelf_items for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.follows f
      where f.followee_id = public.shelf_items.user_id
        and f.follower_id = auth.uid()
    )
  );
drop policy if exists "shelf_items insert owner" on public.shelf_items;
create policy "shelf_items insert owner"
  on public.shelf_items for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "shelf_items update owner" on public.shelf_items;
create policy "shelf_items update owner"
  on public.shelf_items for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "shelf_items delete owner" on public.shelf_items;
create policy "shelf_items delete owner"
  on public.shelf_items for delete to authenticated using (auth.uid() = user_id);

-- Phase 3b: private accounts + follow requests -------------------------------
-- Accounts are PRIVATE by default. Following a private account creates a
-- 'pending' request the owner must accept; a public account auto-accepts.
alter table public.profiles
  add column if not exists is_private boolean not null default true;

alter table public.follows
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'accepted'));

-- Grandfather every existing follow as accepted (they were implicitly open).
update public.follows set status = 'accepted' where status is distinct from 'accepted';

-- Insert: a user may REQUEST to follow anyone ('pending'); they may create an
-- already-accepted follow only when the target account is public.
drop policy if exists "follows insert own" on public.follows;
create policy "follows insert own"
  on public.follows for insert to authenticated with check (
    auth.uid() = follower_id
    and (
      status = 'pending'
      or (
        status = 'accepted'
        and exists (
          select 1 from public.profiles p
          where p.id = followee_id and p.is_private = false
        )
      )
    )
  );

-- Update: only the followee can change a row (accept a pending request).
drop policy if exists "follows update by followee" on public.follows;
create policy "follows update by followee"
  on public.follows for update to authenticated
  using (auth.uid() = followee_id) with check (auth.uid() = followee_id);

-- Delete: the follower (unfollow / cancel) OR the followee (reject / remove).
drop policy if exists "follows delete own" on public.follows;
drop policy if exists "follows delete by involved" on public.follows;
create policy "follows delete by involved"
  on public.follows for delete to authenticated
  using (auth.uid() = follower_id or auth.uid() = followee_id);

-- Shelves: only ACCEPTED followers (or the owner) may read.
drop policy if exists "shelf_items select owner or follower" on public.shelf_items;
create policy "shelf_items select owner or follower"
  on public.shelf_items for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.follows f
      where f.followee_id = public.shelf_items.user_id
        and f.follower_id = auth.uid()
        and f.status = 'accepted'
    )
  );

