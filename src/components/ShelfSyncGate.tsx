import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Movie } from '@/api/types';
import { ShelfItem, isShelfType, pullShelf, pushMany } from '@/api/shelfSync';
import {
  collectionRepository,
  episodeRepository,
  interactionRepository,
  movieRepository,
  noteRepository,
} from '@/repositories';
import { getSetting, setSetting } from '@/db/settings';
import { useAuth } from '@/context/AuthProvider';

/** Which account the shelves currently stored on this device belong to. */
const LAST_SYNCED_USER_KEY = 'lastSyncedUserId';

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
 *
 * Restored rows carry no genres or rating; useGenreBackfill repairs those the
 * next time a shelf is opened.
 *
 * When a DIFFERENT account signs in, the local shelves belong to the previous
 * user, so they are cleared first and never uploaded to the new account.
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
        const previousUserId = await getSetting(LAST_SYNCED_USER_KEY);
        const switchedAccount = !!previousUserId && previousUserId !== userId;

        if (switchedAccount) {
          await interactionRepository.clearAll();
          await collectionRepository.clearAll();
          await noteRepository.clearAll();
          await episodeRepository.clearAll();
        } else {
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
        }

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
          // Never upsert here: clearAll() drops the interactions but keeps the
          // movies table, so a plain upsert would replace real metadata with
          // these placeholders.
          await movieRepository.insertIfAbsent(minimalMovie(item));
          await interactionRepository.add(
            item.movieId,
            item.type,
            item.mediaType,
            'sync',
          );
          restored++;
        }
        if (cancelled) return;
        await setSetting(LAST_SYNCED_USER_KEY, userId);
        if (switchedAccount) {
          // Shelves, moods, notes and stats all changed: refresh everything.
          queryClient.invalidateQueries();
        } else if (restored > 0) {
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
