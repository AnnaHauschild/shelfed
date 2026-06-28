import { MediaType } from '@/api/types';

/** The verb for the "watched" interaction — books are read, not watched. */
export function watchedLabel(mediaType: MediaType): string {
  return mediaType === 'book' ? 'Read' : 'Watched';
}
