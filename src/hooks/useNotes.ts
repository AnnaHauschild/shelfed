import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MediaType } from '@/api/types';
import { noteRepository } from '@/repositories';

/** The free-text note for a title (empty string when none). */
export function useNote(movieId: string, mediaType: MediaType) {
  return useQuery({
    queryKey: ['note', mediaType, movieId],
    queryFn: () => noteRepository.get(movieId, mediaType),
    enabled: movieId.length > 0,
  });
}

/** Saves a title's note and refreshes its query. */
export function useSaveNote() {
  const queryClient = useQueryClient();
  return useCallback(
    async (movieId: string, mediaType: MediaType, text: string) => {
      await noteRepository.set(movieId, mediaType, text);
      queryClient.invalidateQueries({ queryKey: ['note', mediaType, movieId] });
    },
    [queryClient],
  );
}
