import { useQuery } from '@tanstack/react-query';
import { getFilmMatchGroups } from '@/api/matches';
import { hasSupabase } from '@/api/supabase';
import { MediaType } from '@/api/types';
import { useAuth } from '@/context/AuthProvider';

/** Followees who love (favorite) or want to see (watchlist) this title. */
export function useFilmMatchGroups(movieId: string, mediaType: MediaType) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['film-match-groups', mediaType, movieId, userId],
    queryFn: () => getFilmMatchGroups(userId as string, mediaType, movieId),
    enabled: hasSupabase && !!userId && movieId.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
