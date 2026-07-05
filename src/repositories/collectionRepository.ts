import { MediaType } from '@/api/types';
import { getDatabase } from '@/db/database';
import { MovieRow, rowToStoredMovie } from './mappers';
import { StoredMovie } from './types';

/** A user-defined mood shelf with its current item count. */
export interface MoodSummary {
  id: number;
  name: string;
  emoji: string;
  count: number;
}

interface MoodRow {
  id: number;
  name: string;
  emoji: string;
  count: number;
}

/**
 * SQLite-backed store for "Moods" — the user's own curated shelves. Each mood is
 * a subset of the watched shelf; items reference the cached `movies` rows, so a
 * mood renders fully offline.
 */
export const collectionRepository = {
  /** All moods, newest first, with how many titles each holds. */
  async list(): Promise<MoodSummary[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MoodRow>(
      `SELECT c.id, c.name, c.emoji,
              COUNT(ci.movie_id) AS count
         FROM collections c
         LEFT JOIN collection_items ci ON ci.collection_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.created_at DESC;`,
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      count: r.count,
    }));
  },

  /** A single mood by id (with its item count), or null if it was deleted. */
  async get(id: number): Promise<MoodSummary | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MoodRow>(
      `SELECT c.id, c.name, c.emoji,
              COUNT(ci.movie_id) AS count
         FROM collections c
         LEFT JOIN collection_items ci ON ci.collection_id = c.id
        WHERE c.id = ?
        GROUP BY c.id;`,
      [id],
    );
    return row
      ? { id: row.id, name: row.name, emoji: row.emoji, count: row.count }
      : null;
  },

  /** Creates a mood and returns its new id. */
  async create(name: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO collections (name, emoji, sort_order, created_at)
       VALUES (?, '', ?, ?);`,
      [name.trim(), Date.now(), Date.now()],
    );
    return result.lastInsertRowId as number;
  },

  /** Renames a mood. */
  async update(id: number, name: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE collections SET name = ? WHERE id = ?;', [
      name.trim(),
      id,
    ]);
  },

  /** Deletes a mood (its items cascade away). */
  async remove(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM collections WHERE id = ?;', [id]);
  },

  /** The titles in a mood, most recently added first. */
  async getMovies(id: number): Promise<StoredMovie[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<MovieRow>(
      `SELECT m.* FROM movies m
         INNER JOIN collection_items ci
           ON ci.movie_id = m.id AND ci.media_type = m.media_type
        WHERE ci.collection_id = ?
        ORDER BY ci.added_at DESC;`,
      [id],
    );
    return rows.map(rowToStoredMovie);
  },

  /** Adds a title to a mood (no-op if already present). */
  async addItem(
    id: number,
    movieId: string,
    mediaType: MediaType,
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO collection_items (collection_id, media_type, movie_id, added_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(collection_id, media_type, movie_id) DO NOTHING;`,
      [id, mediaType, movieId, Date.now()],
    );
  },

  /** Removes a title from a mood. */
  async removeItem(
    id: number,
    movieId: string,
    mediaType: MediaType,
  ): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `DELETE FROM collection_items
        WHERE collection_id = ? AND media_type = ? AND movie_id = ?;`,
      [id, mediaType, movieId],
    );
  },

  /** The set of mood ids a given title currently belongs to. */
  async getMoodIdsForMovie(
    movieId: string,
    mediaType: MediaType,
  ): Promise<number[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ collection_id: number }>(
      `SELECT collection_id FROM collection_items
        WHERE media_type = ? AND movie_id = ?;`,
      [mediaType, movieId],
    );
    return rows.map((r) => r.collection_id);
  },
};
