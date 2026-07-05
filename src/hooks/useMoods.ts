import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MediaType, Movie } from '@/api/types';
import { collectionRepository, movieRepository } from '@/repositories';

/** All the user's mood shelves (with counts). */
export function useMoods() {
  return useQuery({
    queryKey: ['moods'],
    queryFn: () => collectionRepository.list(),
  });
}

/** A single mood by id (for a mood's header). */
export function useMood(id: number | null) {
  return useQuery({
    queryKey: ['mood-summary', id],
    queryFn: () => collectionRepository.get(id as number),
    enabled: id != null,
  });
}

/** The titles inside one mood. */
export function useMoodMovies(id: number | null) {
  return useQuery({
    queryKey: ['mood', id],
    queryFn: () => collectionRepository.getMovies(id as number),
    enabled: id != null,
  });
}

/** Which moods a given title belongs to (for the add-to-mood checkboxes). */
export function useMoodIdsForMovie(movieId: string, mediaType: MediaType) {
  return useQuery({
    queryKey: ['mood-ids', mediaType, movieId],
    queryFn: () => collectionRepository.getMoodIdsForMovie(movieId, mediaType),
  });
}

/**
 * Create / rename / delete moods and add / remove titles, keeping every mood
 * query fresh afterwards.
 */
export function useMoodMutations() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['moods'] });
    queryClient.invalidateQueries({ queryKey: ['mood'] });
    queryClient.invalidateQueries({ queryKey: ['mood-summary'] });
    queryClient.invalidateQueries({ queryKey: ['mood-ids'] });
  }, [queryClient]);

  const createMood = useCallback(
    async (name: string) => {
      const id = await collectionRepository.create(name);
      invalidate();
      return id;
    },
    [invalidate],
  );

  const updateMood = useCallback(
    async (id: number, name: string) => {
      await collectionRepository.update(id, name);
      invalidate();
    },
    [invalidate],
  );

  const deleteMood = useCallback(
    async (id: number) => {
      await collectionRepository.remove(id);
      invalidate();
    },
    [invalidate],
  );

  const addToMood = useCallback(
    async (id: number, movieId: string, mediaType: MediaType) => {
      await collectionRepository.addItem(id, movieId, mediaType);
      invalidate();
    },
    [invalidate],
  );

  // Adds a full movie (caching it first, so titles coming from search/discover
  // that aren't on a shelf yet still satisfy the collection_items foreign key).
  const addMovieToMood = useCallback(
    async (id: number, movie: Movie) => {
      await movieRepository.upsert(movie);
      await collectionRepository.addItem(id, movie.id, movie.mediaType);
      invalidate();
    },
    [invalidate],
  );

  const removeFromMood = useCallback(
    async (id: number, movieId: string, mediaType: MediaType) => {
      await collectionRepository.removeItem(id, movieId, mediaType);
      invalidate();
    },
    [invalidate],
  );

  return { createMood, updateMood, deleteMood, addToMood, addMovieToMood, removeFromMood };
}
