import { MediaType } from '@/api/types';
import { StoredMovie } from './types';

/** Raw row shape for the `movies` table. */
export interface MovieRow {
  media_type: string;
  id: string | number;
  title: string;
  year: number | null;
  genre_ids: string;
  genres: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  vote_average: number | null;
  vote_count: number | null;
  popularity: number | null;
  cached_at: number;
  lang: string | null;
}

function safeParseArray<T>(json: string | null): T[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/** Converts a DB row into the app's StoredMovie shape. */
export function rowToStoredMovie(row: MovieRow): StoredMovie {
  return {
    mediaType: row.media_type as MediaType,
    id: String(row.id),
    title: row.title,
    year: row.year,
    genreIds: safeParseArray<number>(row.genre_ids),
    genres: safeParseArray<string>(row.genres),
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    overview: row.overview ?? '',
    voteAverage: row.vote_average ?? 0,
    voteCount: row.vote_count ?? 0,
    popularity: row.popularity ?? 0,
    cachedAt: row.cached_at,
    lang: row.lang ?? null,
  };
}
