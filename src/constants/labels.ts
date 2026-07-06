import { MediaType } from '@/api/types';

/** The verb for the "watched" interaction — books are read, not watched. */
export function watchedLabel(mediaType: MediaType): string {
  return mediaType === 'book' ? 'Read' : mediaType === 'game' ? 'Played' : 'Watched';
}

/**
 * Label for the "want to watch / read later" list (the Star button). Kept
 * media-agnostic and identical everywhere so it fits movies, series AND books.
 */
export const WATCHLIST_LABEL = 'Wishlist';

/** Plural noun for a media type, for media-aware copy: movies / series / books. */
export function mediaPlural(mediaType: MediaType): string {
  return mediaType === 'tv'
    ? 'series'
    : mediaType === 'book'
      ? 'books'
      : mediaType === 'game'
        ? 'games'
        : 'movies';
}
