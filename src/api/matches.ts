import { supabase } from './supabase';
import { getFollowingIds, UserSummary } from './follows';
import { MediaType } from './types';

/**
 * Followees who have this title in their Favorites — a "match". Relies on the
 * shelf_items SELECT policy that lets a follower read a followee's rows.
 */
export async function getFilmMatches(
  userId: string,
  mediaType: MediaType,
  movieId: string,
): Promise<UserSummary[]> {
  const followeeIds = await getFollowingIds(userId);
  if (followeeIds.length === 0) return [];
  const { data } = await supabase
    .from('shelf_items')
    .select('user_id')
    .eq('media_type', mediaType)
    .eq('movie_id', movieId)
    .eq('type', 'favorite')
    .in('user_id', followeeIds);
  const ids = Array.from(new Set((data ?? []).map((r) => r.user_id)));
  if (ids.length === 0) return [];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', ids);
  return (profiles ?? [])
    .filter((r) => r.username)
    .map((r) => ({ id: r.id, username: r.username as string }));
}

/**
 * For a batch of titles, which followees favourited each — keyed by movie id.
 * One round-trip for a whole list (e.g. search results), so we can badge rows.
 */
export async function getFolloweeFavorites(
  userId: string,
  mediaType: MediaType,
  movieIds: string[],
): Promise<Record<string, string[]>> {
  if (movieIds.length === 0) return {};
  const followeeIds = await getFollowingIds(userId);
  if (followeeIds.length === 0) return {};
  const { data } = await supabase
    .from('shelf_items')
    .select('user_id, movie_id')
    .eq('media_type', mediaType)
    .eq('type', 'favorite')
    .in('user_id', followeeIds)
    .in('movie_id', movieIds);
  if (!data || data.length === 0) return {};
  const uniqueUsers = Array.from(new Set(data.map((r) => r.user_id)));
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', uniqueUsers);
  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id, p.username as string]),
  );
  const byMovie: Record<string, string[]> = {};
  for (const r of data) {
    const name = nameById.get(r.user_id);
    if (!name) continue;
    (byMovie[r.movie_id] ??= []).push(name);
  }
  return byMovie;
}
