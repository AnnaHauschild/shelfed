import type { QueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { MediaType } from './types';
import {
  fetchMediaById,
  fetchMovieCast,
  fetchMovieTrailer,
  fetchWatchProviders,
} from './movies';
import { fetchBookDescription } from './googleBooks';
import { fetchGameDescription } from './rawg';
import { hasTmdbToken, posterUrl } from './tmdb';
import { POSTER_SIZE_SMALL } from '@/constants/config';

const HOUR = 1000 * 60 * 60;

/**
 * Warms the secondary detail queries (cast, trailer, providers, description)
 * for a title, using the exact same query keys the details view reads. Calling
 * this for the neighbouring titles makes opening / swiping feel instant.
 */
export function prefetchTitleExtras(
  qc: QueryClient,
  id: string,
  mediaType: MediaType,
): void {
  if (!id) return;
  if (mediaType === 'book') {
    qc.prefetchQuery({
      queryKey: ['book-description', id],
      queryFn: () => fetchBookDescription(id),
      staleTime: HOUR,
    });
  } else if (mediaType === 'game') {
    qc.prefetchQuery({
      queryKey: ['game-description', id],
      queryFn: () => fetchGameDescription(id),
      staleTime: HOUR,
    });
  }
  if (mediaType !== 'book' && hasTmdbToken()) {
    qc.prefetchQuery({
      queryKey: ['cast', mediaType, id],
      queryFn: () => fetchMovieCast(id, mediaType),
      staleTime: HOUR,
    });
    qc.prefetchQuery({
      queryKey: ['trailer', mediaType, id],
      queryFn: () => fetchMovieTrailer(id, mediaType),
      staleTime: HOUR,
    });
    qc.prefetchQuery({
      queryKey: ['watch', mediaType, id],
      queryFn: () => fetchWatchProviders(id, mediaType),
      staleTime: HOUR,
    });
  }
}

/** Warms the full Movie metadata (overview/genres) for a title known by id. */
export function prefetchTitle(
  qc: QueryClient,
  id: string,
  mediaType: MediaType,
): void {
  qc.prefetchQuery({
    queryKey: ['media', mediaType, id],
    queryFn: () => fetchMediaById(mediaType, id),
    staleTime: HOUR,
  });
}

/** Decodes + caches a poster (detail size) ahead of time so it shows instantly. */
export function prefetchPoster(posterPath: string | null): void {
  const url = posterUrl(posterPath, POSTER_SIZE_SMALL);
  if (url) void Image.prefetch(url);
}

/** Fetches full Movie metadata via the cache (instant if already warmed). */
export function fetchTitle(
  qc: QueryClient,
  id: string,
  mediaType: MediaType,
): Promise<Awaited<ReturnType<typeof fetchMediaById>>> {
  return qc.fetchQuery({
    queryKey: ['media', mediaType, id],
    queryFn: () => fetchMediaById(mediaType, id),
    staleTime: HOUR,
  });
}
