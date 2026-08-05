/**
 * Central runtime configuration for Shelfed.
 *
 * TMDB credentials are read from an EXPO_PUBLIC_ env var. Anything with that
 * prefix is inlined into the JS bundle at build time, so it is extractable by
 * end users — acceptable for a read-only dev feed, but for production these
 * calls should move behind a server proxy that keeps the token private.
 */

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB-supported poster widths. w500 looks crisp on full-screen cards; w342 is
// plenty for the smaller shelf-grid tiles (less data, faster scrolling).
export const POSTER_SIZE = 'w500';
export const POSTER_SIZE_SMALL = 'w342';

// v4 "API Read Access Token" (Bearer). Set in .env (see .env.example).
export const TMDB_ACCESS_TOKEN = process.env.EXPO_PUBLIC_TMDB_ACCESS_TOKEN ?? '';

// RAWG (video games API). Free key from rawg.io/apikey, set in .env.
export const RAWG_BASE_URL = 'https://api.rawg.io/api';
export const RAWG_API_KEY = process.env.EXPO_PUBLIC_RAWG_API_KEY ?? '';

// Region used for streaming availability (TMDB watch/providers via JustWatch).
export const WATCH_REGION = 'DE';

// The feed rotates through these release-date windows (one per page) so the
// swipe deck mixes movies across decades instead of only recent releases.
export const ERA_WINDOWS: { gte: string; lte: string }[] = [
  { gte: '1970-01-01', lte: '1979-12-31' },
  { gte: '1980-01-01', lte: '1989-12-31' },
  { gte: '1990-01-01', lte: '1999-12-31' },
  { gte: '2000-01-01', lte: '2009-12-31' },
  { gte: '2010-01-01', lte: '2019-12-31' },
  { gte: '2020-01-01', lte: '2029-12-31' },
];

export interface EraOption {
  id: string;
  label: string;
  gte: string;
  lte: string;
}

function yearOption(year: number): EraOption {
  return {
    id: `y${year}`,
    label: String(year),
    gte: `${year}-01-01`,
    lte: `${year}-12-31`,
  };
}

function decadeOption(start: number): EraOption {
  return {
    id: `d${start}`,
    label: `${start}s`,
    gte: `${start}-01-01`,
    lte: `${start + 9}-12-31`,
  };
}

const CURRENT_YEAR = new Date().getFullYear();

// User-selectable release windows for the Discover time filter.
export const ERA_OPTIONS: EraOption[] = [
  yearOption(CURRENT_YEAR),
  yearOption(CURRENT_YEAR - 1),
  decadeOption(2020),
  decadeOption(2010),
  decadeOption(2000),
  decadeOption(1990),
  decadeOption(1980),
  decadeOption(1970),
];

// Common countries of origin for the Discover filter (ISO 3166-1 codes).
export const COUNTRY_OPTIONS: { id: string; name: string }[] = [
  { id: 'BR', name: 'Brazil' },
  { id: 'CA', name: 'Canada' },
  { id: 'CN', name: 'China' },
  { id: 'DK', name: 'Denmark' },
  { id: 'FR', name: 'France' },
  { id: 'DE', name: 'Germany' },
  { id: 'IN', name: 'India' },
  { id: 'IT', name: 'Italy' },
  { id: 'JP', name: 'Japan' },
  { id: 'KR', name: 'Korea' },
  { id: 'ES', name: 'Spain' },
  { id: 'SE', name: 'Sweden' },
  { id: 'GB', name: 'UK' },
  { id: 'US', name: 'USA' },
];

/**
 * Popular streaming services for the Discover "Streaming" filter, as TMDB/
 * JustWatch `with_watch_providers` ids. Availability is resolved for
 * WATCH_REGION (DE) and limited to flatrate (subscription) offers. Ordered by
 * popularity rather than A–Z so the big services sit at the top.
 */
export const PROVIDER_OPTIONS: { id: string; name: string }[] = [
  { id: '8', name: 'Netflix' },
  { id: '9', name: 'Amazon Prime Video' },
  { id: '337', name: 'Disney+' },
  { id: '350', name: 'Apple TV+' },
  { id: '30', name: 'WOW' },
  { id: '531', name: 'Paramount+' },
  { id: '283', name: 'Crunchyroll' },
  { id: '11', name: 'MUBI' },
];

/** RAWG parent-platform ids for the games "Console" filter (platform families). */
export const PLATFORM_OPTIONS: { id: string; name: string }[] = [
  { id: '2', name: 'PlayStation' },
  { id: '3', name: 'Xbox' },
  { id: '7', name: 'Nintendo' },
  { id: '1', name: 'PC' },
  { id: '4,8', name: 'Mobile' }, // RAWG parent platforms iOS + Android
  { id: '11', name: 'SEGA' },
];
