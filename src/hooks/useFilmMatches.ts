import { useQuery } from '@tanstack/react-query';
import { getFilmMatches } from '@/api/matches';
import { hasSupabase } from '@/api/supabase';
import { MediaType } from '@/api/types';
import { useAuth } from '@/context/AuthProvider';

/** Followees who also favourited this title (empty unless signed in). */
export function useFilmMatches(movieId: string, mediaType: MediaType) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ['film-matches', mediaType, movieId, userId],
    queryFn: () => getFilmMatches(userId as string, mediaType, movieId),
    enabled: hasSupabase && !!userId && movieId.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
