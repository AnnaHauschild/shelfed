/**
 * SQLite schema for Shelfed.
 *
 * Two tables:
 *  - `movies`       : a local cache of normalised movie metadata, so shelves can
 *                     be rendered fully offline once swiped.
 *  - `interactions` : every user signal about a movie. One row per (movie, type).
 *                     Types map to the product's logical collections:
 *                       watched   -> the Watched Shelf (core feature)
 *                       watchlist -> Star button (want to watch)
 *                       favorite  -> Heart button (strong positive signal)
 *                       skipped   -> "not watched" swipe (negative signal; also
 *                                    prevents re-showing the card)
 *
 * Keeping all signals in one table (rather than separate tables) makes the
 * future recommendation system trivial to feed, while a `type` filter still
 * exposes each collection separately to the UI.
 */
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS movies (
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
     lang          TEXT,
     PRIMARY KEY (media_type, id)
   );`,

  `CREATE TABLE IF NOT EXISTS interactions (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     media_type TEXT    NOT NULL DEFAULT 'movie',
     movie_id   INTEGER NOT NULL,
     type       TEXT    NOT NULL CHECK (type IN ('watched','skipped','watchlist','favorite')),
     created_at INTEGER NOT NULL,
     source     TEXT    NOT NULL DEFAULT 'swipe',
     UNIQUE (media_type, movie_id, type),
     FOREIGN KEY (media_type, movie_id) REFERENCES movies(media_type, id) ON DELETE CASCADE
   );`,

  `CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(media_type, type);`,
  `CREATE INDEX IF NOT EXISTS idx_interactions_movie ON interactions(media_type, movie_id);`,

  // User-defined "Moods": personal, hand-curated shelves that are subsets of the
  // watched shelf (e.g. "Guilty Pleasure", "Childhood", "Comfort"). A mood can
  // hold titles of any media type.
  `CREATE TABLE IF NOT EXISTS collections (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     name       TEXT    NOT NULL,
     emoji      TEXT    NOT NULL DEFAULT '🎬',
     sort_order INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL
   );`,

  `CREATE TABLE IF NOT EXISTS collection_items (
     collection_id INTEGER NOT NULL,
     media_type    TEXT    NOT NULL DEFAULT 'movie',
     movie_id      INTEGER NOT NULL,
     added_at      INTEGER NOT NULL,
     PRIMARY KEY (collection_id, media_type, movie_id),
     FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
     FOREIGN KEY (media_type, movie_id) REFERENCES movies(media_type, id) ON DELETE CASCADE
   );`,

  `CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);`,

  // Free-text notes the user writes about a title (a "post-it" per movie).
  `CREATE TABLE IF NOT EXISTS notes (
     media_type TEXT    NOT NULL DEFAULT 'movie',
     movie_id   INTEGER NOT NULL,
     text       TEXT    NOT NULL,
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (media_type, movie_id)
   );`,

  `CREATE TABLE IF NOT EXISTS settings (
     key   TEXT PRIMARY KEY,
     value TEXT NOT NULL
   );`,
];

export const SCHEMA_VERSION = 6;
