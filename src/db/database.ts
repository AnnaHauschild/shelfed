import * as SQLite from 'expo-sqlite';
import { SCHEMA_STATEMENTS, SCHEMA_VERSION } from './schema';

// A single shared connection, opened lazily. The promise is memoised so every
// caller awaits the same initialised database (and migrations run only once).
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  // WAL improves write concurrency; foreign_keys enforces the ON DELETE CASCADE.
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;',
  );
  const version = row?.user_version ?? 0;

  // v1 -> v2: add a media_type dimension so movies and series live side by side.
  if (version < 2) {
    await migrateToV2(db);
  }

  // v5 -> v6: cache the content language each movie/series was stored in, so the
  // shelf can re-localize stale rows when the user switches app language.
  if (version < 6) {
    await migrateAddLangColumn(db);
  }

  // Create tables on a fresh install (no-op once they already exist).
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execAsync(statement);
  }

  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
}

/**
 * Rebuilds the v1 tables (keyed only by movie id) into the v2 shape that adds a
 * `media_type` column + composite keys. Existing rows are preserved and tagged
 * as 'movie'. No-op on a fresh install (the v2 tables are created afterwards).
 */
async function migrateToV2(db: SQLite.SQLiteDatabase): Promise<void> {
  const cols = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(movies);',
  );
  // Fresh install (no movies table) or already migrated -> nothing to rebuild.
  if (cols.length === 0) return;
  if (cols.some((c) => c.name === 'media_type')) return;

  // Disable FK enforcement so dropping the old table doesn't cascade-delete
  // interactions. (PRAGMA foreign_keys can't be toggled inside a transaction.)
  await db.execAsync('PRAGMA foreign_keys = OFF;');
  await db.withTransactionAsync(async () => {
    await db.execAsync(`CREATE TABLE movies_v2 (
       media_type    TEXT    NOT NULL DEFAULT 'movie',
       id            INTEGER NOT NULL,
       title         TEXT    NOT NULL,
       year          INTEGER,
       genre_ids     TEXT    NOT NULL DEFAULT '[]',
       genres        TEXT    NOT NULL DEFAULT '[]',
       poster_path   TEXT,
       backdrop_path TEXT,
       overview      TEXT,
       vote_average  REAL,
       vote_count    INTEGER,
       popularity    REAL,
       cached_at     INTEGER NOT NULL,
       PRIMARY KEY (media_type, id)
     );`);
    await db.execAsync(`INSERT INTO movies_v2
       (media_type, id, title, year, genre_ids, genres, poster_path,
        backdrop_path, overview, vote_average, vote_count, popularity, cached_at)
       SELECT 'movie', id, title, year, genre_ids, genres, poster_path,
        backdrop_path, overview, vote_average, vote_count, popularity, cached_at
       FROM movies;`);
    await db.execAsync('DROP TABLE movies;');
    await db.execAsync('ALTER TABLE movies_v2 RENAME TO movies;');

    await db.execAsync(`CREATE TABLE interactions_v2 (
       id         INTEGER PRIMARY KEY AUTOINCREMENT,
       media_type TEXT    NOT NULL DEFAULT 'movie',
       movie_id   INTEGER NOT NULL,
       type       TEXT    NOT NULL CHECK (type IN ('watched','skipped','watchlist','favorite')),
       created_at INTEGER NOT NULL,
       source     TEXT    NOT NULL DEFAULT 'swipe',
       UNIQUE (media_type, movie_id, type),
       FOREIGN KEY (media_type, movie_id) REFERENCES movies(media_type, id) ON DELETE CASCADE
     );`);
    await db.execAsync(`INSERT INTO interactions_v2
       (id, media_type, movie_id, type, created_at, source)
       SELECT id, 'movie', movie_id, type, created_at, source
       FROM interactions;`);
    await db.execAsync('DROP TABLE interactions;');
    await db.execAsync('ALTER TABLE interactions_v2 RENAME TO interactions;');
  });
  await db.execAsync('PRAGMA foreign_keys = ON;');
}

/**
 * Adds the `lang` column to the movies cache (v6). Existing rows get NULL, which
 * the shelf treats as "unknown language" and re-fetches once in the current
 * language. No-op on a fresh install (the CREATE statement already includes it)
 * or if the column was added already.
 */
async function migrateAddLangColumn(db: SQLite.SQLiteDatabase): Promise<void> {
  const cols = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(movies);',
  );
  if (cols.length === 0) return; // fresh install; CREATE includes the column
  if (cols.some((c) => c.name === 'lang')) return; // already migrated
  await db.execAsync('ALTER TABLE movies ADD COLUMN lang TEXT;');
}

/**
 * Returns the shared, migrated SQLite database. Safe to call from anywhere;
 * initialisation happens exactly once.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('shelfed.db').then(async (db) => {
      await migrate(db);
      return db;
    });
  }
  return dbPromise;
}
