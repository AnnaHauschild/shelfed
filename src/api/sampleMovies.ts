import { Movie } from './types';

/**
 * Offline demo feed.
 *
 * Used automatically by the discovery feed when no TMDB token is configured, so
 * the app is fully usable (swipe, shelf, watchlist, favorites) out of the box.
 * The moment a token is added in `.env`, the live TMDB catalog takes over.
 *
 * - Real TMDB ids are used so interactions stay consistent if the user later
 *   adds a token (a demo "watched" movie won't reappear in the live feed).
 * - `posterPath` is left null on purpose: without a token we don't resolve
 *   exact poster hashes, so cards fall back to the on-brand title treatment.
 *   Real artwork appears once the live catalog is enabled.
 */
type RawSampleMovie = Omit<Movie, 'id' | 'mediaType'> & { id: number };

const RAW_SAMPLE_MOVIES: RawSampleMovie[] = [
  {
    id: 603,
    title: 'The Matrix',
    year: 1999,
    genreIds: [28, 878],
    genres: ['Action', 'Sci-Fi'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A hacker learns that his reality is a simulation and joins a rebellion against the machines.',
    voteAverage: 8.2,
    voteCount: 24000,
    popularity: 95,
  },
  {
    id: 680,
    title: 'Pulp Fiction',
    year: 1994,
    genreIds: [53, 80],
    genres: ['Thriller', 'Crime'],
    posterPath: null,
    backdropPath: null,
    overview:
      'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    voteAverage: 8.5,
    voteCount: 27000,
    popularity: 90,
  },
  {
    id: 238,
    title: 'The Godfather',
    year: 1972,
    genreIds: [18, 80],
    genres: ['Drama', 'Crime'],
    posterPath: null,
    backdropPath: null,
    overview:
      'The aging patriarch of an organized crime dynasty transfers control of his empire to his reluctant son.',
    voteAverage: 8.7,
    voteCount: 19000,
    popularity: 88,
  },
  {
    id: 550,
    title: 'Fight Club',
    year: 1999,
    genreIds: [18],
    genres: ['Drama'],
    posterPath: null,
    backdropPath: null,
    overview:
      'An insomniac office worker and a soap maker form an underground fight club that evolves into something much more.',
    voteAverage: 8.4,
    voteCount: 27000,
    popularity: 85,
  },
  {
    id: 13,
    title: 'Forrest Gump',
    year: 1994,
    genreIds: [35, 18, 10749],
    genres: ['Comedy', 'Drama', 'Romance'],
    posterPath: null,
    backdropPath: null,
    overview:
      'The presidencies of Kennedy and Johnson, Vietnam, and more unfold through the eyes of a kind-hearted Alabama man.',
    voteAverage: 8.5,
    voteCount: 26000,
    popularity: 84,
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    year: 1994,
    genreIds: [18, 80],
    genres: ['Drama', 'Crime'],
    posterPath: null,
    backdropPath: null,
    overview:
      'Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency.',
    voteAverage: 8.7,
    voteCount: 26000,
    popularity: 83,
  },
  {
    id: 27205,
    title: 'Inception',
    year: 2010,
    genreIds: [28, 878, 12],
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A thief who steals corporate secrets through dream-sharing is given the inverse task of planting an idea.',
    voteAverage: 8.4,
    voteCount: 35000,
    popularity: 92,
  },
  {
    id: 155,
    title: 'The Dark Knight',
    year: 2008,
    genreIds: [18, 28, 80, 53],
    genres: ['Drama', 'Action', 'Crime', 'Thriller'],
    posterPath: null,
    backdropPath: null,
    overview:
      'Batman faces the Joker, a criminal mastermind who plunges Gotham City into anarchy.',
    voteAverage: 8.5,
    voteCount: 32000,
    popularity: 93,
  },
  {
    id: 157336,
    title: 'Interstellar',
    year: 2014,
    genreIds: [12, 18, 878],
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
    voteAverage: 8.4,
    voteCount: 34000,
    popularity: 91,
  },
  {
    id: 105,
    title: 'Back to the Future',
    year: 1985,
    genreIds: [12, 35, 878],
    genres: ['Adventure', 'Comedy', 'Sci-Fi'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A teenager is accidentally sent thirty years into the past in a time-traveling DeLorean.',
    voteAverage: 8.3,
    voteCount: 19000,
    popularity: 80,
  },
  {
    id: 329,
    title: 'Jurassic Park',
    year: 1993,
    genreIds: [12, 878],
    genres: ['Adventure', 'Sci-Fi'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A theme park of cloned dinosaurs descends into chaos when the creatures break loose.',
    voteAverage: 8.1,
    voteCount: 16000,
    popularity: 82,
  },
  {
    id: 348,
    title: 'Alien',
    year: 1979,
    genreIds: [27, 878],
    genres: ['Horror', 'Sci-Fi'],
    posterPath: null,
    backdropPath: null,
    overview:
      'The crew of a commercial spacecraft is hunted by a deadly extraterrestrial after investigating a distress signal.',
    voteAverage: 8.1,
    voteCount: 14000,
    popularity: 78,
  },
  {
    id: 769,
    title: 'GoodFellas',
    year: 1990,
    genreIds: [18, 80],
    genres: ['Drama', 'Crime'],
    posterPath: null,
    backdropPath: null,
    overview:
      'The rise and fall of a mob associate over three decades in the New York criminal underworld.',
    voteAverage: 8.5,
    voteCount: 13000,
    popularity: 76,
  },
  {
    id: 8587,
    title: 'The Lion King',
    year: 1994,
    genreIds: [16, 10751, 18],
    genres: ['Animation', 'Family', 'Drama'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A young lion prince flees his kingdom after the murder of his father, only to learn the true meaning of responsibility.',
    voteAverage: 8.3,
    voteCount: 18000,
    popularity: 81,
  },
  {
    id: 597,
    title: 'Titanic',
    year: 1997,
    genreIds: [18, 10749],
    genres: ['Drama', 'Romance'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A seventeen-year-old aristocrat falls in love with a penniless artist aboard the doomed R.M.S. Titanic.',
    voteAverage: 7.9,
    voteCount: 24000,
    popularity: 86,
  },
  {
    id: 98,
    title: 'Gladiator',
    year: 2000,
    genreIds: [28, 18, 12],
    genres: ['Action', 'Drama', 'Adventure'],
    posterPath: null,
    backdropPath: null,
    overview:
      'A betrayed Roman general rises through the gladiatorial arena to avenge the murder of his family.',
    voteAverage: 8.2,
    voteCount: 18000,
    popularity: 79,
  },
];

/** The demo feed, tagged as movies. */
export const SAMPLE_MOVIES: Movie[] = RAW_SAMPLE_MOVIES.map((m) => ({
  ...m,
  id: String(m.id),
  mediaType: 'movie',
}));
