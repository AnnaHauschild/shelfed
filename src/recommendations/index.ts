import { MediaType } from '@/api/types';
import {
  interactionRepository,
  movieRepository,
  RecommendationSignals,
  StoredMovie,
} from '@/repositories';

/**
 * Data contract for a future recommendation engine.
 *
 * This module intentionally only *prepares* data — it does not implement any
 * ranking yet. It gives a later recommender a clean, hydrated snapshot:
 *   - positive taste signals: watched (weak) + favorites (strong)
 *   - negative signal:        skipped
 *   - explicit intent:        watchlist (what the user said they want next)
 * plus the cached movie metadata (genres, year, ratings) needed for
 * content-based features.
 */
export interface RecommendationDataset {
  signals: RecommendationSignals;
  /** Movie metadata keyed by id, for content-based features. */
  movies: Record<string, StoredMovie>;
  generatedAt: number;
}

/**
 * Suggested weights for a future content-based / collaborative scorer.
 * Favorites count for more than a plain "watched"; watchlist is intent (not a
 * taste signal) so it is excluded from the taste profile; skips are negative.
 */
export const SIGNAL_WEIGHTS = {
  favorite: 3,
  watched: 1,
  watchlist: 0,
  skipped: -1,
} as const;

/** Builds the full dataset a recommender would consume. */
export async function buildRecommendationDataset(
  mediaType: MediaType,
): Promise<RecommendationDataset> {
  const signals = await interactionRepository.exportSignals(mediaType);

  const ids = Array.from(
    new Set([
      ...signals.watched,
      ...signals.favorites,
      ...signals.watchlist,
      ...signals.skipped,
    ]),
  );

  const movies: Record<string, StoredMovie> = {};
  await Promise.all(
    ids.map(async (id) => {
      const movie = await movieRepository.getById(id, mediaType);
      if (movie) movies[id] = movie;
    }),
  );

  return { signals, movies, generatedAt: Date.now() };
}
