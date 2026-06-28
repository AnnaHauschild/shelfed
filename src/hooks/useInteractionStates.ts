import { useQuery } from '@tanstack/react-query';
import { useMediaType } from '@/context/MediaTypeProvider';
import { InteractionType, interactionRepository } from '@/repositories';

/**
 * Reactive view of which interaction types each movie currently has, so any
 * screen can show filled stars/hearts and reflect changes immediately. Backed
 * by one small query that mutations invalidate via the ['interaction-states']
 * key.
 */
export function useInteractionStates() {
  const mediaType = useMediaType();
  const { data } = useQuery({
    queryKey: ['interaction-states', mediaType],
    queryFn: () => interactionRepository.getStateMap(mediaType),
  });

  const has = (id: string, type: InteractionType): boolean =>
    data?.get(id)?.has(type) ?? false;

  return {
    isWatched: (id: string) => has(id, 'watched'),
    isWatchlisted: (id: string) => has(id, 'watchlist'),
    isFavorite: (id: string) => has(id, 'favorite'),
  };
}
