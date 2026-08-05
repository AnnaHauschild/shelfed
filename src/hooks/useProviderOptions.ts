import { useQuery } from '@tanstack/react-query';
import { fetchProviderOptions } from '@/api/movies';
import { MediaType } from '@/api/types';

/**
 * Region-specific streaming services (device locale) for the Discover
 * "Streaming" filter. Movie/TV only; the list rarely changes so it's cached
 * hard for the session.
 */
export function useProviderOptions(mediaType: MediaType) {
  return useQuery({
    queryKey: ['provider-options', mediaType],
    queryFn: () => fetchProviderOptions(mediaType),
    enabled: mediaType === 'movie' || mediaType === 'tv',
    staleTime: 1000 * 60 * 60 * 24,
  });
}
