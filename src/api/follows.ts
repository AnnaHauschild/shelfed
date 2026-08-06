import { supabase } from './supabase';

/** A minimal public user, for search results and following lists. */
export interface UserSummary {
  id: string;
  username: string;
}

/** Case-insensitive username search, excluding the current user. */
export async function searchUsers(
  query: string,
  excludeId: string,
): Promise<UserSummary[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const { data } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', `%${q}%`)
    .neq('id', excludeId)
    .not('username', 'is', null)
    .limit(20);
  return (data ?? [])
    .filter((r) => r.username)
    .map((r) => ({ id: r.id, username: r.username as string }));
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
  const { data } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', ids);
  return (data ?? [])
    .filter((r) => r.username)
    .map((r) => ({ id: r.id, username: r.username as string }));
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
