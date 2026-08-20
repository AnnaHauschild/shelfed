import { useQuery } from '@tanstack/react-query';
import { fetchTitleMeta } from '@/api/movies';
import { hasTmdbToken } from '@/api/tmdb';
import { MediaType } from '@/api/types';

/**
 * Loads a title's director/creator + production countries for the details card.
 * Movies/TV only; disabled in demo mode and cached for an hour.
 */
export function useTitleMeta(movieId: string, mediaType: MediaType) {
  return useQuery({
    queryKey: ['title-meta', mediaType, movieId],
    queryFn: () => fetchTitleMeta(movieId, mediaType),
    enabled:
      hasTmdbToken() &&
      (mediaType === 'movie' || mediaType === 'tv') &&
      movieId.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
