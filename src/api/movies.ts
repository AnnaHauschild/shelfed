import { COLLECTIONS, Collection } from '@/constants/collections';
import { ERA_OPTIONS, ERA_WINDOWS, watchRegion } from '@/constants/config';
import { GENRE_FALLBACK } from '@/constants/genres';
import {
  BOOK_GENRE_OPTIONS,
  fetchBookById,
  fetchBookFeedPage,
  searchBooks,
} from './googleBooks';
import {
  fetchGameById,
  fetchGameFeedPage,
  getGameGenreOptions,
  searchGames,
} from './rawg';
import mustSeeData from './mustSee.json';
import { SAMPLE_MOVIES } from './sampleMovies';
import { contentLanguage, hasTmdbToken, posterUrl, tmdbGet } from './tmdb';
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
  TmdbWatchProvidersListResponse,
  TmdbTvDetails,
  TmdbSeasonDetails,
  TvSeason,
  TvEpisode,
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

// Default decade rotation for the TV feed when the user hasn't picked an era.
// Pre-2000 series catalogues are sparse on TMDB and the post-Netflix golden
// age is what most users want to swipe through, so we skip the 70s/80s
// entirely and weight the recent decades twice as heavily.
const TV_DEFAULT_WINDOWS: { gte: string; lte: string }[] = [
  { gte: '1990-01-01', lte: '1999-12-31' },
  { gte: '2000-01-01', lte: '2009-12-31' },
  { gte: '2010-01-01', lte: '2019-12-31' },
  { gte: '2010-01-01', lte: '2019-12-31' },
  { gte: '2020-01-01', lte: '2029-12-31' },
  { gte: '2020-01-01', lte: '2029-12-31' },
];

// TMDB keyword ids to block softcore/erotica that slips past `include_adult`.
// 190370 erotic movie · 155477 softcore · 211603 erotica · 13059 pornography
// 207928 sexploitation · 244828 erotic horror · 263110 erotic film · 6152 nudity
// 11322 female nudity · 270718 erotic thriller · 1568 sex · 165531 erotic
const EXCLUDED_KEYWORDS = [
  '190370', '155477', '211603', '13059', '207928',
  '244828', '263110', '6152', '11322', '270718',
  '1568', '165531',
].join(',');

// Last-resort title blocklist: catches the obvious cases (mostly 70s/80s
// European softcore) that aren't tagged with any of the keywords above.
const EROTIC_TITLE_PATTERN =
  /\b(erotic|erotica|softcore|sex(y|ploitation)?|nymph|orgy|orgies|emanuelle|emmanuelle|lolita|porn|XXX|nude|naked|sins?\sof|caligula|decameron)\b/i;

/** True if a title looks like it shouldn't appear on Shelfed. */
function isLikelyErotic(title: string | undefined | null): boolean {
  return !!title && EROTIC_TITLE_PATTERN.test(title);
}

// Resolved TMDB keyword-name -> id cache (a keyword id never changes, so this
// is safe for the whole session). `null` = looked up but not found.
const keywordIdCache = new Map<string, string | null>();

/**
 * Resolves a list of TMDB keyword *names* to a `with_keywords` value, looking
 * each one up via /search/keyword (cached). Ids are OR-combined (pipe) so a
 * collection matches any of its keywords. We prefer an exact name match and
 * otherwise a keyword whose name contains the query, to avoid tagging the feed
 * with an unrelated keyword; unresolved names are simply skipped.
 */
async function resolveKeywordIds(
  names: string[],
): Promise<string | undefined> {
  const ids: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase().trim();
    let id = keywordIdCache.get(key);
    if (id === undefined) {
      id = null;
      try {
        const data = await tmdbGet<{ results: { id: number; name: string }[] }>(
          '/search/keyword',
          { query: name },
        );
        const exact = data.results.find((r) => r.name.toLowerCase() === key);
        const best =
          exact ?? data.results.find((r) => r.name.toLowerCase().includes(key));
        if (best) id = String(best.id);
      } catch {
        id = null;
      }
      keywordIdCache.set(key, id);
    }
    if (id) ids.push(id);
  }
  return ids.length ? ids.join('|') : undefined;
}

