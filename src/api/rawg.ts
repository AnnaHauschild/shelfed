import { RAWG_API_KEY, RAWG_BASE_URL } from '@/constants/config';
import type { FeedPage } from './movies';
import { Movie } from './types';

const PAGE_SIZE = 20;

/** Whether a RAWG API key is configured (games need it, like TMDB for films). */
export const hasRawgKey = (): boolean => RAWG_API_KEY.length > 0;

type QueryValue = string | number | boolean | undefined;

function buildQuery(params: Record<string, QueryValue>): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

/** GET against the RAWG API, injecting the key. Throws on non-2xx. */
async function rawgGet<T>(
  path: string,
  params: Record<string, QueryValue> = {},
): Promise<T> {
  const url = `${RAWG_BASE_URL}${path}${buildQuery({ key: RAWG_API_KEY, ...params })}`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`RAWG request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

interface RawgParentPlatform {
  platform: { id: number; name: string; slug: string };
}

interface RawgGame {
  id: number;
  slug: string;
  name: string;
  released: string | null; // 'YYYY-MM-DD'
  background_image: string | null;
  rating: number; // 0–5
  ratings_count: number;
  added: number; // how many users added it (popularity proxy)
  metacritic: number | null;
  genres?: RawgGenre[];
  parent_platforms?: RawgParentPlatform[];
}

interface RawgGameDetail extends RawgGame {
  description_raw?: string;
}

interface RawgPaged<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Top parent platforms (PC, PlayStation, Xbox …) — shown in the "authors" slot. */
function platformNames(g: RawgGame): string[] {
  return (g.parent_platforms ?? []).map((p) => p.platform.name).slice(0, 4);
}

/** Maps a RAWG game into the app's normalised Movie shape. */
function gameToMovie(g: RawgGame): Movie {
  const parsedYear = g.released ? Number(g.released.slice(0, 4)) : NaN;
  // RAWG ratings are 0–5; scale to the 0–10 used everywhere else in the app.
  const rating = g.rating ? Math.round(g.rating * 2 * 10) / 10 : 0;

  return {
    id: String(g.id),
    title: g.name,
    year: Number.isFinite(parsedYear) ? parsedYear : null,
    genreIds: (g.genres ?? []).map((x) => x.id),
    genres: (g.genres ?? []).map((x) => x.name),
    // RAWG images are absolute URLs; posterUrl() passes http(s) URLs through.
    posterPath: g.background_image,
    backdropPath: g.background_image,
    overview: '',
    voteAverage: rating,
    voteCount: g.ratings_count ?? 0,
    popularity: g.added ?? 0,
    authors: platformNames(g),
    mediaType: 'game',
  };
}

/** Selectable game genres for the Discover filter (RAWG genre slugs). */
export async function getGameGenreOptions(): Promise<
  { id: string; name: string }[]
> {
  if (!hasRawgKey()) return [];
  try {
    const data = await rawgGet<RawgPaged<RawgGenre>>('/genres', {
      page_size: 40,
    });
    return data.results
      .map((g) => ({ id: g.slug, name: g.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/**
 * One page of the game swipe feed. Ordered by popularity ("added"); with a
 * genre it browses that genre, with a year window it clamps release dates.
 */
export async function fetchGameFeedPage(
  page: number,
  genre?: string,
  years?: { from: number; to: number },
): Promise<FeedPage> {
  if (!hasRawgKey()) return { movies: [], nextPage: null };
  const dates = years ? `${years.from}-01-01,${years.to}-12-31` : undefined;
  const data = await rawgGet<RawgPaged<RawgGame>>('/games', {
    page,
    page_size: PAGE_SIZE,
    ordering: '-added',
    genres: genre,
    dates,
  });
  const movies = data.results
    .filter((g) => g.background_image)
    .map(gameToMovie);
  return { movies, nextPage: data.next ? page + 1 : null };
}

/** Free-text game search for the Search tab. */
export async function searchGames(
  query: string,
  page: number = 1,
): Promise<FeedPage> {
  if (!hasRawgKey()) return { movies: [], nextPage: null };
  const data = await rawgGet<RawgPaged<RawgGame>>('/games', {
    search: query,
    page,
    page_size: PAGE_SIZE,
  });
  const movies = data.results
    .filter((g) => g.background_image)
    .map(gameToMovie);
  return { movies, nextPage: data.next ? page + 1 : null };
}

/** Fetches a single game by id (deeplinks), including its description. */
export async function fetchGameById(id: string): Promise<Movie | null> {
  if (!hasRawgKey()) return null;
  try {
    const g = await rawgGet<RawgGameDetail>(`/games/${id}`);
    return { ...gameToMovie(g), overview: g.description_raw ?? '' };
  } catch {
    return null;
  }
}

/** Lazily fetches a game's long description (RAWG detail endpoint). */
export async function fetchGameDescription(id: string): Promise<string> {
  if (!hasRawgKey()) return '';
  try {
    const g = await rawgGet<RawgGameDetail>(`/games/${id}`);
    return g.description_raw ?? '';
  } catch {
    return '';
  }
}
