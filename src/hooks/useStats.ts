import { useQuery } from '@tanstack/react-query';
import { interactionRepository } from '@/repositories';

/**
 * Watched-shelf statistics (counts per media type + genre breakdown), read from
 * the local SQLite store. Pass the Settings sheet's visibility so it only runs
 * (and refetches fresh) while the stats are on screen.
 */
export function useStats(enabled: boolean) {
  return useQuery({
    queryKey: ['watched-stats'],
    queryFn: () => interactionRepository.getStats(),
    enabled,
    staleTime: 0,
  });
}