/** A person match from the actor search (used by the Discover actor filter). */
export interface PersonHit {
  id: string;
  name: string;
  /** Most notable title, shown as a disambiguation hint. */
  knownFor?: string;
  /** TMDB profile image path (or null when the person has no photo). */
  profilePath: string | null;
}

interface TmdbPersonSearchResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for?: { title?: string; name?: string }[];
}

/**
 * Searches TMDB people by name for the actor filter, returning the top matches
 * with a "known for" hint so the user can tell namesakes apart.
 */
export async function searchPeople(query: string): Promise<PersonHit[]> {
  const q = query.trim();
  if (!q || !hasTmdbToken()) return [];
  try {
    const data = await tmdbGet<TmdbPagedResponse<TmdbPersonSearchResult>>(
      '/search/person',
      { query: q, include_adult: false, language: 'en-US' },
    );
    return data.results.slice(0, 8).map((p) => ({
      id: String(p.id),
      name: p.name,
      profilePath: p.profile_path,
      knownFor: p.known_for
        ?.map((k) => k.title ?? k.name)
        .filter((t): t is string => Boolean(t))[0],
    }));
  } catch {
    return [];
  }
}

/** Selectable genres for the Discover filter (TMDB genres or book subjects). */
export async function getGenreOptions(
  mediaType: MediaType,
): Promise<{ id: string; name: string }[]> {
  if (mediaType === 'book') return BOOK_GENRE_OPTIONS;
  if (mediaType === 'game') return getGameGenreOptions();
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
    releaseDate: raw.release_date || undefined,
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
    releaseDate: raw.first_air_date || undefined,
    mediaType: 'tv',
  };
}

