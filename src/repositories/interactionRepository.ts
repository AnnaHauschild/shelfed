import { MediaType } from '@/api/types';
import { getDatabase } from '@/db/database';
import { MovieRow, rowToStoredMovie, safeParseArray } from './mappers';
import {
  InteractionRepository,
  InteractionType,
  RecommendationSignals,
  StoredMovie,
  SyncShelfItem,
  WatchedStats,
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

  async getSyncItems(): Promise<SyncShelfItem[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      media_type: string;
      movie_id: string | number;
      type: string;
      title: string;
      poster_path: string | null;
      year: number | null;
    }>(
      `SELECT i.media_type AS media_type, i.movie_id AS movie_id, i.type AS type,
              m.title AS title, m.poster_path AS poster_path, m.year AS year
         FROM interactions i
         INNER JOIN movies m
           ON m.id = i.movie_id AND m.media_type = i.media_type
        WHERE i.type IN ('watched', 'watchlist', 'favorite');`,
    );
    return rows.map((r) => ({
      mediaType: r.media_type as MediaType,
      movieId: String(r.movie_id),
      type: r.type as InteractionType,
      title: r.title,
      posterPath: r.poster_path,
      year: r.year,
    }));
  },

  async getStats(): Promise<WatchedStats> {
    const db = await getDatabase();
    const typeRows = await db.getAllAsync<{ media_type: string; n: number }>(
      "SELECT media_type, COUNT(*) AS n FROM interactions WHERE type = 'watched' GROUP BY media_type;",
    );
    const genreRows = await db.getAllAsync<{ media_type: string; genres: string }>(
      `SELECT m.media_type AS media_type, m.genres AS genres FROM movies m
         INNER JOIN interactions i
           ON i.movie_id = m.id AND i.media_type = m.media_type
       WHERE i.type = 'watched';`,
    );
    const byType: Record<MediaType, number> = {
      movie: 0,
      tv: 0,
      book: 0,
      game: 0,
    };
    let totalWatched = 0;
    for (const r of typeRows) {
      if (r.media_type in byType) byType[r.media_type as MediaType] = r.n;
      totalWatched += r.n;
    }
    const countsByType: Record<MediaType, Map<string, number>> = {
      movie: new Map(),
      tv: new Map(),
      book: new Map(),
      game: new Map(),
    };
    for (const r of genreRows) {
      if (!(r.media_type in countsByType)) continue;
      const counts = countsByType[r.media_type as MediaType];
      for (const g of safeParseArray<string>(r.genres)) {
        counts.set(g, (counts.get(g) ?? 0) + 1);
      }
    }
    const genresByType = {} as WatchedStats['genresByType'];
    (Object.keys(countsByType) as MediaType[]).forEach((mt) => {
      genresByType[mt] = Array.from(countsByType[mt], ([name, count]) => ({
        name,
        count,
      })).sort((a, b) => b.count - a.count);
    });
    return { byType, totalWatched, genresByType };
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
