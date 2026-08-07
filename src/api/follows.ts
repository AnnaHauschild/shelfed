import { supabase } from './supabase';

/** A minimal public user, for search results and following lists. */
export interface UserSummary {
  id: string;
  username: string;
  avatarUrl?: string | null;
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

/** The profiles the given user follows. */
export async function getFollowing(userId: string): Promise<UserSummary[]> {
  const ids = await getFollowingIds(userId);
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

export async function followUser(
  followerId: string,
  followeeId: string,
): Promise<void> {
  await supabase
    .from('follows')
    .upsert({ follower_id: followerId, followee_id: followeeId });
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
