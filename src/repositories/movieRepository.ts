import { MediaType, Movie } from '@/api/types';
import { contentLanguage } from '@/api/tmdb';
import { getDatabase } from '@/db/database';
import { MovieRow, rowToStoredMovie } from './mappers';
import { MovieRepository, StoredMovie } from './types';

/**
 * SQLite-backed cache of movie metadata. A movie is upserted the first time the
 * user interacts with it, so shelves render even when offline.
 */
export const movieRepository: MovieRepository = {
  async upsert(movie: Movie): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO movies
         (media_type, id, title, year, genre_ids, genres, poster_path,
          backdrop_path, overview, vote_average, vote_count, popularity, cached_at, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(media_type, id) DO UPDATE SET
         title=excluded.title,
         year=excluded.year,
         genre_ids=excluded.genre_ids,
         genres=excluded.genres,
         poster_path=excluded.poster_path,
         backdrop_path=excluded.backdrop_path,
         overview=excluded.overview,
         vote_average=excluded.vote_average,
         vote_count=excluded.vote_count,
         popularity=excluded.popularity,
         cached_at=excluded.cached_at,
         lang=excluded.lang;`,
      [
        movie.mediaType,
        movie.id,
        movie.title,
        movie.year,
        JSON.stringify(movie.genreIds),
        JSON.stringify(movie.genres),
        movie.posterPath,
        movie.backdropPath,
        movie.overview,
        movie.voteAverage,
        movie.voteCount,
        movie.popularity,
        Date.now(),
        contentLanguage(),
      ],
    );
  },

  async getById(id: string, mediaType: MediaType): Promise<StoredMovie | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MovieRow>(
      'SELECT * FROM movies WHERE media_type = ? AND id = ?',
      [mediaType, id],
    );
    return row ? rowToStoredMovie(row) : null;
  },

  async findPlaceholders(
    limit: number,
  ): Promise<{ id: string; mediaType: MediaType }[]> {
    const db = await getDatabase();
    // The signature of minimalMovie() in ShelfSyncGate: no genres, no text,
    // no votes. Restricted to shelved titles so cached swipes stay untouched.
    const rows = await db.getAllAsync<{ media_type: string; id: string | number }>(
      `SELECT m.media_type AS media_type, m.id AS id
         FROM movies m
         JOIN interactions i
           ON i.media_type = m.media_type AND i.movie_id = m.id
        WHERE m.genres = '[]'
          AND (m.overview IS NULL OR m.overview = '')
          AND i.type IN ('watched','watchlist','favorite')
        GROUP BY m.media_type, m.id
        LIMIT ?;`,
      [limit],
    );
    return rows.map((r) => ({
      id: String(r.id),
      mediaType: r.media_type as MediaType,
    }));
  },
};
