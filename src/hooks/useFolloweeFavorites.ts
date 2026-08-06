import { useQuery } from '@tanstack/react-query';
import { getFolloweeFavorites } from '@/api/matches';
import { hasSupabase } from '@/api/supabase';
import { MediaType } from '@/api/types';
import { useAuth } from '@/context/AuthProvider';

/**
 * Map of movieId -> followee usernames who favourited it, for a batch of ids
 * (e.g. the current search results). Empty unless signed in.
 */
export function useFolloweeFavorites(mediaType: MediaType, movieIds: string[]) {
  const { userId } = useAuth();
  const ids = [...movieIds].sort();
  return useQuery({
    queryKey: ['followee-favorites', mediaType, userId, ids.join(',')],
    queryFn: () => getFolloweeFavorites(userId as string, mediaType, ids),
    enabled: hasSupabase && !!userId && ids.length > 0,
    staleTime: 1000 * 60,
  });
}
