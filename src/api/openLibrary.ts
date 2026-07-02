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

// Default year rotation for the book feed when the user hasn't picked an era.
// Older books catalogue heavily on OL, so we weight recent decades to keep the
// deck feeling fresh — mirrors the TV_DEFAULT_WINDOWS approach in movies.ts.
// Slots: any (1), 1980+ (2), 2000+ (2)  →  ~20% classics / ~40% modern / ~40% current.
const BOOK_DEFAULT_YEAR_WINDOWS: { from: number; to: number }[] = [
  { from: 1900, to: 2029 },
  { from: 1980, to: 2029 },
  { from: 1980, to: 2029 },
  { from: 2000, to: 2029 },
  { from: 2000, to: 2029 },
];

// Open Library returns many textbook-style entries (study guides, SparkNotes,
// exam prep) that aren't the leisure reading Shelfed is for. Filter both by
// subject (via search query NOT clauses) and by title as a safety net.
const OL_EXCLUDED_SUBJECTS = [
  'study guides',
  'study aids',
  'sparknotes',
  'cliffsnotes',
  'examinations',
  'notes, examinations, etc',
  'outlines, syllabi, etc',
  'literature textbooks',
];

const STUDY_GUIDE_TITLE_PATTERN =
  /\b(study\s*guide|sparknotes?|cliffs?\s*notes|readers?'?\s*guide|teachers?'?\s*guide|summary\s+(and|of)|analysis\s+of|book\s*notes|literature\s*guide|workbook|exam\s*(prep|preparation))\b/i;

function isStudyGuide(doc: OlSearchDoc): boolean {
  if (STUDY_GUIDE_TITLE_PATTERN.test(doc.title)) return true;
  const subjects = (doc.subject ?? []).map((s) => s.toLowerCase());
  return subjects.some((s) =>
    OL_EXCLUDED_SUBJECTS.some((bad) => s.includes(bad)),
  );
}

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
 * When no era is picked, biases toward recent decades so classics show up
 * occasionally rather than dominating.
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
  const effectiveYears =
    years ??
    BOOK_DEFAULT_YEAR_WINDOWS[
      Math.floor(Math.random() * BOOK_DEFAULT_YEAR_WINDOWS.length)
    ];
  parts.push(
    `first_publish_year:[${effectiveYears.from} TO ${effectiveYears.to}]`,
  );
  const noUserSubject = !subject;
  if (noUserSubject) {
    // OL search rejects bare `q=*`; we pick a random subject for breadth and
    // sort by readinglog so each subject still surfaces its popular books.
    const rotating =
      BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    parts.push(`subject:${rotating}`);
  }
  // Exclude study-guide / textbook subjects at the query level.
  for (const bad of OL_EXCLUDED_SUBJECTS) {
    parts.push(`NOT subject:"${bad}"`);
  }
  const query = parts.join(' AND ');
  const result = await searchBooks(
    query,
    page,
    noUserSubject ? 'readinglog' : undefined,
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

  const movies = data.docs
    .filter((d) => d.cover_i)
    .filter((d) => !isStudyGuide(d))
    .map(docToMovie);
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
