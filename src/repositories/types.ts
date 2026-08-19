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
  /** TMDB language tag (e.g. 'de-DE') the cached title/overview are in. */
  lang?: string | null;
  /** Manual drag order within its shelf (null = no custom position yet). */
  sortOrder?: number | null;
}

/** Aggregated signals for the future recommendation engine. */
export interface RecommendationSignals {
  watched: string[];
  favorites: string[];
  watchlist: string[];
  skipped: string[];
}

/** Aggregated stats over the Watched shelf (for the Settings statistics view). */
export interface WatchedStats {
  /** Watched count per media type. */
  byType: Record<MediaType, number>;
  /** Total watched across all media types. */
  totalWatched: number;
  /** Genre breakdown per media type, most-watched first. */
  genresByType: Record<MediaType, { name: string; count: number }[]>;
}

/**
 * Persistence interface for movie metadata. Implemented today by SQLite; a
 * cloud-backed implementation can be dropped in later without touching the UI.
 */
export interface MovieRepository {
  upsert(movie: Movie): Promise<void>;
  getById(id: string, mediaType: MediaType): Promise<StoredMovie | null>;
}

/** A local shareable shelf entry with the minimal metadata needed to sync. */
export interface SyncShelfItem {
  mediaType: MediaType;
  movieId: string;
  type: InteractionType;
  title: string;
  posterPath: string | null;
  year: number | null;
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
  /** Deletes every interaction (a full shelf reset). */
  clearAll(): Promise<void>;
  /** Deletes interactions matching the given types + media types (scoped clear). */
  clearScoped(types: InteractionType[], mediaTypes: MediaType[]): Promise<void>;
  getMoviesByType(
    type: InteractionType,
    mediaType: MediaType,
  ): Promise<StoredMovie[]>;
  /** Persist a manual drag order (index per id) for one shelf. */
  setSortOrder(
    type: InteractionType,
    mediaType: MediaType,
    orderedIds: string[],
  ): Promise<void>;
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
  /** Aggregated stats over the Watched shelf (counts + genre breakdown). */
  getStats(): Promise<WatchedStats>;
  /** All watched/watchlist/favorite items with metadata, for cloud sync. */
  getSyncItems(): Promise<SyncShelfItem[]>;
}
