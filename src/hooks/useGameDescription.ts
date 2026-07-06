import { useQuery } from '@tanstack/react-query';
import { fetchGameDescription } from '@/api/rawg';

/**
 * Lazily loads a game's description from RAWG (only when the details view for a
 * game is open, since the list endpoint doesn't include it). Cached for an hour.
 */
export function useGameDescription(gameId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['game-description', gameId],
    queryFn: () => fetchGameDescription(gameId),
    enabled: enabled && gameId.length > 0,
    staleTime: 1000 * 60 * 60,
  });
}
