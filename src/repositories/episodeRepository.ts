import { getDatabase } from '@/db/database';

const key = (season: number, episode: number) => `${season}-${episode}`;

/**
 * SQLite-backed store for per-episode "watched" marks of a series. Keyed by
 * (tv_id, season, episode); no FK to the movies cache so any series can be
 * tracked, whether or not it's on a shelf.
 */
export const episodeRepository = {
  /** Deletes all episode-watched marks (a full reset). */
  async clearAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM episode_watches;');
  },

  /** Set of "season-episode" keys the user marked watched for a series. */
  async getWatched(tvId: string): Promise<Set<string>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ season: number; episode: number }>(
      'SELECT season, episode FROM episode_watches WHERE tv_id = ?;',
      [tvId],
    );
    return new Set(rows.map((r) => key(r.season, r.episode)));
  },

  /** Toggles one episode's watched state; returns the new state. */
  async toggle(
    tvId: string,
    season: number,
    episode: number,
  ): Promise<boolean> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ episode: number }>(
      'SELECT episode FROM episode_watches WHERE tv_id = ? AND season = ? AND episode = ?;',
      [tvId, season, episode],
    );
    if (existing) {
      await db.runAsync(
        'DELETE FROM episode_watches WHERE tv_id = ? AND season = ? AND episode = ?;',
        [tvId, season, episode],
      );
      return false;
    }
    await db.runAsync(
      'INSERT INTO episode_watches (tv_id, season, episode, watched_at) VALUES (?, ?, ?, ?);',
      [tvId, season, episode, Date.now()],
    );
    return true;
  },

  /** Marks or unmarks a whole season (given its episode numbers) at once. */
  async setSeason(
    tvId: string,
    season: number,
    episodes: number[],
    watched: boolean,
  ): Promise<void> {
    const db = await getDatabase();
    if (!watched) {
      await db.runAsync(
        'DELETE FROM episode_watches WHERE tv_id = ? AND season = ?;',
        [tvId, season],
      );
      return;
    }
    const now = Date.now();
    await db.withTransactionAsync(async () => {
      for (const ep of episodes) {
        await db.runAsync(
          `INSERT INTO episode_watches (tv_id, season, episode, watched_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(tv_id, season, episode) DO NOTHING;`,
          [tvId, season, ep, now],
        );
      }
    });
  },
};
