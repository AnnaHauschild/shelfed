import { useQuery } from '@tanstack/react-query';
import { useMediaType } from '@/context/MediaTypeProvider';
import { InteractionType, interactionRepository } from '@/repositories';

/**
 * Reads a single shelf (watched / watchlist / favorite) from local storage.
 * Kept in React Query so it auto-refreshes when interactions are recorded
 * (those mutations invalidate the ['shelf'] key).
 */
export function useShelf(type: InteractionType) {
  const mediaType = useMediaType();
  return useQuery({
    queryKey: ['shelf', mediaType, type],
    queryFn: () => interactionRepository.getMoviesByType(type, mediaType),
  });
}
