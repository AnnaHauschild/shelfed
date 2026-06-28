import { ERA_OPTIONS, ERA_WINDOWS, WATCH_REGION } from '@/constants/config';
import { GENRE_FALLBACK } from '@/constants/genres';
import {
  BOOK_GENRE_OPTIONS,
  fetchBookFeedPage,
  searchBooks,
} from './openLibrary';
import { SAMPLE_MOVIES } from './sampleMovies';
import { hasTmdbToken, posterUrl, tmdbGet } from './tmdb';
import {
  CastMember,
  MediaType,
  Movie,
  TmdbCredits,
  TmdbGenre,
  TmdbMovie,
  TmdbPagedResponse,
  TmdbPerson,
  TmdbTv,
  TmdbVideosResponse,
  TmdbWatchProvidersResponse,
  WatchInfo,
} from './types';

// Genre id -> name maps, fetched once per media type then cached for the session.
const genreCaches: Partial<Record<MediaType, Record<number, string>>> = {};

/** Loads (and caches) the TMDB genre map for a media type. */
export async function loadGenres(
  mediaType: MediaType,
): Promise<Record<number, string>> {
  const cached = genreCaches[mediaType];
  if (cached) return cached;

  const path = mediaType === 'tv' ? '/genre/tv/list' : '/genre/movie/list';
  try {
    const data = await tmdbGet<{ genres: TmdbGenre[] }>(path, {
      language: 'en-US',
    });
    const map = Object.fromEntries(data.genres.map((g) => [g.id, g.name]));
    genreCaches[mediaType] = map;
    return map;
  } catch {
    // Only movies have a static fallback; TV simply shows no genre chips.
    const fallback = mediaType === 'tv' ? {} : { ...GENRE_FALLBACK };
    genreCaches[mediaType] = fallback;
    return fallback;
  }
}

// TV "genres" that aren't really series (news + talk/late-night shows).
const TV_EXCLUDED_GENRE_IDS = ['10763', '10767'];
const TV_EXCLUDED_GENRES = TV_EXCLUDED_GENRE_IDS.join(',');

