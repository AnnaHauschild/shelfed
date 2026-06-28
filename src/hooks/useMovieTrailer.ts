import { useQuery } from '@tanstack/react-query';
import { fetchMovieTrailer } from '@/api/movies';
import { hasTmdbToken } from '@/api/tmdb';
import { MediaType } from '@/api/types';

/**
 * Loads the best YouTube trailer URL for a movie. Disabled in demo mode (no
 * token) and cached for an hour, since a film's trailers don't change.
 */
export function useMovieTrailer(movieId: string, mediaType: MediaType) {
  return useQuery({
    queryKey: ['trailer', mediaType, movieId],
    queryFn: () => fetchMovieTrailer(movieId, mediaType),
    enabled: hasTmdbToken() && mediaType !== 'book' && movieId.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
