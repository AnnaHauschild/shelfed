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
  { id: 'US', name: 'USA' },
  { id: 'GB', name: 'UK' },
  { id: 'DE', name: 'Germany' },
  { id: 'FR', name: 'France' },
  { id: 'IT', name: 'Italy' },
  { id: 'ES', name: 'Spain' },
  { id: 'JP', name: 'Japan' },
  { id: 'KR', name: 'Korea' },
  { id: 'IN', name: 'India' },
  { id: 'BR', name: 'Brazil' },
  { id: 'SE', name: 'Sweden' },
  { id: 'DK', name: 'Denmark' },
  { id: 'CA', name: 'Canada' },
];
