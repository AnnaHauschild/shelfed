import { MediaType, Movie } from '@/api/types';
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
          backdrop_path, overview, vote_average, vote_count, popularity, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
         cached_at=excluded.cached_at;`,
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
};
