import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { MediaType, Movie } from '@/api/types';
import {
  InteractionType,
  interactionRepository,
  movieRepository,
} from '@/repositories';

/**
 * Records user interactions and keeps caches/shelves in sync.
 *
 * The flow for every signal is:
 *   1. Upsert the movie into the local cache (so shelves can render it offline).
 *   2. Insert the interaction row.
 *   3. Invalidate the shelf + interaction-state queries so screens refresh.
 *
 * Mapping to the product:
 *   - swipe RIGHT  -> markWatched     (the core Watched Shelf)
 *   - swipe LEFT   -> skip            (negative signal, hidden from shelves)
 *   - Star button  -> toggleWatchlist
 *   - Heart button -> toggleFavorite
 *
 * The toggles add the signal if absent and remove it if present, so the same
 * button both marks and un-marks a movie (used by the cards, the details modal
 * and the search results).
 */
export function useInteractions() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['shelf'] });
    queryClient.invalidateQueries({ queryKey: ['interaction-states'] });
  }, [queryClient]);

  const record = useCallback(
    async (movie: Movie, type: InteractionType, source = 'swipe') => {
      await movieRepository.upsert(movie);
      await interactionRepository.add(movie.id, type, movie.mediaType, source);
      invalidate();
    },
    [invalidate],
  );

  /** Adds the signal if missing, removes it if present. Returns the new state. */
  const toggle = useCallback(
    async (movie: Movie, type: InteractionType, source = 'button') => {
      const exists = await interactionRepository.has(
        movie.id,
        type,
        movie.mediaType,
      );
      if (exists) {
        await interactionRepository.remove(movie.id, type, movie.mediaType);
      } else {
        await movieRepository.upsert(movie);
        await interactionRepository.add(movie.id, type, movie.mediaType, source);
      }
      invalidate();
      return !exists;
    },
    [invalidate],
  );

  /** Removes a single (movie, type) signal from any list. */
  const removeInteraction = useCallback(
    async (movieId: string, type: InteractionType, mediaType: MediaType) => {
      await interactionRepository.remove(movieId, type, mediaType);
      invalidate();
    },
    [invalidate],
  );

  const markWatched = useCallback(
    (movie: Movie) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return record(movie, 'watched', 'swipe');
    },
    [record],
  );

  const skip = useCallback(
    (movie: Movie) => record(movie, 'skipped', 'swipe'),
    [record],
  );

  const toggleWatchlist = useCallback(
    (movie: Movie) => {
      Haptics.selectionAsync();
      return toggle(movie, 'watchlist', 'button');
    },
    [toggle],
  );

  const toggleFavorite = useCallback(
    (movie: Movie) => {
      Haptics.selectionAsync();
      return toggle(movie, 'favorite', 'button');
    },
    [toggle],
  );

  const toggleWatched = useCallback(
    (movie: Movie) => {
      Haptics.selectionAsync();
      return toggle(movie, 'watched', 'button');
    },
    [toggle],
  );

  /** Reverses a swipe: removes the recorded signal so the card returns. */
  const undo = useCallback(
    (movieId: string, type: InteractionType, mediaType: MediaType) =>
      removeInteraction(movieId, type, mediaType),
    [removeInteraction],
  );

  return {
    markWatched,
    skip,
    toggleWatchlist,
    toggleFavorite,
    toggleWatched,
    removeInteraction,
    undo,
  };
}
