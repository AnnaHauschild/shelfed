import { MediaType } from '@/api/types';
import { getDatabase } from '@/db/database';

/**
 * SQLite-backed store for the free-text note a user writes about a title. One
 * row per (media_type, movie_id); an empty note deletes the row.
 */
export const noteRepository = {
  /** The note text for a title, or '' if none. */
  async get(movieId: string, mediaType: MediaType): Promise<string> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ text: string }>(
      'SELECT text FROM notes WHERE media_type = ? AND movie_id = ?;',
      [mediaType, movieId],
    );
    return row?.text ?? '';
  },

  /** Saves (or clears, when empty) the note for a title. */
  async set(movieId: string, mediaType: MediaType, text: string): Promise<void> {
    const db = await getDatabase();
    const trimmed = text.trim();
    if (!trimmed) {
      await db.runAsync(
        'DELETE FROM notes WHERE media_type = ? AND movie_id = ?;',
        [mediaType, movieId],
      );
      return;
    }
    await db.runAsync(
      `INSERT INTO notes (media_type, movie_id, text, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(media_type, movie_id)
         DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at;`,
      [mediaType, movieId, trimmed, Date.now()],
    );
  },
};