/** Selectable genres for the Discover filter (TMDB genres or book subjects). */
export async function getGenreOptions(
  mediaType: MediaType,
): Promise<{ id: string; name: string }[]> {
  if (mediaType === 'book') return BOOK_GENRE_OPTIONS;
  const map = await loadGenres(mediaType);
  let entries = Object.entries(map).map(([id, name]) => ({ id, name }));
  if (mediaType === 'tv') {
    entries = entries.filter((g) => !TV_EXCLUDED_GENRE_IDS.includes(g.id));
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

/** Maps TMDB genre ids to names; only movies fall back to the static map. */
function mapGenres(
  ids: number[] | undefined,
  genreMap: Record<number, string>,
  mediaType: MediaType,
): string[] {
  return (ids ?? [])
    .map(
      (id) => genreMap[id] ?? (mediaType === 'movie' ? GENRE_FALLBACK[id] : undefined),
    )
    .filter((name): name is string => Boolean(name));
}

/** Maps a raw TMDB movie into the app's normalised Movie shape. */
function toMovie(raw: TmdbMovie, genreMap: Record<number, string>): Movie {
  const parsedYear = raw.release_date
    ? Number(raw.release_date.slice(0, 4))
    : NaN;

  return {
    id: String(raw.id),
    title: raw.title,
    year: Number.isFinite(parsedYear) ? parsedYear : null,
    genreIds: raw.genre_ids ?? [],
    genres: mapGenres(raw.genre_ids, genreMap, 'movie'),
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    overview: raw.overview,
    voteAverage: raw.vote_average,
    voteCount: raw.vote_count,
    popularity: raw.popularity,
    mediaType: 'movie',
  };
}

/** Maps a raw TMDB TV show into the app's normalised Movie shape. */
function toTv(raw: TmdbTv, genreMap: Record<number, string>): Movie {
  const parsedYear = raw.first_air_date
    ? Number(raw.first_air_date.slice(0, 4))
    : NaN;

  return {
    id: String(raw.id),
    title: raw.name,
    year: Number.isFinite(parsedYear) ? parsedYear : null,
    genreIds: raw.genre_ids ?? [],
    genres: mapGenres(raw.genre_ids, genreMap, 'tv'),
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    overview: raw.overview,
    voteAverage: raw.vote_average,
    voteCount: raw.vote_count,
    popularity: raw.popularity,
    mediaType: 'tv',
  };
}

export interface FeedPage {
  movies: Movie[];
  nextPage: number | null;
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
 * Fetches one page of the discovery feed for the swipe deck.
 *
 * Strategy:
 *  - When the user picks no era, rotate through decades in random order so the
 *    feed jumps across eras instead of marching from oldest to newest.
 *  - Sort by popularity within the decade, then shuffle the page so the user
 *    doesn't always see the same blockbuster at the top.
 *  - Only constrain by era/genre/country when the user explicitly picks one.
 *  - Drop movies without a poster, since the poster is central to the UX.
 */
export async function fetchFeedPage(
  page: number,
  mediaType: MediaType,
  genre?: string,
  eraId?: string,
  country?: string,
): Promise<FeedPage> {
  const eraWindow = eraId ? ERA_OPTIONS.find((e) => e.id === eraId) : undefined;

  // Books come from Open Library (no TMDB token needed).
  if (mediaType === 'book') {
    const years = eraWindow
      ? {
          from: Number(eraWindow.gte.slice(0, 4)),
          to: Number(eraWindow.lte.slice(0, 4)),
        }
      : undefined;
    return fetchBookFeedPage(page, genre, years);
  }

  // No token yet? Serve a built-in demo feed so the app is fully usable, then
  // stop (one page). TV has no offline samples, so it stays empty in demo mode.
  if (!hasTmdbToken()) {
    if (mediaType === 'tv') return { movies: [], nextPage: null };
    return { movies: page === 1 ? SAMPLE_MOVIES : [], nextPage: null };
  }

  const genreMap = await loadGenres(mediaType);

  if (mediaType === 'tv') {
    // No explicit era → pick a random decade per page so the feed mixes eras.
    const tvWindow = eraWindow ?? ERA_WINDOWS[Math.floor(Math.random() * ERA_WINDOWS.length)];
    const data = await tmdbGet<TmdbPagedResponse<TmdbTv>>('/discover/tv', {
      include_adult: false,
      language: 'en-US',
      sort_by: 'popularity.desc',
      with_genres: genre,
      without_genres: TV_EXCLUDED_GENRES,
      with_origin_country: country,
      'first_air_date.gte': tvWindow.gte,
      'first_air_date.lte': tvWindow.lte,
      page,
    });

    const movies = shuffle(
      data.results.filter((m) => m.poster_path).map((m) => toTv(m, genreMap)),
    );

    const nextPage = page < data.total_pages ? page + 1 : null;
    return { movies, nextPage };
  }

  // No explicit era → random decade per page so the feed jumps across eras.
  const movieWindow = eraWindow ?? ERA_WINDOWS[Math.floor(Math.random() * ERA_WINDOWS.length)];
  const data = await tmdbGet<TmdbPagedResponse<TmdbMovie>>('/discover/movie', {
    include_adult: false,
    include_video: false,
    language: 'en-US',
    sort_by: 'popularity.desc',
    'primary_release_date.gte': movieWindow.gte,
    'primary_release_date.lte': movieWindow.lte,
    with_genres: genre,
    with_origin_country: country,
    page,
  });

  const movies = shuffle(
    data.results.filter((m) => m.poster_path).map((m) => toMovie(m, genreMap)),
  );

  const nextPage = page < data.total_pages ? page + 1 : null;
  return { movies, nextPage };
}

/**
 * Fetches the top-billed cast for a movie (TMDB /movie/{id}/credits).
 *
 * Returns an empty list in demo mode (no token), since credits aren't part of
 * the offline sample data. Cast is ordered by billing and capped so the details
 * view stays compact.
 */
export async function fetchMovieCast(
  movieId: string,
  mediaType: MediaType,
): Promise<CastMember[]> {
  if (!hasTmdbToken()) return [];

  const data = await tmdbGet<TmdbCredits>(`/${mediaType}/${movieId}/credits`, {
    language: 'en-US',
  });

  const top = data.cast
    .slice()
    .sort((a, b) => a.order - b.order)
    .slice(0, 10);

  // TMDB only exposes birthdays on /person/{id}, so fetch them in parallel to
  // show each actor's age at the film's release.
  return Promise.all(
    top.map(async (c) => {
      let birthYear: number | null = null;
      try {
        const person = await tmdbGet<TmdbPerson>(`/person/${c.id}`);
        if (person.birthday) {
          const y = Number(person.birthday.slice(0, 4));
          birthYear = Number.isFinite(y) ? y : null;
        }
      } catch {
        // A failed/missing lookup just omits the age for that actor.
      }
      return { id: c.id, name: c.name, character: c.character, birthYear };
    }),
  );
}

/**
 * Returns the best YouTube trailer URL for a movie, or null when none exists
 * (or in demo mode). Prefers an official trailer, then any trailer/teaser.
 */
export async function fetchMovieTrailer(
  movieId: string,
  mediaType: MediaType,
): Promise<string | null> {
  if (!hasTmdbToken()) return null;

  const data = await tmdbGet<TmdbVideosResponse>(
    `/${mediaType}/${movieId}/videos`,
    {
      language: 'en-US',
    },
  );

  const youtube = data.results.filter((v) => v.site === 'YouTube');
  const pick =
    youtube.find((v) => v.type === 'Trailer' && v.official) ??
    youtube.find((v) => v.type === 'Trailer') ??
    youtube.find((v) => v.type === 'Teaser') ??
    youtube[0];

  return pick ? `https://www.youtube.com/watch?v=${pick.key}` : null;
}

/**
 * Streaming availability (TMDB watch/providers, powered by JustWatch) for the
 * configured region. Returns null for books or when no token is set.
 */
export async function fetchWatchProviders(
  id: string,
  mediaType: MediaType,
): Promise<WatchInfo | null> {
  if (mediaType === 'book' || !hasTmdbToken()) return null;

  const data = await tmdbGet<TmdbWatchProvidersResponse>(
    `/${mediaType}/${id}/watch/providers`,
  );
  const region = data.results[WATCH_REGION];
  if (!region) return null;

  const raw = [
    ...(region.flatrate ?? []),
    ...(region.free ?? []),
    ...(region.ads ?? []),
  ];
  const seen = new Set<number>();
  const providers = raw
    .filter((p) => {
      if (seen.has(p.provider_id)) return false;
      seen.add(p.provider_id);
      return true;
    })
    .map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logoUrl: posterUrl(p.logo_path, 'w92'),
    }));

  return { providers, link: region.link ?? null };
}

