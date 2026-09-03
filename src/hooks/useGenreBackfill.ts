import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MediaType } from '@/api/types';
import { fetchMediaById } from '@/api/movies';
import { movieRepository } from '@/repositories';

/** Titles fetched per round, so a large shelf does not hammer the APIs. */
const BATCH = 25;
/** Hard stop, so a shelf full of titles the API cannot resolve ends the loop. */
const MAX_TITLES = 300;

/**
 * Shelf rows restored from the cloud arrive without genres, which leaves the
 * category chips empty. Refetches the real metadata for those titles, once per
 * media type and app session, and stops as soon as a round repairs nothing.
 */
export function useGenreBackfill(mediaType: MediaType, needed: boolean): void {
  const queryClient = useQueryClient();
  const attempted = useRef(new Set<MediaType>());

  useEffect(() => {
    if (!needed || attempted.current.has(mediaType)) return;
    attempted.current.add(mediaType);
    let cancelled = false;

    (async () => {
      let seen = 0;
      let repairedTotal = 0;
      try {
        while (!cancelled && seen < MAX_TITLES) {
          const ids = await movieRepository.findWithoutGenres(BATCH, mediaType);
          if (ids.length === 0) break;
          seen += ids.length;

          let repaired = 0;
          for (const id of ids) {
            if (cancelled) return;
            const full = await fetchMediaById(mediaType, id).catch(() => null);
            if (!full || full.genres.length === 0) continue;
            await movieRepository.upsert({ ...full, id, mediaType });
            repaired++;
          }
          repairedTotal += repaired;
          // Whatever is left in this round has no genres to fetch; another
          // round would only ask for the same ids again.
          if (repaired < ids.length) break;
        }
      } catch {
        // best-effort; the shelf still renders, only the chips stay empty
      }
      if (!cancelled && repairedTotal > 0) {
        queryClient.invalidateQueries({ queryKey: ['shelf'] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mediaType, needed, queryClient]);
}
