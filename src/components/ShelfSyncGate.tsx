import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Movie } from '@/api/types';
import { ShelfItem, isShelfType, pullShelf, pushMany } from '@/api/shelfSync';
import { interactionRepository, movieRepository } from '@/repositories';
import { useAuth } from '@/context/AuthProvider';

/** A cloud shelf item lacks full metadata; fill the rest with neutral defaults. */
function minimalMovie(item: ShelfItem): Movie {
  return {
    id: item.movieId,
    title: item.title,
    year: item.year,
    genreIds: [],
    genres: [],
    posterPath: item.posterPath,
    backdropPath: null,
    overview: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    mediaType: item.mediaType,
  };
}

/**
 * Two-way shelf sync, run once per sign-in: upload the local shelves, then
 * restore any cloud items missing locally (cross-device). Best-effort and
 * offline-safe — failures never block the app. Mounted once at the app root.
 */
export function ShelfSyncGate() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const synced = useRef<string | null>(null);

  useEffect(() => {
    if (!userId || synced.current === userId) return;
    synced.current = userId;
    let cancelled = false;

    (async () => {
      try {
        const local = await interactionRepository.getSyncItems();
        const toUpload: ShelfItem[] = local
          .filter((i) => isShelfType(i.type))
          .map((i) => ({
            mediaType: i.mediaType,
            movieId: i.movieId,
            type: i.type as ShelfItem['type'],
            title: i.title,
            posterPath: i.posterPath,
            year: i.year,
          }));
        await pushMany(userId, toUpload);

        const cloud = await pullShelf(userId);
        let restored = 0;
        for (const item of cloud) {
          if (cancelled) return;
          const exists = await interactionRepository.has(
            item.movieId,
            item.type,
            item.mediaType,
          );
          if (exists) continue;
          await movieRepository.upsert(minimalMovie(item));
          await interactionRepository.add(
            item.movieId,
            item.type,
            item.mediaType,
            'sync',
          );
          restored++;
        }
        if (restored > 0 && !cancelled) {
          queryClient.invalidateQueries({ queryKey: ['shelf'] });
          queryClient.invalidateQueries({ queryKey: ['interaction-states'] });
        }
      } catch {
        // best-effort; local SQLite remains the source of truth
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, queryClient]);

  return null;
}
