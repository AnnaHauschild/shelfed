import type { FeedPage } from './movies';
import { Movie } from './types';

const OL_BASE = 'https://openlibrary.org';
const OL_COVER_BASE = 'https://covers.openlibrary.org/b/id';
const PAGE_SIZE = 20;

// Open Library has no global "popular" endpoint, so the swipe feed walks a set
// of well-known subjects page by page to build a browsable stream.
const BOOK_SUBJECTS = [
  'fiction',
  'fantasy',
  'science_fiction',
  'mystery',
  'thriller',
  'romance',
  'historical_fiction',
  'classics',
  'horror',
  'biography',
];

/** Book "genres" for the Discover filter (the subjects we browse). */
export const BOOK_GENRE_OPTIONS = BOOK_SUBJECTS.map((s) => ({
  id: s,
  name: s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

interface OlSubjectWork {
  key: string; // '/works/OL...W'
  title: string;
  authors?: { name: string }[];
  cover_id?: number | null;
  first_publish_year?: number | null;
  subject?: string[];
}

interface OlSubjectResponse {
  work_count: number;
  works: OlSubjectWork[];
}

interface OlSearchDoc {
  key: string; // '/works/OL...W'
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  ratings_average?: number;
  ratings_count?: number;
  subject?: string[];
}

interface OlSearchResponse {
  numFound: number;
  docs: OlSearchDoc[];
}

interface OlWorkDetails {
  description?: string | { value: string };
}

async function olGet<T>(path: string): Promise<T> {
  const res = await fetch(`${OL_BASE}${path}`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Open Library request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

/** '/works/OL123W' -> 'OL123W' */
function workId(key: string): string {
  return key.replace('/works/', '');
}

function coverUrl(coverId: number | null | undefined): string | null {
  return coverId ? `${OL_COVER_BASE}/${coverId}-L.jpg` : null;
}

/** Tidies raw subject slugs into display labels ("science_fiction" -> "Science Fiction"). */
function toGenreLabels(subjects: string[] | undefined): string[] {
  if (!subjects) return [];
  return subjects
    .slice(0, 4)
    .map((s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
}

function workToMovie(w: OlSubjectWork): Movie {
  return {
    id: workId(w.key),
    title: w.title,
    year: w.first_publish_year ?? null,
    genreIds: [],
    genres: toGenreLabels(w.subject),
    posterPath: coverUrl(w.cover_id),
    backdropPath: null,
    overview: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    authors: (w.authors ?? []).map((a) => a.name),
    mediaType: 'book',
  };
}

function docToMovie(d: OlSearchDoc): Movie {
  // Open Library ratings are 0–5; scale to the 0–10 used elsewhere in the app.
  const rating = d.ratings_average
    ? Math.round(d.ratings_average * 2 * 10) / 10
    : 0;

  return {
    id: workId(d.key),
    title: d.title,
    year: d.first_publish_year ?? null,
    genreIds: [],
    genres: toGenreLabels(d.subject),
    posterPath: coverUrl(d.cover_i),
    backdropPath: null,
    overview: '',
    voteAverage: rating,
    voteCount: d.ratings_count ?? 0,
    popularity: 0,
    authors: d.author_name ?? [],
    mediaType: 'book',
  };
}

// Fisher-Yates shuffle (in-place, returns the same array for chaining).
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * One page of the book swipe feed. With a subject it browses that single genre;
 * without one it picks a random subject so the deck mixes genres across pages.
 */
export async function fetchBookFeedPage(
  page: number,
  subject?: string,
  years?: { from: number; to: number },
): Promise<FeedPage> {
  // The /search.json endpoint reliably returns large cover ids (cover_i) and
  // accepts both subject + year filters, so we route the book feed through it
  // for noticeably better covers than /subjects/{subject}.json.
  const parts: string[] = [];
  if (subject) parts.push(`subject:${subject}`);
  if (years) parts.push(`first_publish_year:[${years.from} TO ${years.to}]`);
  if (parts.length === 0) {
    // No filters: pick a random subject so the deck jumps between genres.
    const rotating =
      BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    parts.push(`subject:${rotating}`);
  }
  const query = parts.join(' AND ');
  const result = await searchBooks(query, page);
  return { ...result, movies: shuffle(result.movies) };
}

/** Free-text book search (Open Library /search.json). */
export async function searchBooks(
  query: string,
  page: number,
): Promise<FeedPage> {
  const offset = (page - 1) * PAGE_SIZE;
  const fields =
    'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count,subject';
  const data = await olGet<OlSearchResponse>(
    `/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=${PAGE_SIZE}&offset=${offset}`,
  );

  const movies = data.docs.filter((d) => d.cover_i).map(docToMovie);
  const hasMore = offset + PAGE_SIZE < data.numFound;
  return { movies, nextPage: hasMore ? page + 1 : null };
}

/** Fetches a book's description (lazy, for the details view). */
export async function fetchBookDescription(
  bookId: string,
): Promise<string | null> {
  const data = await olGet<OlWorkDetails>(`/works/${bookId}.json`);
  if (!data.description) return null;
  return typeof data.description === 'string'
    ? data.description
    : data.description.value;
}
