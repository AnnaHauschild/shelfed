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
];

export const SCHEMA_VERSION = 2;
