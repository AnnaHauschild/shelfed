import { useQuery } from '@tanstack/react-query';
import { fetchWatchProviders } from '@/api/movies';
import { hasTmdbToken } from '@/api/tmdb';
import { MediaType } from '@/api/types';

/**
 * Loads streaming availability (TMDB watch/providers) for a movie or series.
 * Disabled for books and in demo mode. Cached for an hour.
 */
export function useWatchProviders(id: string, mediaType: MediaType) {
  return useQuery({
    queryKey: ['watch', mediaType, id],
    queryFn: () => fetchWatchProviders(id, mediaType),
    enabled: hasTmdbToken() && mediaType !== 'book' && id.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
