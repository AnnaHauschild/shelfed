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

/** Book language options for the Discover filter (Google Books langRestrict). */
export const BOOK_LANGUAGE_OPTIONS: { id: string; name: string }[] = [
  { id: 'any', name: 'Any language' },
  { id: 'de', name: 'Deutsch' },
  { id: 'en', name: 'English' },
  { id: 'fr', name: 'Français' },
  { id: 'es', name: 'Español' },
  { id: 'it', name: 'Italiano' },
  { id: 'pt', name: 'Português' },
  { id: 'ar', name: 'العربية' },
  { id: 'zh', name: '中文' },
  { id: 'ja', name: '日本語' },
  { id: 'ko', name: '한국어' },
];

/** Availability options (Google Books `filter`). */
export const BOOK_AVAILABILITY_OPTIONS: { id: string; name: string }[] = [
  { id: 'free', name: 'Free eBooks' },
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
  /** Both only set on real commercial editions, so they signal cover quality. */
  publisher?: string;
  industryIdentifiers?: { type?: string; identifier?: string }[];
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
  const url = `${GOOGLE_BOOKS_BASE_URL}${path}?${qs}`;
  // Google Books intermittently returns 5xx; retry transient failures before giving up.
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (res.ok) return (await res.json()) as T;
    lastStatus = res.status;
    if (res.status < 500) break; // 4xx won't succeed on retry
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error(`Google Books request failed (${lastStatus})`);
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
    .replace(/&edge=curl/gi, '')}&fife=w640`;
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

// Wording that only distinguishes editions, never works.
const EDITION_NOISE =
  /\b(roman|a novel|the novel|novel|illustrated|annotated|unabridged|abridged|reissue|classics?|klassiker|edition|ausgabe|band|vol|volume)\b/g;

/**
 * Collapses editions of one work. Google Books lists "Dracula", "Dracula:
 * Roman" and "Dracula (Illustrated)" as separate volumes with separate ids, so
 * comparing raw titles lets the same book through several times. The author is
 * reduced to a surname because editions disagree on initials and translators.
 */
export function bookSignature(title: string, author?: string): string {
  const work = title
    .toLowerCase()
    .split(/[:(\[]/)[0]
    .replace(EDITION_NOISE, ' ')
    .replace(/[^a-z0-9äöüßàáâãçèéêíñóôõúü\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const surname = (author ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9äöüßàáâãçèéêíñóôõúü\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .pop();
  return `${work}|${surname ?? ''}`;
}

// Academic/reference categories a leisure reader browsing fiction doesn't want
// (Principles of Physics etc.). Sci-fi is kept via the `fiction` check first.
const NONFICTION_BLOCK = [
  'science',
  'mathematics',
  'study aids',
  'education',
  'reference',
  'technology',
  'engineering',
  'medical',
  'computers',
  'law',
];

/** True for textbook/reference volumes that carry no fiction category. */
function isReferenceVolume(categories: string[] | undefined): boolean {
  if (!categories?.length) return false;
  const joined = categories
    .join(' | ')
    .toLowerCase()
    .replace(/non-?fiction/g, 'nonfic');
  if (joined.includes('fiction')) return false; // any fiction genre => keep
  return NONFICTION_BLOCK.some((k) => joined.includes(k));
}

// Google Books indexes every edition ever scanned, so a plain query mixes
// designed covers with photographed title pages of public-domain reprints.
// Measured on real feed pages: about two thirds of results are pre-2000
// editions, which is where the bare black-on-white covers come from.
function editionScore(volume: GbVolume): number {
  const info = volume.volumeInfo ?? {};
  const year = Number(String(info.publishedDate ?? '').slice(0, 4));
  let points = 0;
  if (Number.isFinite(year)) {
    if (year >= 2010) points += 3;
    else if (year >= 2000) points += 2;
  }
  if (info.publisher) points += 1;
  if ((info.industryIdentifiers ?? []).some((i) => i.type === 'ISBN_13')) {
    points += 1;
  }
  if (info.description) points += 1;
  return points;
}

const GOOD_EDITION = 4;

/**
 * Sorts well-produced editions to the front instead of dropping the rest. A
 * hard filter starved whole genres: of 20 fantasy results only 2 survived one,
 * which would leave the deck looking broken.
 */
function rankEditions(items: GbVolume[]): Movie[] {
  const good: GbVolume[] = [];
  const rest: GbVolume[] = [];
  for (const volume of items) {
    if (isReferenceVolume(volume.volumeInfo?.categories)) continue;
    (editionScore(volume) >= GOOD_EDITION ? good : rest).push(volume);
  }
  return [...shuffle(good), ...shuffle(rest)]
    .map(volumeToMovie)
    .filter((m) => m.posterPath && m.title);
}

/** Round-robins the per-subject results so genres alternate card by card. */
function interleaveBooks(groups: Movie[][]): Movie[] {
  const out: Movie[] = [];
  const longest = Math.max(0, ...groups.map((group) => group.length));
  for (let i = 0; i < longest; i++) {
    for (const group of groups) {
      if (group[i]) out.push(group[i]);
    }
  }
  return out;
}

const BOOK_SUBJECTS_PER_PAGE = 3;

/**
 * One page of the book swipe feed. Unfiltered browsing pulls several subjects
 * in parallel and round-robins them, so a page mixes genres instead of showing
 * twenty of the same. With a subject, author or vibe it stays a single query,
 * because those pools are narrow enough already.
 * NOTE: Google Books has no year-range filter, so `years` is ignored.
 */
export async function fetchBookFeedPage(
  page: number,
  subject?: string,
  _years?: { from: number; to: number },
  authorKey?: string,
  vibeQuery?: string,
  langOverride?: string,
  freeOnly?: boolean,
): Promise<FeedPage> {
  // 'any' disables the restriction; otherwise the picked language or app default.
  const lang =
    langOverride === 'any' ? undefined : langOverride || booksLang();
  const isBrowse = !subject && !authorKey && !vibeQuery && !freeOnly;

  if (isBrowse) {
    const subjects = shuffle([...BOOK_SUBJECTS]).slice(0, BOOK_SUBJECTS_PER_PAGE);
    const responses = await Promise.all(
      subjects.map((name) =>
        gbGet<GbListResponse>('/volumes', {
          q: `subject:"${name}"`,
          // A random slice keeps browsing endless instead of walking the same
          // few hundred titles every session.
          startIndex: Math.floor(Math.random() * 120),
          maxResults: PAGE_SIZE,
          printType: 'books',
          orderBy: 'relevance',
          langRestrict: lang,
        }),
      ),
    );
    const movies = interleaveBooks(
      responses.map((res) => rankEditions(res.items ?? [])),
    );
    // Browse never ends: there is always another random subject.
    return { movies, nextPage: page + 1 };
  }

  const qParts: string[] = [];
  if (authorKey) qParts.push(`inauthor:"${authorKey}"`);
  if (subject) qParts.push(`subject:"${subject}"`);
  if (vibeQuery) qParts.push(vibeQuery);
  if (qParts.length === 0) {
    const rotating =
      BOOK_SUBJECTS[Math.floor(Math.random() * BOOK_SUBJECTS.length)];
    qParts.push(`subject:"${rotating}"`);
  }
  // Small jitter mixes popular titles in; author lists stay exact so they can
  // actually reach an end.
  const startIndex =
    (page - 1) * PAGE_SIZE + (authorKey ? 0 : Math.floor(Math.random() * 40));
  const data = await gbGet<GbListResponse>('/volumes', {
    q: qParts.join(' '),
    startIndex,
    maxResults: PAGE_SIZE,
    printType: 'books',
    orderBy: 'relevance',
    langRestrict: lang,
    filter: freeOnly ? 'free-ebooks' : undefined,
  });
  const items = data.items ?? [];
  const movies = rankEditions(items);
  const total = data.totalItems ?? 0;
  const hasMore = startIndex + PAGE_SIZE < total && items.length > 0;
  return { movies, nextPage: hasMore ? page + 1 : null };
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