/**
 * Searches the catalog for a free-text query (the Search tab).
 *
 * With a TMDB token this hits /search/movie. Without one, it filters the
 * built-in demo feed by title so search still works out of the box.
 */
export async function searchMovies(
  query: string,
  mediaType: MediaType,
  page: number = 1,
): Promise<FeedPage> {
  const q = query.trim();
  if (q.length === 0) {
    return { movies: [], nextPage: null };
  }

  // Books come from Open Library (no TMDB token needed).
  if (mediaType === 'book') return searchBooks(q, page);

  if (!hasTmdbToken()) {
    if (mediaType === 'tv') return { movies: [], nextPage: null };
    const lower = q.toLowerCase();
    return {
      movies: SAMPLE_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(lower),
      ),
      nextPage: null,
    };
  }

  const genreMap = await loadGenres(mediaType);

  if (mediaType === 'tv') {
    const data = await tmdbGet<TmdbPagedResponse<TmdbTv>>('/search/tv', {
      query: q,
      include_adult: false,
      language: 'en-US',
      page,
    });
    const movies = data.results
      .filter((m) => m.poster_path)
      .map((m) => toTv(m, genreMap));
    const nextPage = page < data.total_pages ? page + 1 : null;
    return { movies, nextPage };
  }

  const data = await tmdbGet<TmdbPagedResponse<TmdbMovie>>('/search/movie', {
    query: q,
    include_adult: false,
    language: 'en-US',
    page,
  });

  const movies = data.results
    .filter((m) => m.poster_path)
    .map((m) => toMovie(m, genreMap));

  const nextPage = page < data.total_pages ? page + 1 : null;
  return { movies, nextPage };
}
