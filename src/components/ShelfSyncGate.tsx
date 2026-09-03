import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Movie } from '@/api/types';
import { fetchMediaById } from '@/api/movies';
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

/** How many placeholder rows to repair per app start. */
const BACKFILL_LIMIT = 30;

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
 * Replaces the neutral defaults of restored rows with the real metadata.
 * Without this a synced shelf has no genres, no rating and no description, so
 * the category chips and the rating sort silently come up empty on the second
 * device. Returns how many rows were repaired.
 */
async function backfillPlaceholders(isCancelled: () => boolean): Promise<number> {
  const pending = await movieRepository.findPlaceholders(BACKFILL_LIMIT);
  let repaired = 0;
  for (const row of pending) {
    if (isCancelled()) break;
    const full = await fetchMediaById(row.mediaType, row.id).catch(() => null);
    if (!full) continue;
    await movieRepository.upsert({ ...full, id: row.id, mediaType: row.mediaType });
    repaired++;
  }
  return repaired;
}

/**
 * Two-way shelf sync, run once per sign-in: upload the local shelves, then
 * restore any cloud items missing locally (cross-device). Best-effort and
 * offline-safe — failures never block the app. Mounted once at the app root.
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
          await movieRepository.upsert(minimalMovie(item));
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
        const repaired = await backfillPlaceholders(() => cancelled);
        if (cancelled) return;
        if (switchedAccount) {
          // Shelves, moods, notes and stats all changed: refresh everything.
          queryClient.invalidateQueries();
        } else if (restored > 0 || repaired > 0) {
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
