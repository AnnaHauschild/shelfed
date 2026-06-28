import { useQuery } from '@tanstack/react-query';
import { fetchMovieCast } from '@/api/movies';
import { hasTmdbToken } from '@/api/tmdb';
import { MediaType } from '@/api/types';

/**
 * Loads the top-billed cast for a movie. Disabled in demo mode (no token) and
 * cached for an hour, since a film's cast never changes within a session.
 */
export function useMovieCast(movieId: string, mediaType: MediaType) {
  return useQuery({
    queryKey: ['cast', mediaType, movieId],
    queryFn: () => fetchMovieCast(movieId, mediaType),
    enabled: hasTmdbToken() && mediaType !== 'book' && movieId.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
