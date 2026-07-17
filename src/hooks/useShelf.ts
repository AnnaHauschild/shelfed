import { useQuery } from '@tanstack/react-query';
import { fetchMediaById } from '@/api/movies';
import { contentLanguage } from '@/api/tmdb';
import { tmdbTag } from '@/constants/languages';
import { useLanguage } from '@/context/LanguageProvider';
import { useMediaType } from '@/context/MediaTypeProvider';
import {
  InteractionType,
  StoredMovie,
  interactionRepository,
  movieRepository,
} from '@/repositories';

/**
 * Re-localizes cached shelf items to the current content language. Movies/series
 * are stored with whatever language was active when they were swiped; if the
 * user later switches language, those rows are re-fetched from TMDB in the new
 * language and the cache is updated. Books/games aren't localized, and network
 * failures fall back to the cached copy so the shelf still works offline.
 */
async function localizeShelf(movies: StoredMovie[]): Promise<StoredMovie[]> {
  const tag = contentLanguage();
  return Promise.all(
    movies.map(async (movie) => {
      const localizable = movie.mediaType === 'movie' || movie.mediaType === 'tv';
      if (!localizable || movie.lang === tag) return movie;
      try {
        const fresh = await fetchMediaById(movie.mediaType, movie.id);
        if (!fresh) return movie;
        await movieRepository.upsert(fresh); // re-caches with the current lang
        return {
          ...movie,
          title: fresh.title,
          overview: fresh.overview,
          genres: fresh.genres,
          genreIds: fresh.genreIds,
          posterPath: fresh.posterPath,
          backdropPath: fresh.backdropPath,
          lang: tag,
        };
      } catch {
        return movie; // offline / TMDB error -> keep the cached copy
      }
    }),
  );
}

/**
 * Reads a single shelf (watched / watchlist / favorite) from local storage.
 * Kept in React Query so it auto-refreshes when interactions are recorded
 * (those mutations invalidate the ['shelf'] key). The current language is part
 * of the key, so switching language re-runs the query and re-localizes titles.
 */
export function useShelf(type: InteractionType) {
  const mediaType = useMediaType();
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['shelf', mediaType, type, tmdbTag(language)],
    queryFn: async () => {
      const movies = await interactionRepository.getMoviesByType(type, mediaType);
      return localizeShelf(movies);
    },
  });
}
