import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeedPage } from '@/api/movies';
import { useLanguage } from '@/context/LanguageProvider';
import { useMediaType } from '@/context/MediaTypeProvider';
import { interactionRepository } from '@/repositories';

/**
 * Infinite, paginated movie feed for the swipe deck.
 *
 * Each page is fetched from TMDB and then filtered against the set of movies the
 * user has already interacted with, so cards are never shown twice — even across
 * app restarts (the "seen" set is read from SQLite).
 */
export function useMovieFeed(
  genres: string[],
  era?: string,
  countries: string[] = [],
  collection?: string,
  actor?: string,
  platforms: string[] = [],
  vibes: string[] = [],
  providers: string[] = [],
  author?: string,
) {
  const mediaType = useMediaType();
  const { language } = useLanguage();
  return useInfiniteQuery({
    queryKey: [
      'movie-feed',
      mediaType,
      language,
      genres.join(','),
      era ?? null,
      countries.join(','),
      collection ?? null,
      actor ?? null,
      platforms.join(','),
      vibes.join(','),
      providers.join(','),
      author ?? null,
    ],
    queryFn: async ({ pageParam }) => {
      const [page, seen] = await Promise.all([
        fetchFeedPage(
          pageParam,
          mediaType,
          genres,
          era,
          countries,
          collection,
          actor,
          platforms,
          vibes,
          providers,
          author,
        ),
        interactionRepository.getSeenIds(mediaType),
      ]);
      return {
        ...page,
        movies: page.movies.filter((movie) => !seen.has(movie.id)),
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // Feed responses are stable enough to keep for the session.
    staleTime: 1000 * 60 * 30,
  });
}
