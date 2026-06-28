import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeedPage } from '@/api/movies';
import { useMediaType } from '@/context/MediaTypeProvider';
import { interactionRepository } from '@/repositories';

/**
 * Infinite, paginated movie feed for the swipe deck.
 *
 * Each page is fetched from TMDB and then filtered against the set of movies the
 * user has already interacted with, so cards are never shown twice — even across
 * app restarts (the "seen" set is read from SQLite).
 */
export function useMovieFeed(genre?: string, era?: string, country?: string) {
  const mediaType = useMediaType();
  return useInfiniteQuery({
    queryKey: ['movie-feed', mediaType, genre ?? null, era ?? null, country ?? null],
    queryFn: async ({ pageParam }) => {
      const [page, seen] = await Promise.all([
        fetchFeedPage(pageParam, mediaType, genre, era, country),
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
