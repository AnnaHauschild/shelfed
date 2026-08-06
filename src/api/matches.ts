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
