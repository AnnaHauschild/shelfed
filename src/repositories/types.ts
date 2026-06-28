import { MediaType, Movie } from '@/api/types';

/** The four kinds of signals a user can record about a movie. */
export type InteractionType = 'watched' | 'skipped' | 'watchlist' | 'favorite';

export interface Interaction {
  movieId: number;
  type: InteractionType;
  createdAt: number;
  source: string;
}

/** A cached movie plus when it was stored. */
export interface StoredMovie extends Movie {
  cachedAt: number;
}

/** Aggregated signals for the future recommendation engine. */
export interface RecommendationSignals {
  watched: string[];
  favorites: string[];
  watchlist: string[];
  skipped: string[];
}

/**
 * Persistence interface for movie metadata. Implemented today by SQLite; a
 * cloud-backed implementation can be dropped in later without touching the UI.
 */
export interface MovieRepository {
  upsert(movie: Movie): Promise<void>;
  getById(id: string, mediaType: MediaType): Promise<StoredMovie | null>;
}

/** Persistence interface for user interactions / shelves. */
export interface InteractionRepository {
  add(
    movieId: string,
    type: InteractionType,
    mediaType: MediaType,
    source?: string,
  ): Promise<void>;
  remove(
    movieId: string,
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<void>;
  getMoviesByType(
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<StoredMovie[]>;
  /** All ids in this category the user has interacted with (to filter the feed). */
  getSeenIds(mediaType: MediaType): Promise<Set<string>>;
  /** Whether a specific (movie, type) signal currently exists. */
  has(
    movieId: string,
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<boolean>;
  /** Map of id -> set of its current interaction types (for UI state). */
  getStateMap(mediaType: MediaType): Promise<Map<string, Set<InteractionType>>>;
  /** Snapshot of all signals (for the recommender) within a category. */
  exportSignals(mediaType: MediaType): Promise<RecommendationSignals>;
}
