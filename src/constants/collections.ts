import { MediaType } from '@/api/types';

/**
 * Curated "collections" for the Discover filter. Each one is a small bundle of
 * TMDB discover constraints:
 *  - `keywords`  TMDB keyword *names* (resolved to ids at query time via
 *                /search/keyword, so we never hardcode brittle numeric ids),
 *  - `genres`    TMDB genre ids required alongside the keywords (AND),
 *  - `language`  with_original_language (e.g. Korean dramas),
 *  - `country`   with_origin_country.
 *
 * `kind` splits them across the two filter sections:
 *  - 'genre' = what the title IS (Psychological Thriller, K-Dramas, Vampires …),
 *  - 'vibe'  = how it FEELS (Road Trip, Melancholy, Feel Good …).
 *
 * `media` lists which categories a collection makes sense for, so the filter
 * only offers the relevant ones.
 */
export interface Collection {
  id: string;
  name: string;
  kind: 'genre' | 'vibe';
  media: MediaType[];
  keywords?: string[];
  genres?: string[];
  language?: string;
  country?: string;
  /** Runtime bounds in minutes (with_runtime.gte/.lte), e.g. short films <= 40. */
  runtimeGte?: number;
  runtimeLte?: number;
  /** Books only: a raw Google Books query fragment (subject/phrase) for this vibe. */
  bookQuery?: string;
}

export const COLLECTIONS: Collection[] = [
  // --- Genre (what it is) ----------------------------------------------------
  {
    id: 'short-film',
    name: 'Short Films',
    kind: 'genre',
    media: ['movie'],
    // TMDB has no "short" genre; a short film is defined by its <= 40 min runtime.
    runtimeGte: 1,
    runtimeLte: 40,
  },
  {
    id: 'kdrama',
    name: 'K-Dramas',
    kind: 'genre',
    media: ['tv', 'movie'],
    language: 'ko',
    country: 'KR',
  },
  {
    id: 'book-adaptations',
    name: 'Based on a Book',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['based on novel or book'],
  },
  {
    id: 'psych-thriller',
    name: 'Psychological Thriller',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['psychological thriller'],
    genres: ['53'],
  },
  {
    id: 'true-crime',
    name: 'True Crime',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['true crime'],
  },
  {
    id: 'police-crime',
    name: 'Police & Detective',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['police'],
    genres: ['80'],
  },
  {
    id: 'dystopia',
    name: 'Dystopian',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['dystopia'],
  },
  {
    id: 'lgbtq',
    name: 'LGBTQ+',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['lgbt'],
  },
  {
    id: 'vampire',
    name: 'Vampires',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['vampire'],
  },
  {
    id: 'animal-attack',
    name: 'Animal Attacks',
    kind: 'genre',
    media: ['movie'],
    keywords: ['animal attack'],
  },
  {
    id: 'dark-romance',
    name: 'Dark Romance',
    kind: 'genre',
    media: ['movie', 'tv'],
    genres: ['10749'],
    keywords: ['toxic relationship', 'obsession', 'forbidden love'],
  },
  {
    id: 'sinister',
    name: 'Sinister',
    kind: 'genre',
    media: ['movie', 'tv'],
    keywords: ['occult', 'demon', 'cult'],
  },

  // --- Vibe (how it feels) ---------------------------------------------------
  {
    id: 'road-trip',
    name: 'Road Trip',
    kind: 'vibe',
    media: ['movie'],
    keywords: ['road trip'],
  },
  {
    id: 'slice-of-life',
    name: 'Slice of Life',
    kind: 'vibe',
    media: ['movie', 'tv'],
    keywords: ['slice of life'],
  },
  {
    id: 'melancholy',
    name: 'Melancholy',
    kind: 'vibe',
    media: ['movie', 'tv'],
    keywords: ['melancholy', 'loneliness', 'grief'],
  },
  {
    id: 'feel-good',
    name: 'Feel Good',
    kind: 'vibe',
    media: ['movie', 'tv'],
    keywords: ['feel good', 'feel-good'],
  },
  {
    id: 'yearning',
    name: 'Yearning',
    kind: 'vibe',
    media: ['movie', 'tv'],
    keywords: ['unrequited love', 'longing', 'pining'],
  },

  // --- BookTok vibes (books only) — Google Books query fragments -------------
  { id: 'dark-romance-book', name: 'Dark Romance', kind: 'vibe', media: ['book'], bookQuery: '"dark romance"' },
  { id: 'cozy-mystery', name: 'Cozy Mystery', kind: 'vibe', media: ['book'], bookQuery: 'subject:"Cozy Mystery"' },
  { id: 'enemies-to-lovers', name: 'Enemies to Lovers', kind: 'vibe', media: ['book'], bookQuery: '"enemies to lovers"' },
  { id: 'slow-burn', name: 'Slow Burn', kind: 'vibe', media: ['book'], bookQuery: '"slow burn" romance' },
  { id: 'coming-of-age-book', name: 'Coming of Age', kind: 'vibe', media: ['book'], bookQuery: 'subject:"coming of age"' },
  { id: 'dystopia-book', name: 'Dystopian', kind: 'vibe', media: ['book'], bookQuery: 'subject:"dystopian"' },
  { id: 'grimdark', name: 'Grimdark', kind: 'vibe', media: ['book'], bookQuery: '"grimdark"' },
  // Category, not a phrase search: '"heartwarming"' matched the Mills & Boon
  // imprint of that name and little else.
  { id: 'feel-good-book', name: 'Feel-Good', kind: 'vibe', media: ['book'], bookQuery: 'subject:"Humorous Fiction"' },
];

/**
 * Collections offered for a given media type (only the relevant ones show),
 * optionally narrowed to one `kind` (the Genre or Vibe filter section).
 */
export function collectionsFor(
  mediaType: MediaType,
  kind?: 'genre' | 'vibe',
): { id: string; name: string }[] {
  return COLLECTIONS.filter(
    (c) => c.media.includes(mediaType) && (kind == null || c.kind === kind),
  ).map((c) => ({ id: c.id, name: c.name }));
}