/** True if the title's release/air date is still in the future (coming soon). */
export function isUpcoming(movie: Movie): boolean {
  if (!movie.releaseDate) return false;
  const ts = Date.parse(movie.releaseDate);
  return Number.isFinite(ts) && ts > Date.now();
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

// --- Must-See curated list --------------------------------------------------
// The "1001 movies you must see" IMDb export, resolved once to TMDB and bundled
// as JSON (see scripts/build-mustsee.mjs). Because the data ships with the app,
// this feed loads instantly and works fully offline.
export const MUST_SEE_ID = 'must-see';
export const MUST_SEE_LABEL = 'Must Watch Once in Life';
const MUST_SEE_MOVIES = mustSeeData as unknown as Movie[];
export const MUST_SEE_COUNT = MUST_SEE_MOVIES.length;
const MUST_SEE_PAGE_SIZE = 18;
// Shuffled once per session so the curated feed jumps across eras (like the
// rest of Discover) while keeping a stable order as the user pages through it.
let mustSeeOrder: Movie[] | null = null;
function fetchMustSeePage(page: number): FeedPage {
  if (!mustSeeOrder) mustSeeOrder = shuffle([...MUST_SEE_MOVIES]);
  const start = (page - 1) * MUST_SEE_PAGE_SIZE;
  const movies = mustSeeOrder.slice(start, start + MUST_SEE_PAGE_SIZE);
  const nextPage =
    start + MUST_SEE_PAGE_SIZE < mustSeeOrder.length ? page + 1 : null;
  return { movies, nextPage };
}

/**
 * A handful of genuinely upcoming films (primary release still in the future),
 * most-anticipated first. Used to surface "Coming Soon" cinema releases at the
 * top of the default feed — the normal feed's US-certification filter hides
 * unreleased titles (they have no rating yet), so they'd otherwise never show.
 */
async function fetchUpcomingMovies(
  genreMap: Record<number, string>,
): Promise<Movie[]> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const data = await tmdbGet<TmdbPagedResponse<TmdbMovie>>('/discover/movie', {
      include_adult: false,
      include_video: false,
      language: contentLanguage(),
      sort_by: 'popularity.desc',
      'primary_release_date.gte': today,
      without_keywords: EXCLUDED_KEYWORDS,
      page: 1,
    });
    return data.results
      .filter((m) => m.poster_path)
      .filter((m) => !isLikelyErotic(m.title) && !isLikelyErotic(m.original_title))
      .map((m) => toMovie(m, genreMap))
      .filter(isUpcoming)
      .slice(0, 6);
  } catch {
    return [];
  }
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
  genres?: string[],
  eraId?: string,
  countries?: string[],
  collectionId?: string,
  actorId?: string,
  platforms?: string[],
  vibeIds?: string[],
  providers?: string[],
  authorKey?: string,
): Promise<FeedPage> {
  // The bundled Must-See list bypasses TMDB entirely (instant + offline).
  if (mediaType === 'movie' && collectionId === MUST_SEE_ID) {
    return fetchMustSeePage(page);
  }

  const eraWindow = eraId ? ERA_OPTIONS.find((e) => e.id === eraId) : undefined;
  const collection = collectionId
    ? COLLECTIONS.find((c) => c.id === collectionId)
    : undefined;
  // Independent "vibe" collections combine with the genre collection (Genre AND
  // Vibe): each vibe's keywords are OR'd together, then ANDed with the genre
  // collection's keywords.
  const vibes = (vibeIds ?? [])
    .map((id) => COLLECTIONS.find((c) => c.id === id))
    .filter((c): c is Collection => Boolean(c));

  // Books come from Open Library (no TMDB token needed). Collections are a
  // TMDB-keyword concept, so they don't apply to the book feed.
  if (mediaType === 'book') {
    const years = eraWindow
      ? {
          from: Number(eraWindow.gte.slice(0, 4)),
          to: Number(eraWindow.lte.slice(0, 4)),
        }
      : undefined;
    return fetchBookFeedPage(page, genres?.[0], years, authorKey);
  }

  // Games come from RAWG (needs its own key). Genre = RAWG slug, era = date range,
  // platform = RAWG parent-platform id (console family).
  if (mediaType === 'game') {
    const years = eraWindow
      ? {
          from: Number(eraWindow.gte.slice(0, 4)),
          to: Number(eraWindow.lte.slice(0, 4)),
        }
      : undefined;
    return fetchGameFeedPage(
      page,
      genres?.length ? genres.join(',') : undefined,
      years,
      platforms?.length ? platforms.join(',') : undefined,
    );
  }

  // No token yet? Serve a built-in demo feed so the app is fully usable, then
  // stop (one page). TV has no offline samples, so it stays empty in demo mode.
  if (!hasTmdbToken()) {
    if (mediaType === 'tv') return { movies: [], nextPage: null };
    return { movies: page === 1 ? SAMPLE_MOVIES : [], nextPage: null };
  }

  const genreMap = await loadGenres(mediaType);

  // Merge the selected collection's constraints with the user's own filters.
  // Genre: AND the collection's genres with the user's pick. Keyword: resolve
  // the collection's keyword names. Language/country: the collection overrides.
  // Keyword groups are OR-combined within a collection, then AND-combined
  // across the genre + vibe collections (comma = AND in TMDB with_keywords).
  const collectionKeywords = collection?.keywords
    ? await resolveKeywordIds(collection.keywords)
    : undefined;
  const vibeKeywordNames = vibes.flatMap((v) => v.keywords ?? []);
  const vibeKeywords = vibeKeywordNames.length
    ? await resolveKeywordIds(vibeKeywordNames)
    : undefined;
  const withKeywords =
    [collectionKeywords, vibeKeywords].filter(Boolean).join(',') || undefined;
  const withGenres =
    [
      genres?.length ? genres.join('|') : undefined,
      collection?.genres?.join(','),
      vibes.flatMap((v) => v.genres ?? []).join('|') || undefined,
    ]
      .filter(Boolean)
      .join(',') || undefined;
  const withProviders = providers?.length ? providers.join('|') : undefined;
  const originalLanguage =
    collection?.language ?? vibes.find((v) => v.language)?.language;
  const originCountry =
    collection?.country ??
    vibes.find((v) => v.country)?.country ??
    (countries?.length ? countries.join('|') : undefined);
  const withRuntimeGte =
    collection?.runtimeGte ?? vibes.find((v) => v.runtimeGte != null)?.runtimeGte;
  const withRuntimeLte =
    collection?.runtimeLte ?? vibes.find((v) => v.runtimeLte != null)?.runtimeLte;
  // A collection/vibe, a country or an actor filter is niche, so when one is
  // active (and the user hasn't pinned a specific era) we search the FULL
  // catalogue instead of a single random decade, and drop the US-certification
  // requirement — that filter only returns titles with a US rating, which
  // excludes most foreign / niche films (K-dramas, Brazilian cinema, etc.).
  // The erotic keyword + title guards still apply.
  const broaden = !!collection || vibes.length > 0 || !!originCountry || !!actorId || !!withProviders;

  if (mediaType === 'tv') {
    // No explicit era → weighted-random recent decade (skips 70s/80s by
    // default); a niche filter widens this to the whole catalogue.
    const tvWindow =
      eraWindow ??
      (broaden
        ? undefined
        : TV_DEFAULT_WINDOWS[
            Math.floor(Math.random() * TV_DEFAULT_WINDOWS.length)
          ]);
    const data = await tmdbGet<TmdbPagedResponse<TmdbTv>>('/discover/tv', {
      include_adult: false,
      language: contentLanguage(),
      sort_by: 'popularity.desc',
      with_genres: withGenres,
      without_genres: TV_EXCLUDED_GENRES,
      without_keywords: EXCLUDED_KEYWORDS,
      with_keywords: withKeywords,
      with_original_language: originalLanguage,
      with_origin_country: originCountry,
      with_watch_providers: withProviders,
      watch_region: withProviders ? watchRegion() : undefined,
      with_watch_monetization_types: withProviders ? 'flatrate' : undefined,
      'first_air_date.gte': tvWindow?.gte,
      'first_air_date.lte': tvWindow?.lte,
      page,
    });

    const movies = shuffle(
      data.results
        .filter((m) => m.poster_path)
        .filter((m) => !isLikelyErotic(m.name) && !isLikelyErotic(m.original_name))
        .map((m) => toTv(m, genreMap)),
    );

    const nextPage = page < data.total_pages ? page + 1 : null;
    return { movies, nextPage };
  }

  // No explicit era → random decade per page so the feed jumps across eras; a
  // niche filter (collection / country / actor) widens this to the whole
  // catalogue (those are sparse when clamped to a single decade).
  const movieWindow =
    eraWindow ??
    (broaden
      ? undefined
      : ERA_WINDOWS[Math.floor(Math.random() * ERA_WINDOWS.length)]);
  const data = await tmdbGet<TmdbPagedResponse<TmdbMovie>>('/discover/movie', {
    include_adult: false,
    include_video: false,
    language: contentLanguage(),
    sort_by: 'popularity.desc',
    'primary_release_date.gte': movieWindow?.gte,
    'primary_release_date.lte': movieWindow?.lte,
    with_genres: withGenres,
    without_keywords: EXCLUDED_KEYWORDS,
    with_keywords: withKeywords,
    with_original_language: originalLanguage,
    with_cast: actorId,
    'with_runtime.gte': withRuntimeGte,
    'with_runtime.lte': withRuntimeLte,
    certification_country: broaden ? undefined : 'US',
    'certification.lte': broaden ? undefined : 'R',
    with_origin_country: originCountry,
    with_watch_providers: withProviders,
    watch_region: withProviders ? watchRegion() : undefined,
    with_watch_monetization_types: withProviders ? 'flatrate' : undefined,
    page,
  });

  const movies = shuffle(
    data.results
      .filter((m) => m.poster_path)
      .filter((m) => !isLikelyErotic(m.title) && !isLikelyErotic(m.original_title))
      .map((m) => toMovie(m, genreMap)),
  );

  const nextPage = page < data.total_pages ? page + 1 : null;

  // On the first page of the plain (unfiltered) feed, surface a few genuinely
  // upcoming cinema releases up top so the "Coming Soon" badge is actually seen
  // — the US-certification filter above otherwise hides unreleased films.
  const isPlainFeed =
    !genres?.length &&
    !collection &&
    !countries?.length &&
    !actorId &&
    !eraId &&
    !withProviders;
  if (page === 1 && isPlainFeed) {
    const upcoming = await fetchUpcomingMovies(genreMap);
    const ids = new Set(movies.map((m) => m.id));
    const injected = upcoming.filter((m) => !ids.has(m.id));
    return { movies: [...injected, ...movies], nextPage };
  }

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
  if (mediaType !== 'movie' && mediaType !== 'tv') return [];
  if (!hasTmdbToken()) return [];

  // TV shows keep their full cast under aggregate_credits (across all seasons);
  // /tv/{id}/credits is usually empty. Movies use plain credits.
  const path =
    mediaType === 'tv'
      ? `/tv/${movieId}/aggregate_credits`
      : `/movie/${movieId}/credits`;
  const data = await tmdbGet<TmdbCredits>(path, {
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
      return {
        id: c.id,
        name: c.name,
        character: c.character ?? c.roles?.[0]?.character ?? '',
        birthYear,
        profilePath: c.profile_path,
      };
    }),
  );
}

