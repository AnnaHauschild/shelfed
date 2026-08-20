import type { FeedPage } from './movies';
import { Movie } from './types';
import { contentLanguage } from './tmdb';
import { GOOGLE_BOOKS_API_KEY, GOOGLE_BOOKS_BASE_URL } from '@/constants/config';

const PAGE_SIZE = 20;

// Subjects the browse feed rotates through when nothing is picked (fiction core).
const BOOK_SUBJECTS = [
  'fiction',
  'fantasy',
  'science fiction',
  'mystery',
  'thriller',
  'romance',
  'historical fiction',
  'horror',
  'young adult fiction',
  'crime',
  'adventure',
  'classics',
];

/** Book "genres" for the Discover filter (the id is used as `subject:"id"`). */
export const BOOK_GENRE_OPTIONS: { id: string; name: string }[] = [
  { id: 'fiction', name: 'Fiction' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'science fiction', name: 'Science Fiction' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'romance', name: 'Romance' },
  { id: 'historical fiction', name: 'Historical' },
  { id: 'horror', name: 'Horror' },
  { id: 'young adult fiction', name: 'Young Adult' },
  { id: 'crime', name: 'Crime' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'classics', name: 'Classics' },
  { id: 'poetry', name: 'Poetry' },
  { id: 'comics & graphic novels', name: 'Comics' },
  { id: 'biography & autobiography', name: 'Biography' },
  { id: 'self-help', name: 'Self-Help' },
  { id: 'humor', name: 'Humor' },
  { id: 'juvenile fiction', name: "Children's" },
];

interface GbImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
}

interface GbVolumeInfo {
  title?: string;
  authors?: string[];
  publishedDate?: string;
  description?: string;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: GbImageLinks;
  language?: string;
}

interface GbVolume {
  id: string;
  volumeInfo?: GbVolumeInfo;
}

interface GbListResponse {
  totalItems?: number;
  items?: GbVolume[];
}

type QueryValue = string | number | undefined;

