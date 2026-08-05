/** The kinds of media the app can browse. */
export type MediaType = 'movie' | 'tv' | 'book' | 'game';

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

/** Raw cast entry from TMDB credits / aggregate_credits endpoints. */
export interface TmdbCastMember {
  id: number;
  name: string;
  /** Movie credits use `character`; TV aggregate_credits use `roles[]`. */
  character?: string;
  roles?: { character: string; episode_count?: number }[];
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

/** One entry from the /watch/providers/{media} region provider list. */
export interface TmdbWatchProviderListItem {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface TmdbWatchProvidersListResponse {
  results: TmdbWatchProviderListItem[];
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
  /** TMDB profile image path (or null when the actor has no photo). */
  profilePath: string | null;
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
  /** Release/air date 'YYYY-MM-DD' when known — drives the "Coming Soon" badge. */
  releaseDate?: string;
  mediaType: MediaType;
}

// --- TV seasons & episodes --------------------------------------------------

/** A season summary from /tv/{id} (`seasons[]`). */
export interface TmdbSeasonSummary {
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  overview: string;
}

/** Subset of /tv/{id} used for the season list. */
export interface TmdbTvDetails {
  id: number;
  name: string;
  number_of_seasons: number;
  seasons: TmdbSeasonSummary[];
}

/** A single episode from /tv/{id}/season/{n}. */
export interface TmdbEpisode {
  episode_number: number;
  name: string;
  air_date: string | null;
  overview: string;
  still_path: string | null;
  runtime: number | null;
  vote_average: number;
}

/** Envelope from /tv/{id}/season/{n}. */
export interface TmdbSeasonDetails {
  season_number: number;
  episodes: TmdbEpisode[];
}

/** Normalised season shown in the details view. */
export interface TvSeason {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airYear: number | null;
  posterPath: string | null;
}

/** Normalised episode shown in the details view. */
export interface TvEpisode {
  episodeNumber: number;
  name: string;
  airDate: string | null;
  overview: string;
  stillPath: string | null;
  runtime: number | null;
  voteAverage: number;
}
