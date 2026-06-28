import { useQuery } from '@tanstack/react-query';
import { getGenreOptions } from '@/api/movies';
import { MediaType } from '@/api/types';

/**
 * Selectable genres for the Discover filter. For movies/series these are TMDB
 * genres; for books they are the Open Library subjects we browse. Cached per
 * category for the session.
 */
export function useGenres(mediaType: MediaType) {
  return useQuery({
    queryKey: ['genres', mediaType],
    queryFn: () => getGenreOptions(mediaType),
    staleTime: 1000 * 60 * 60,
  });
}