async function gbGet<T>(
  path: string,
  params: Record<string, QueryValue>,
): Promise<T> {
  const all: Record<string, QueryValue> = { ...params };
  if (GOOGLE_BOOKS_API_KEY) all.key = GOOGLE_BOOKS_API_KEY;
  const qs = Object.entries(all)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');
  const res = await fetch(`${GOOGLE_BOOKS_BASE_URL}${path}?${qs}`, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Google Books request failed (${res.status})`);
  return (await res.json()) as T;
}

/** Bias the browse feed to the user's language (search stays unrestricted). */
function booksLang(): string | undefined {
  const code = contentLanguage().slice(0, 2).toLowerCase();
  return code || undefined;
}

/**
 * Turns Google's tiny thumbnail into a crisp, flat cover: force https, drop the
 * fake page-curl overlay, and request a larger width.
 */
function coverUrl(links: GbImageLinks | undefined): string | null {
  const raw = links?.thumbnail ?? links?.smallThumbnail;
  if (!raw) return null;
  return `${raw
    .replace(/^http:\/\//, 'https://')
    .replace(/&edge=curl/gi, '')}&fife=w480`;
}

/** Strips HTML tags/entities from Google's descriptions into clean text. */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function volumeToMovie(v: GbVolume): Movie {
  const info = v.volumeInfo ?? {};
  const parsedYear = info.publishedDate
    ? Number(info.publishedDate.slice(0, 4))
    : NaN;
  const rating = info.averageRating
    ? Math.round(info.averageRating * 2 * 10) / 10
    : 0;
  return {
    id: v.id,
    title: info.title ?? '',
    year: Number.isFinite(parsedYear) ? parsedYear : null,
    genreIds: [],
    genres: (info.categories ?? [])
      .slice(0, 4)
      .map((c) => c.split('/').pop()!.trim()),
    posterPath: coverUrl(info.imageLinks),
    backdropPath: null,
    overview: stripHtml(info.description ?? ''),
    voteAverage: rating,
    voteCount: info.ratingsCount ?? 0,
    popularity: 0,
    authors: info.authors ?? [],
    mediaType: 'book',
  };
}

// Fisher-Yates shuffle (in-place).
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * One page of the book swipe feed. With a subject it browses that genre; with an
 * author it lists their books; with neither it rotates a random subject so the
 * deck mixes genres. Biased to the user's language.
 * NOTE: Google Books has no year-range filter, so `years` is ignored.
 */
export async function fetchBookFeedPage(
  page: number,
  subject?: string,
  _years?: { from: number; to: number },
  authorKey?: string,
  vibeQuery?: string,
): Promise<FeedPage> {
  const qParts: string[] = [];
  if (authorKey) qParts.push(`inauthor:"${authorKey}"`);
  if (subject) qParts.push(`subject:"${subject}"`);
  if (vibeQuery) qParts.push(vibeQuery);
  if (qParts.length === 0) {
    const rotating =
      BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    qParts.push(`subject:"${rotating}"`);
  }
  const startIndex = (page - 1) * PAGE_SIZE;
  const data = await gbGet<GbListResponse>('/volumes', {
    q: qParts.join(' '),
    startIndex,
    maxResults: PAGE_SIZE,
    printType: 'books',
    orderBy: 'relevance',
    langRestrict: booksLang(),
  });
  const items = data.items ?? [];
  const movies = items
    .map(volumeToMovie)
    .filter((m) => m.posterPath && m.title);
  const total = data.totalItems ?? 0;
  const hasMore = startIndex + PAGE_SIZE < total && items.length > 0;
  return { movies: shuffle(movies), nextPage: hasMore ? page + 1 : null };
}

/** Free-text book search. No language restriction, so foreign titles show up. */
export async function searchBooks(
  query: string,
  page: number,
  _sort?: string,
): Promise<FeedPage> {
  const startIndex = (page - 1) * PAGE_SIZE;
  const data = await gbGet<GbListResponse>('/volumes', {
    q: query,
    startIndex,
    maxResults: PAGE_SIZE,
    printType: 'books',
  });
  const items = data.items ?? [];
  const movies = items
    .map(volumeToMovie)
    .filter((m) => m.posterPath && m.title);
  const total = data.totalItems ?? 0;
  const hasMore = startIndex + PAGE_SIZE < total && items.length > 0;
  return { movies, nextPage: hasMore ? page + 1 : null };
}

/** A book's clean description (lazy, for the details view). */
export async function fetchBookDescription(
  bookId: string,
): Promise<string | null> {
  try {
    const v = await gbGet<GbVolume>(`/volumes/${bookId}`, {});
    const d = v.volumeInfo?.description;
    return d ? stripHtml(d) : null;
  } catch {
    return null;
  }
}

/** A single book by its Google Books volume id (used for deeplinks). */
export async function fetchBookById(bookId: string): Promise<Movie | null> {
  try {
    const v = await gbGet<GbVolume>(`/volumes/${bookId}`, {});
    if (!v.volumeInfo?.title) return null;
    return volumeToMovie(v);
  } catch {
    return null;
  }
}

/** A matched author, enough to show a picker row and filter the feed by. */
export interface AuthorHit {
  key: string; // the author name (used as inauthor:"…")
  name: string;
  topWork?: string;
}

/** Author search for the books filter — distinct authors from a volume search. */
export async function searchAuthors(query: string): Promise<AuthorHit[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await gbGet<GbListResponse>('/volumes', {
    q: `inauthor:${q}`,
    maxResults: 20,
    printType: 'books',
  });
  const ql = q.toLowerCase();
  const seen = new Map<string, string | undefined>();
  for (const v of data.items ?? []) {
    const info = v.volumeInfo ?? {};
    for (const name of info.authors ?? []) {
      if (name.toLowerCase().includes(ql) && !seen.has(name)) {
        seen.set(name, info.title);
      }
    }
  }
  return Array.from(seen.entries())
    .slice(0, 10)
    .map(([name, topWork]) => ({ key: name, name, topWork }));
}
