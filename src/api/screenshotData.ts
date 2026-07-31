import { MediaType, Movie } from './types';

/**
 * SCREENSHOT MODE — a build-time switch used ONLY to produce copyright-clean
 * App Store / Play Store screenshots.
 *
 * When EXPO_PUBLIC_SCREENSHOT_MODE=1, the Discover deck shows a small set of
 * ORIGINAL, made-up titles with our own generated cover artwork (see FakeCover
 * in PosterImage) instead of real third-party posters. This lets us capture the
 * real app UI without displaying any protected third-party imagery.
 *
 * Leave the flag OFF (unset) for real builds.
 */
export const SCREENSHOT_MODE = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';

function m(
  id: string,
  title: string,
  year: number,
  voteAverage: number,
  genres: string[],
  mediaType: MediaType,
  authors?: string[],
): Movie {
  return {
    id: `fake-${id}`,
    title,
    year,
    genreIds: [],
    genres,
    posterPath: '#fake',
    backdropPath: null,
    overview: '',
    voteAverage,
    voteCount: 1200,
    popularity: 0,
    authors,
    mediaType,
  };
}

// Original, made-up titles (no real works) with a warm, cinematic vibe.
const MOVIES: Movie[] = [
  m('mv1', 'The Long Way North', 2023, 8.1, ['Adventure', 'Drama'], 'movie'),
  m('mv2', 'Golden Hour', 2022, 7.9, ['Drama', 'Romance'], 'movie'),
  m('mv3', 'Nightfall Road', 2021, 7.3, ['Thriller', 'Mystery'], 'movie'),
  m('mv4', 'Salt & Pine', 2019, 7.8, ['Drama'], 'movie'),
  m('mv5', 'After the Rain', 2024, 8.0, ['Drama', 'Romance'], 'movie'),
  m('mv6', 'Wanderers', 2023, 7.7, ['Adventure'], 'movie'),
  m('mv7', 'The Quiet Season', 2018, 7.4, ['Mystery', 'Drama'], 'movie'),
  m('mv8', 'Coastline', 2022, 7.6, ['Drama'], 'movie'),
];

const SERIES: Movie[] = [
  m('tv1', 'Northbound', 2022, 8.2, ['Drama'], 'tv'),
  m('tv2', 'Tidewater', 2021, 7.9, ['Crime', 'Mystery'], 'tv'),
  m('tv3', 'Cabin Nine', 2023, 7.5, ['Thriller'], 'tv'),
  m('tv4', 'The Detour', 2020, 7.8, ['Comedy', 'Drama'], 'tv'),
  m('tv5', 'Harbor Lights', 2019, 8.0, ['Drama'], 'tv'),
  m('tv6', 'Wildwood', 2024, 7.6, ['Adventure'], 'tv'),
];

const BOOKS: Movie[] = [
  m('bk1', 'Between the Pines', 2021, 8.4, ['Fiction'], 'book', ['E. M. Hale']),
  m('bk2', 'A Map of Small Roads', 2020, 8.1, ['Travel'], 'book', ['J. Rivers']),
  m('bk3', 'The Weekend House', 2022, 7.9, ['Fiction'], 'book', ['Clara Voss']),
  m('bk4', 'Letters to the Sea', 2019, 8.2, ['Fiction'], 'book', ['Nadia Brandt']),
  m('bk5', 'Woodsmoke', 2023, 7.7, ['Mystery'], 'book', ['T. A. Nolan']),
  m('bk6', 'The Winter Guest', 2018, 8.0, ['Fiction'], 'book', ['Marta Lindqvist']),
];

const GAMES: Movie[] = [
  m('gm1', 'Trailblazer', 2022, 8.5, ['Adventure'], 'game'),
  m('gm2', 'Driftwood', 2021, 8.1, ['Indie'], 'game'),
  m('gm3', 'Summit', 2023, 8.3, ['Adventure'], 'game'),
  m('gm4', 'The Open Road', 2020, 7.9, ['Racing'], 'game'),
  m('gm5', 'Lantern', 2024, 8.6, ['Puzzle'], 'game'),
  m('gm6', 'Homestead', 2022, 8.0, ['Simulation'], 'game'),
];

/** The fake Discover feed for a category, used only in screenshot mode. */
export function screenshotFeed(mediaType: MediaType): Movie[] {
  switch (mediaType) {
    case 'tv':
      return SERIES;
    case 'book':
      return BOOKS;
    case 'game':
      return GAMES;
    default:
      return MOVIES;
  }
}
