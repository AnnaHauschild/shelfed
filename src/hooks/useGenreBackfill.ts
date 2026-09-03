import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MediaType } from '@/api/types';
import { fetchMediaById } from '@/api/movies';
import { movieRepository } from '@/repositories';

/** Titles repaired per attempt, so a large shelf does not hammer the APIs. */
const BATCH = 30;

/**
 * Shelf rows restored from the cloud arrive without genres, which leaves the
 * category chips empty. Refetches the real metadata when a shelf shows titles
 * but no categories at all, once per media type and app session.
 */
export function useGenreBackfill(mediaType: MediaType, needed: boolean): void {
  const queryClient = useQueryClient();
  const attempted = useRef(new Set<MediaType>());

  useEffect(() => {
    if (!needed || attempted.current.has(mediaType)) return;
    attempted.current.add(mediaType);
    let cancelled = false;

    (async () => {
      try {
        const ids = await movieRepository.findWithoutGenres(BATCH, mediaType);
        let repaired = 0;
        for (const id of ids) {
          if (cancelled) return;
          const full = await fetchMediaById(mediaType, id).catch(() => null);
          if (!full) continue;
          await movieRepository.upsert({ ...full, id, mediaType });
          repaired++;
        }
        if (cancelled || repaired === 0) return;
        queryClient.invalidateQueries({ queryKey: ['shelf'] });
      } catch {
        // best-effort; the shelf still renders, only the chips stay empty
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mediaType, needed, queryClient]);
}