export interface TitleMeta {
  director?: string;
  countries?: string[];
}

/** Director/creator + production countries for the details card (movies/TV). */
export async function fetchTitleMeta(
  movieId: string,
  mediaType: MediaType,
): Promise<TitleMeta> {
  if (mediaType !== 'movie' && mediaType !== 'tv') return {};
  if (!hasTmdbToken()) return {};
  try {
    if (mediaType === 'tv') {
      const raw = await tmdbGet<{
        created_by?: { name: string }[];
        origin_country?: string[];
        production_countries?: { name: string }[];
      }>(`/tv/${movieId}`, { language: 'en-US' });
      const creators = (raw.created_by ?? []).map((c) => c.name).filter(Boolean);
      const countries = raw.production_countries?.length
        ? raw.production_countries.map((c) => c.name)
        : raw.origin_country ?? [];
      return {
        director: creators.length ? creators.join(', ') : undefined,
        countries: countries.length ? countries : undefined,
      };
    }
    const raw = await tmdbGet<{
      production_countries?: { name: string }[];
      credits?: { crew?: { job: string; name: string }[] };
    }>(`/movie/${movieId}`, {
      language: 'en-US',
      append_to_response: 'credits',
    });
    const directors = (raw.credits?.crew ?? [])
      .filter((c) => c.job === 'Director')
      .map((c) => c.name);
    const countries = (raw.production_countries ?? []).map((c) => c.name);
    return {
      director: directors.length ? directors.join(', ') : undefined,
      countries: countries.length ? countries : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Returns the best YouTube trailer URL for a movie, or null when none exists
 * (or in demo mode). Prefers an official trailer, then any trailer/teaser.
 */
export async function fetchMovieTrailer(
  movieId: string,
  mediaType: MediaType,
): Promise<string | null> {
  if (mediaType !== 'movie' && mediaType !== 'tv') return null;
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
  if (mediaType !== 'movie' && mediaType !== 'tv') return null;
  if (!hasTmdbToken()) return null;

  const data = await tmdbGet<TmdbWatchProvidersResponse>(
    `/${mediaType}/${id}/watch/providers`,
  );
  const region = data.results[watchRegion()];
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
 * The streaming services available in the user's region (device locale), most
 * prominent first, for the Discover "Streaming" filter. Empty in demo mode.
 */
export async function fetchProviderOptions(
  mediaType: MediaType,
): Promise<{ id: string; name: string }[]> {
  if (mediaType !== 'movie' && mediaType !== 'tv') return [];
  if (!hasTmdbToken()) return [];
  const path =
    mediaType === 'tv' ? '/watch/providers/tv' : '/watch/providers/movie';
  const data = await tmdbGet<TmdbWatchProvidersListResponse>(path, {
    watch_region: watchRegion(),
    language: 'en-US',
  });
  return data.results
    .slice()
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, 15)
    .map((p) => ({ id: String(p.provider_id), name: p.provider_name }));
}

/**
 * Seasons of a series (from /tv/{id}), newest data first-party from TMDB. Drops
 * "Specials" (season 0) and empty seasons. Empty in demo mode / on error.
 */
export async function fetchTvSeasons(tvId: string): Promise<TvSeason[]> {
  if (!hasTmdbToken()) return [];
  try {
    const data = await tmdbGet<TmdbTvDetails>(`/tv/${tvId}`, {
      language: contentLanguage(),
    });
    return (data.seasons ?? [])
      .filter((s) => s.season_number > 0 && s.episode_count > 0)
      .map((s) => ({
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airYear: s.air_date ? Number(s.air_date.slice(0, 4)) : null,
        posterPath: s.poster_path,
      }));
  } catch {
    return [];
  }
}

/** Episodes of one season (from /tv/{id}/season/{n}). Empty on error. */
export async function fetchSeasonEpisodes(
  tvId: string,
  seasonNumber: number,
): Promise<TvEpisode[]> {
  if (!hasTmdbToken()) return [];
  try {
    const data = await tmdbGet<TmdbSeasonDetails>(
      `/tv/${tvId}/season/${seasonNumber}`,
      { language: contentLanguage() },
    );
    return (data.episodes ?? []).map((e) => ({
      episodeNumber: e.episode_number,
      name: e.name,
      airDate: e.air_date,
      overview: e.overview,
      stillPath: e.still_path,
      runtime: e.runtime,
      voteAverage: e.vote_average,
    }));
  } catch {
    return [];
  }
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
  if (mediaType === 'game') return searchGames(q, page);

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
      language: contentLanguage(),
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
    language: contentLanguage(),
    page,
  });

  const movies = data.results
    .filter((m) => m.poster_path)
    .map((m) => toMovie(m, genreMap));

  const nextPage = page < data.total_pages ? page + 1 : null;
  return { movies, nextPage };
}

/**
 * Fetches a single title by id (used by share-link deeplinks).
 * Returns null when the lookup fails so the caller can fall back silently.
 */
export async function fetchMediaById(
  mediaType: MediaType,
  id: string,
): Promise<Movie | null> {
  if (mediaType === 'book') return fetchBookById(id);
  if (mediaType === 'game') return fetchGameById(id);
  if (!hasTmdbToken()) return null;
  try {
    const genreMap = await loadGenres(mediaType);
    if (mediaType === 'tv') {
      const raw = await tmdbGet<TmdbTv & { genres?: TmdbGenre[] }>(
        `/tv/${id}`,
        { language: contentLanguage() },
      );
      return toTv({ ...raw, genre_ids: (raw.genres ?? []).map((g) => g.id) }, genreMap);
    }
    const raw = await tmdbGet<TmdbMovie & { genres?: TmdbGenre[] }>(
      `/movie/${id}`,
      { language: contentLanguage() },
    );
    return toMovie({ ...raw, genre_ids: (raw.genres ?? []).map((g) => g.id) }, genreMap);
  } catch {
    return null;
  }
}
