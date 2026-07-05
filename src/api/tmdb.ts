import {
  POSTER_SIZE,
  TMDB_ACCESS_TOKEN,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL,
} from '@/constants/config';

/** Error type for all TMDB failures so callers can distinguish them. */
export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

/** Whether a TMDB token is configured. Used to show a setup hint in the UI. */
export const hasTmdbToken = (): boolean => TMDB_ACCESS_TOKEN.length > 0;

// The selected content language (a TMDB language tag like 'de-DE'). Set from the
// LanguageProvider; defaults to English so the API works before it loads.
let contentLang = 'en-US';

/** Sets the TMDB content language used for localized titles + overviews. */
export function setContentLanguage(tag: string): void {
  contentLang = tag;
}

/** The current TMDB content-language tag (default 'en-US'). */
export function contentLanguage(): string {
  return contentLang;
}

type QueryValue = string | number | boolean | undefined;

// Built manually instead of using URL/URLSearchParams, whose implementations
// are incomplete in React Native's Hermes runtime.
function buildQueryString(params: Record<string, QueryValue>): string {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  return parts.length ? `?${parts.join('&')}` : '';
}

/**
 * Authenticated GET against TMDB v3, using the v4 bearer read token. Central
 * place for auth headers + error handling so feature code stays clean.
 */
export async function tmdbGet<T>(
  path: string,
  params: Record<string, QueryValue> = {},
): Promise<T> {
  if (!hasTmdbToken()) {
    throw new TmdbError(
      'Missing TMDB access token. Copy .env.example to .env and set EXPO_PUBLIC_TMDB_ACCESS_TOKEN, then restart the dev server.',
    );
  }

  const url = `${TMDB_BASE_URL}${path}${buildQueryString(params)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
      },
    });
  } catch (err) {
    throw new TmdbError(
      `Network error contacting TMDB: ${(err as Error).message}`,
    );
  }

  if (!response.ok) {
    throw new TmdbError(
      `TMDB request failed (${response.status}) for ${path}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

/** Builds a full poster URL from a poster_path, or null when there is none. */
export function posterUrl(
  path: string | null,
  size: string = POSTER_SIZE,
): string | null {
  if (!path) return null;
  // Book covers (Open Library) are already absolute URLs.
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}
