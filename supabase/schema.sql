-- Shelfed — Supabase schema, Phase 1 (accounts + profiles).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- One profile row per auth user; username is public and unique.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text unique,
  display_name text,
  created_at   timestamptz not null default now()
);

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

