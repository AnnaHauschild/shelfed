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
  title?: string;
  description?: string | { value: string };
  covers?: (number | null)[];
  subjects?: string[];
  first_publish_date?: string;
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
  const noUserFilter = parts.length === 0;
  if (noUserFilter) {
    // OL search rejects bare `q=*`; we pick a random subject for breadth and
    // sort by readinglog so each subject still surfaces its popular books.
    const rotating =
      BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    parts.push(`subject:${rotating}`);
  }
  const query = parts.join(' AND ');
  const result = await searchBooks(
    query,
    page,
    noUserFilter ? 'readinglog' : undefined,
  );
  return { ...result, movies: shuffle(result.movies) };
}

/** Free-text book search (Open Library /search.json). */
export async function searchBooks(
  query: string,
  page: number,
  sort?: string,
): Promise<FeedPage> {
  const offset = (page - 1) * PAGE_SIZE;
  const fields =
    'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count,subject';
  const sortParam = sort ? `&sort=${encodeURIComponent(sort)}` : '';
  const data = await olGet<OlSearchResponse>(
    `/search.json?q=${encodeURIComponent(query)}&fields=${fields}&limit=${PAGE_SIZE}&offset=${offset}${sortParam}`,
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

/** Fetches a single book by its work id (used for deeplinks). */
export async function fetchBookById(bookId: string): Promise<Movie | null> {
  try {
    const data = await olGet<OlWorkDetails>(`/works/${bookId}.json`);
    if (!data.title) return null;
    const cover = data.covers?.find((c): c is number => typeof c === 'number') ?? null;
    const yearMatch = data.first_publish_date?.match(/\d{4}/);
    const description = typeof data.description === 'string'
      ? data.description
      : data.description?.value ?? '';
    return {
      id: bookId,
      title: data.title,
      year: yearMatch ? Number(yearMatch[0]) : null,
      genreIds: [],
      genres: toGenreLabels(data.subjects),
      posterPath: coverUrl(cover),
      backdropPath: null,
      overview: description,
      voteAverage: 0,
      voteCount: 0,
      popularity: 0,
      authors: [],
      mediaType: 'book',
    };
  } catch {
    return null;
  }
}
