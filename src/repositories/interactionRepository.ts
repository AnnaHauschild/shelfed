import { MediaType } from '@/api/types';
import { getDatabase } from '@/db/database';
import { MovieRow, rowToStoredMovie } from './mappers';
import {
  InteractionRepository,
  InteractionType,
  RecommendationSignals,
  StoredMovie,
} from './types';

/**
 * SQLite-backed store for all user interactions. Each (movie, type) pair is
 * unique, so re-recording the same signal just refreshes its timestamp.
 */
export const interactionRepository: InteractionRepository = {
  async add(
    movieId: string,
    type: InteractionType,
    mediaType: MediaType,
    source: string = 'swipe',
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO interactions (media_type, movie_id, type, created_at, source)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(media_type, movie_id, type)
         DO UPDATE SET created_at = excluded.created_at, source = excluded.source;`,
      [mediaType, movieId, type, Date.now(), source],
    );
  },

  async remove(
    movieId: string,
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'DELETE FROM interactions WHERE media_type = ? AND movie_id = ? AND type = ?',
      [mediaType, movieId, type],
    );
  },

  async getMoviesByType(
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<StoredMovie[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MovieRow>(
      `SELECT m.* FROM movies m
         INNER JOIN interactions i
           ON i.movie_id = m.id AND i.media_type = m.media_type
       WHERE i.type = ? AND i.media_type = ?
       ORDER BY i.created_at DESC;`,
      [type, mediaType],
    );
    return rows.map(rowToStoredMovie);
  },

  async getSeenIds(mediaType: MediaType): Promise<Set<string>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ movie_id: string | number }>(
      'SELECT DISTINCT movie_id FROM interactions WHERE media_type = ?;',
      [mediaType],
    );
    return new Set(rows.map((r) => String(r.movie_id)));
  },

  async has(
    movieId: string,
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ one: number }>(
      'SELECT 1 AS one FROM interactions WHERE media_type = ? AND movie_id = ? AND type = ? LIMIT 1;',
      [mediaType, movieId, type],
    );
    return row != null;
  },

  async getStateMap(
    mediaType: MediaType,
  ): Promise<Map<string, Set<InteractionType>>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      movie_id: string | number;
      type: InteractionType;
    }>(
      'SELECT movie_id, type FROM interactions WHERE media_type = ?;',
      [mediaType],
    );
    const map = new Map<string, Set<InteractionType>>();
    for (const row of rows) {
      const id = String(row.movie_id);
      let set = map.get(id);
      if (!set) {
        set = new Set<InteractionType>();
        map.set(id, set);
      }
      set.add(row.type);
    }
    return map;
  },

  async exportSignals(mediaType: MediaType): Promise<RecommendationSignals> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      movie_id: string | number;
      type: InteractionType;
    }>(
      'SELECT movie_id, type FROM interactions WHERE media_type = ?;',
      [mediaType],
    );

    const signals: RecommendationSignals = {
      watched: [],
      favorites: [],
      watchlist: [],
      skipped: [],
    };

    for (const row of rows) {
      const id = String(row.movie_id);
      switch (row.type) {
        case 'watched':
          signals.watched.push(id);
          break;
        case 'favorite':
          signals.favorites.push(id);
          break;
        case 'watchlist':
          signals.watchlist.push(id);
          break;
        case 'skipped':
          signals.skipped.push(id);
          break;
      }
    }

    return signals;
  },
};
