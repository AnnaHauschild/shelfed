import { supabase } from './supabase';

/** A minimal public user, for search results and following lists. */
export interface UserSummary {
  id: string;
  username: string;
  avatarUrl?: string | null;
}

export type FollowStatus = 'pending' | 'accepted';

/** A followed user plus the state of that follow (accepted vs. requested). */
export interface FollowEntry extends UserSummary {
  status: FollowStatus;
}

/** Case-insensitive username search, excluding the current user. */
export async function searchUsers(
  query: string,
  excludeId: string,
): Promise<UserSummary[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const build = (cols: string) =>
    supabase
      .from('profiles')
      .select(cols)
      .ilike('username', `%${q}%`)
      .neq('id', excludeId)
      .not('username', 'is', null)
      .limit(20);
  // Fall back if avatar_url isn't in the schema yet.
  let res = await build('id, username, avatar_url');
  if (res.error) res = await build('id, username');
  return rowsToUsers(res.data);
}

/** The ids the given user follows. */
export async function getFollowingIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', userId);
  return (data ?? []).map((r) => r.followee_id);
}

/** The profiles the given user follows, each with its follow status. */
export async function getFollowing(userId: string): Promise<FollowEntry[]> {
  const build = (cols: string) =>
    supabase.from('follows').select(cols).eq('follower_id', userId);
  let res = await build('followee_id, status');
  if (res.error) res = await build('followee_id');
  const rows = (res.data ?? []) as unknown as {
    followee_id: string;
    status?: string;
  }[];
  if (rows.length === 0) return [];
  const statusById = new Map<string, FollowStatus>(
    rows.map((r) => [r.followee_id, (r.status as FollowStatus) ?? 'accepted']),
  );
  const users = await getProfiles([...statusById.keys()]);
  return users.map((u) => ({ ...u, status: statusById.get(u.id) ?? 'accepted' }));
}

/** Incoming follow requests (people awaiting the user's approval). */
export async function getFollowRequests(userId: string): Promise<UserSummary[]> {
  const { data, error } = await supabase
    .from('follows')
    .select('follower_id, status')
    .eq('followee_id', userId)
    .eq('status', 'pending');
  if (error) return []; // status column not in schema yet
  const ids = (data ?? []).map((r) => r.follower_id);
  return getProfiles(ids);
}

/** Loads UserSummary rows for a set of profile ids (avatar-tolerant). */
export async function getProfiles(ids: string[]): Promise<UserSummary[]> {
  if (ids.length === 0) return [];
  const build = (cols: string) =>
    supabase.from('profiles').select(cols).in('id', ids);
  let res = await build('id, username, avatar_url');
  if (res.error) res = await build('id, username');
  return rowsToUsers(res.data);
}

/** Maps raw profile rows (with or without avatar_url) to UserSummary. */
function rowsToUsers(data: unknown): UserSummary[] {
  const rows = (data ?? []) as {
    id: string;
    username: string | null;
    avatar_url?: string | null;
  }[];
  return rows
    .filter((r) => r.username)
    .map((r) => ({
      id: r.id,
      username: r.username as string,
      avatarUrl: r.avatar_url ?? null,
    }));
}

// Public accounts auto-accept a follow; private accounts get a pending request.
export async function followUser(
  followerId: string,
  followeeId: string,
): Promise<void> {
  let isPrivate = true;
  const { data } = await supabase
    .from('profiles')
    .select('is_private')
    .eq('id', followeeId)
    .maybeSingle();
  const flag = (data as { is_private?: boolean } | null)?.is_private;
  if (typeof flag === 'boolean') isPrivate = flag;
  const status: FollowStatus = isPrivate ? 'pending' : 'accepted';
  const res = await supabase.from('follows').upsert(
    { follower_id: followerId, followee_id: followeeId, status },
    { onConflict: 'follower_id,followee_id', ignoreDuplicates: true },
  );
  if (res.error) {
    // status/is_private not in schema yet — fall back to a legacy open follow.
    await supabase.from('follows').upsert(
      { follower_id: followerId, followee_id: followeeId },
      { onConflict: 'follower_id,followee_id', ignoreDuplicates: true },
    );
  }
}

export async function unfollowUser(
  followerId: string,
  followeeId: string,
): Promise<void> {
  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);
}

/** The followee approves an incoming request. */
export async function acceptFollowRequest(
  followerId: string,
  followeeId: string,
): Promise<void> {
  await supabase
    .from('follows')
    .update({ status: 'accepted' })
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);
}

/** The followee rejects (removes) an incoming request. */
export async function rejectFollowRequest(
  followerId: string,
  followeeId: string,
): Promise<void> {
  await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);
}
