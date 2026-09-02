import type { FeedPage } from './movies';
import { Movie } from './types';
import { contentLanguage } from './tmdb';
import { GOOGLE_BOOKS_API_KEY, GOOGLE_BOOKS_BASE_URL } from '@/constants/config';

const PAGE_SIZE = 20;

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
  /** `viewability` turned out to be the best available cover-quality signal. */
  accessInfo?: { viewability?: string };
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
 * fake page-curl overlay, and request a larger width. Well-produced editions
 * carry a ~1750px source, and a swipe card is around 1000 physical pixels wide,
 * so anything below that is visibly soft on the fine type of a book cover.
 */
function coverUrl(links: GbImageLinks | undefined): string | null {
  const raw = links?.thumbnail ?? links?.smallThumbnail;
  if (!raw) return null;
  return `${raw
    .replace(/^http:\/\//, 'https://')
    .replace(/&edge=curl/gi, '')}&fife=w1000`;
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
// (Principles of Physics, A Companion to the English Novel). The `fiction`
// check in isReferenceVolume runs first, so "Historical Fiction" stays safe.
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
  'literary criticism',
  'literary collections',
  'literature',
  'library',
  'language arts',
  'foreign language',
  'biography',
  'history',
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

// Google's `filter=partial` only works with plain keyword queries, never with
// `subject:`, and it is the whole ballgame for cover quality: volumes Google is
// allowed to preview come from a publisher deal and carry real artwork, while
// the rest get a generated black-on-white title page. Measured on real pages:
// subject: queries were 12% real covers, these are close to 100%.
// The wording matters too, plain "romance" matches library catalogues of
// medieval romances, so each entry below was checked against the API.
const BROWSE_QUERIES = [
  'thriller',
  'contemporary romance',
  'fantasy novel',
  'science fiction novel',
  'crime novel',
  'horror novel',
  'historical fiction',
  'young adult fiction',
  'mystery novel',
  'adventure novel',
];

/** Keyword queries also match library catalogues, annual reports and academia. */
function isFiction(categories: string[] | undefined): boolean {
  const joined = (categories ?? [])
    .join(' | ')
    .toLowerCase()
    .replace(/non-?fiction/g, '');
  return joined.includes('fiction');
}

// Google Books indexes every edition ever scanned, so a plain query mixes
// designed covers with generated black-on-white title pages. Print-on-demand
// reprints of public-domain works are the worst offenders and the reason a
// plain "recent edition" score backfired: they carry a current year, an ISBN
// and a publisher, so they used to be ranked to the very top.
const REPRINT_MARKERS =
  /\b(annotated|illustrated|unabridged|abridged|complete works|classic edition|with an introduction)\b/i;

// Publishers bundle several novels into one listing ("Christmas Paradise
// Collection", "Modern Romance May 2026 Books 1-4"). They are real products but
// they are not a book you can put on a shelf, so they are dropped outright.
const BUNDLE_MARKERS =
  /\b(collection|box(ed)? set|omnibus|anthology|bundle|complete series|books? \d+\s*[-–]\s*\d+|\d+-book|part \d)\b/i;

// Category romance lines publish several interchangeable titles a month, and
// they crowd out everything else in the romance queries (58% of one page).
// Dropped while browsing only: someone who searches for them still finds them.
// The publisher field is no help, Harlequin now ships as "HarperCollins UK",
// but the imprint is always in the title.
const SERIES_IMPRINTS =
  /\b(mills\s*(&|and)\s*boon|harlequin|kimani|love inspired|silhouette|american romance)\b/i;

// Books ABOUT books. They carry a Fiction category often enough to slip past
// the category check, so they are matched on the title instead.
const ABOUT_BOOKS =
  /\b(a guide to|descriptive list|bibliograph|index to|catalogue of|catalog of|companion to|reader'?s guide|encyclopedia of|dictionary of)\b/i;

// "The Martin Beck series" is every novel in one listing, while "(Lindsay Gordon
// Crime Series, Book 4)" is a single volume, so the book number decides.
const SERIES_OMNIBUS = /\bseries\b/i;
const SINGLE_VOLUME = /\b(book|vol|volume|part|no)\.?\s*\d+/i;

// Individual titles kept out of browsing after someone looked at the actual
// cover art, which no metadata can describe. Search still finds them.
const BLOCKED_IN_BROWSE = [
  'prelude in prague', // cover is dominated by a swastika
];

function editionScore(volume: GbVolume): number {
  const info = volume.volumeInfo ?? {};
  const year = Number(String(info.publishedDate ?? '').slice(0, 4));
  let points = 0;
  // Measured on real feed pages: volumes Google may show a preview of come
  // from a publisher deal and had a median cover of 102 kB, against 17 kB for
  // the rest, with not a single generated cover among them.
  if (volume.accessInfo?.viewability === 'PARTIAL') points += 4;
  if (Number.isFinite(year)) {
    if (year >= 2010) points += 2;
    else if (year >= 2000) points += 1;
  }
  if (info.publisher) points += 1;
  if ((info.industryIdentifiers ?? []).some((i) => i.type === 'ISBN_13')) {
    points += 1;
  }
  if (info.description) points += 1;
  if (REPRINT_MARKERS.test(info.title ?? '')) points -= 3;
  return points;
}

const GOOD_EDITION = 5;

/**
 * Sorts well-produced editions to the front instead of dropping the rest. A
 * hard filter starved whole genres: of 20 fantasy results only 2 survived one,
 * which would leave the deck looking broken.
 */
function rankEditions(
  items: GbVolume[],
  opts: { requireFiction?: boolean; browsing?: boolean } = {},
): Movie[] {
  const good: GbVolume[] = [];
  const rest: GbVolume[] = [];
  for (const volume of items) {
    const title = volume.volumeInfo?.title ?? '';
    if (isReferenceVolume(volume.volumeInfo?.categories)) continue;
    if (BUNDLE_MARKERS.test(title)) continue;
    // Two-in-one and three-in-one volumes list every contained novel in the
    // title ("Her Boss, Her Rancher: Sunrise On The Ranch: Cowboy Proud"), so
    // a second colon is a reliable giveaway that this is not one book.
    if ((title.match(/:/g)?.length ?? 0) >= 2) continue;
    if (opts.browsing && ABOUT_BOOKS.test(title)) continue;
    if (
      opts.browsing &&
      BLOCKED_IN_BROWSE.some((blocked) => title.toLowerCase().includes(blocked))
    ) {
      continue;
    }
    if (
      opts.browsing &&
      SERIES_OMNIBUS.test(title) &&
      !SINGLE_VOLUME.test(title)
    ) {
      continue;
    }
    if (opts.browsing && SERIES_IMPRINTS.test(title)) continue;
    if (opts.requireFiction && !isFiction(volume.volumeInfo?.categories)) {
      continue;
    }
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

const BROWSE_QUERIES_PER_PAGE = 3;

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
    const queries = shuffle([...BROWSE_QUERIES]).slice(0, BROWSE_QUERIES_PER_PAGE);
    const responses = await Promise.all(
      queries.map((query) =>
        gbGet<GbListResponse>('/volumes', {
          q: query,
          // A random slice keeps browsing endless instead of walking the same
          // few hundred titles every session.
          startIndex: Math.floor(Math.random() * 40),
          maxResults: PAGE_SIZE,
          printType: 'books',
          orderBy: 'relevance',
          filter: 'partial',
          langRestrict: lang,
        }),
      ),
    );
    const movies = interleaveBooks(
      responses.map((res) =>
        rankEditions(res.items ?? [], { requireFiction: true, browsing: true }),
      ),
    );
    // Browse never ends: there is always another random query.
    return { movies, nextPage: page + 1 };
  }

  const qParts: string[] = [];
  if (authorKey) qParts.push(`inauthor:"${authorKey}"`);
  if (vibeQuery) qParts.push(vibeQuery);
  // A picked genre goes in as a plain keyword, because `filter=partial` (which
  // is what keeps the covers real) is incompatible with `subject:`.
  if (subject && !authorKey && !vibeQuery) qParts.push(subject);
  else if (subject) qParts.push(`subject:"${subject}"`);
  if (qParts.length === 0) {
    qParts.push(
      BROWSE_QUERIES[Math.floor(Math.random() * BROWSE_QUERIES.length)],
    );
  }
  // Free ebooks need their own filter value, so those keep the old behaviour.
  const plainGenre = !!subject && !authorKey && !vibeQuery && !freeOnly;
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
    filter: freeOnly ? 'free-ebooks' : plainGenre ? 'partial' : undefined,
  });
  const items = data.items ?? [];
  const movies = rankEditions(items, { requireFiction: plainGenre });
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
