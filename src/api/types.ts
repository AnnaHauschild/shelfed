/** The kinds of media the app can browse. */
export type MediaType = 'movie' | 'tv' | 'book';

/** Raw movie shape returned by TMDB list/discover endpoints. */
export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string; // 'YYYY-MM-DD' (may be empty for unreleased)
  genre_ids: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

/** Raw TV-show shape returned by TMDB list/discover endpoints. */
export interface TmdbTv {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string; // 'YYYY-MM-DD' (may be empty)
  genre_ids: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

/** Standard TMDB paginated envelope. */
export interface TmdbPagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

/** Raw cast entry from TMDB's /movie/{id}/credits endpoint. */
export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  order: number;
  known_for_department: string;
  profile_path: string | null;
}

/** Raw credits envelope from /movie/{id}/credits. */
export interface TmdbCredits {
  id: number;
  cast: TmdbCastMember[];
}

/** Subset of TMDB's /person/{id} response (used for actor ages). */
export interface TmdbPerson {
  id: number;
  birthday: string | null; // 'YYYY-MM-DD'
}

/** Raw video entry from TMDB's /movie/{id}/videos endpoint. */
export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string; // e.g. 'YouTube'
  type: string; // e.g. 'Trailer' | 'Teaser'
  official: boolean;
}

/** Raw videos envelope from /movie/{id}/videos. */
export interface TmdbVideosResponse {
  id: number;
  results: TmdbVideo[];
}

/** Raw watch-provider entry from /{media}/{id}/watch/providers. */
export interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface TmdbWatchRegion {
  link?: string;
  flatrate?: TmdbProvider[];
  free?: TmdbProvider[];
  ads?: TmdbProvider[];
}

export interface TmdbWatchProvidersResponse {
  id: number;
  results: Record<string, TmdbWatchRegion>;
}

/** A streaming provider shown in the details view. */
export interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string | null;
}

/** Normalised streaming availability for a title. */
export interface WatchInfo {
  providers: WatchProvider[];
  link: string | null;
}

/** A normalised, top-billed cast member shown in the details view. */
export interface CastMember {
  id: number;
  name: string;
  character: string;
  /** Year of birth (from TMDB /person), for showing age at release. */
  birthYear: number | null;
}

/**
 * Normalised movie used everywhere in the app (UI + storage). Decoupling this
 * from the raw TMDB shape means a future switch to another data source only
 * touches the mapping layer, not the whole app.
 */
export interface Movie {
  id: string;
  title: string;
  year: number | null;
  genreIds: number[];
  genres: string[];
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  /** Authors — only set for books (movies/series use cast instead). */
  authors?: string[];
  mediaType: MediaType;
}
