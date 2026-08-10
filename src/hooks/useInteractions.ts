import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { MediaType, Movie } from '@/api/types';
import {
  InteractionType,
  interactionRepository,
  movieRepository,
} from '@/repositories';
import { isShelfType, pushItem, removeItem } from '@/api/shelfSync';
import { useAuth } from '@/context/AuthProvider';
import { useMatchCelebration } from '@/context/MatchCelebrationProvider';

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
  const { userId } = useAuth();
  const { celebrate } = useMatchCelebration();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['shelf'] });
    queryClient.invalidateQueries({ queryKey: ['interaction-states'] });
  }, [queryClient]);

  const record = useCallback(
    async (movie: Movie, type: InteractionType, source = 'swipe') => {
      await movieRepository.upsert(movie);
      await interactionRepository.add(movie.id, type, movie.mediaType, source);
      if (userId && isShelfType(type)) {
        pushItem(userId, movie, type).catch(() => {});
      }
      invalidate();
    },
    [invalidate, userId],
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
        if (userId && isShelfType(type)) {
          removeItem(userId, movie.mediaType, movie.id, type).catch(() => {});
        }
      } else {
        await movieRepository.upsert(movie);
        await interactionRepository.add(movie.id, type, movie.mediaType, source);
        if (userId && isShelfType(type)) {
          pushItem(userId, movie, type).catch(() => {});
        }
      }
      invalidate();
      return !exists;
    },
    [invalidate, userId],
  );

  /** Removes a single (movie, type) signal from any list. */
  const removeInteraction = useCallback(
    async (movieId: string, type: InteractionType, mediaType: MediaType) => {
      await interactionRepository.remove(movieId, type, mediaType);
      if (userId && isShelfType(type)) {
        removeItem(userId, mediaType, movieId, type).catch(() => {});
      }
      invalidate();
    },
    [invalidate, userId],
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
    async (movie: Movie) => {
      Haptics.selectionAsync();
      const added = await toggle(movie, 'watchlist', 'button');
      if (added) celebrate(movie, 'watchlist');
      return added;
    },
    [toggle, celebrate],
  );

  const toggleFavorite = useCallback(
    async (movie: Movie) => {
      Haptics.selectionAsync();
      const added = await toggle(movie, 'favorite', 'button');
      if (added) celebrate(movie, 'favorite');
      return added;
    },
    [toggle, celebrate],
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

  /** Swipe UP — add to the Wishlist (idempotent add, not a toggle). */
  const wishlistSwipe = useCallback(
    (movie: Movie) => {
      Haptics.selectionAsync();
      return record(movie, 'watchlist', 'swipe');
    },
    [record],
  );

  /** Swipe DOWN — add to Watched AND Favorites at once. */
  const watchedFavoriteSwipe = useCallback(
    async (movie: Movie) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await record(movie, 'watched', 'swipe');
      await record(movie, 'favorite', 'swipe');
    },
    [record],
  );

  return {
    markWatched,
    skip,
    toggleWatchlist,
    toggleFavorite,
    toggleWatched,
    wishlistSwipe,
    watchedFavoriteSwipe,
    removeInteraction,
    undo,
  };
}
