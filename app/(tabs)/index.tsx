import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TmdbError, hasTmdbToken } from '@/api/tmdb';
import { SCREENSHOT_MODE, screenshotFeed } from '@/api/screenshotData';
import { MUST_SEE_ID } from '@/api/movies';
import { type SelectedActor } from '@/components/ActorFilter';
import { collectionsFor } from '@/constants/collections';
import { COUNTRY_OPTIONS, ERA_OPTIONS, PLATFORM_OPTIONS, PROVIDER_OPTIONS } from '@/constants/config';
import { FilterSheet } from '@/components/FilterSheet';
import { GenreChips } from '@/components/GenreChips';
import { LoadingReel } from '@/components/LoadingReel';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import { ShelfBackground } from '@/components/ShelfBackground';
import { FeatureHeader } from '@/components/FeatureHeader';
import { SwipeDeck } from '@/components/SwipeDeck';
import { useMediaType, useMediaTypeControls } from '@/context/MediaTypeProvider';
import { useGenres } from '@/hooks/useGenres';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useMovieFeed } from '@/hooks/useMovieFeed';
import { useProviderOptions } from '@/hooks/useProviderOptions';
import { getSetting, setSetting } from '@/db/settings';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';

// --- Swipe onboarding hint --------------------------------------------------
// Arrows + a demo card wiggle teach the swipe directions. Shown only ONCE — the
// very first time the app is ever opened (persisted in the settings store).
// After that it never appears again. (Key bumped to V2 so users of the earlier
// build, where the animation never actually played, get it once.)
const SWIPE_HINT_KEY = 'swipeHintSeenV2';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const mediaType = useMediaType();
  const { chosen } = useMediaTypeControls();
  const [genres, setGenres] = useState<string[]>([]);
  const [era, setEra] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [collection, setCollection] = useState<string | null>(null);
  const [vibes, setVibes] = useState<string[]>([]);
  const [actor, setActor] = useState<SelectedActor | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [mustSee, setMustSee] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters differ per category, so clear them all when switching.
  useEffect(() => {
    setGenres([]);
    setEra(null);
    setCountries([]);
    setCollection(null);
    setVibes([]);
    setActor(null);
    setPlatforms([]);
    setProviders([]);
    setMustSee(false);
  }, [mediaType]);

  const eraOptions = useMemo(
    () => ERA_OPTIONS.map((e) => ({ id: e.id, name: e.label })),
    [],
  );
  // Curated collections split into "Genre" (what it is) and "Vibe" (how it
  // feels). Both are keyword-based and use the `collection` state.
  const genreCollections = useMemo(
    () => collectionsFor(mediaType, 'genre'),
    [mediaType],
  );
  const vibeOptions = useMemo(
    () => collectionsFor(mediaType, 'vibe'),
    [mediaType],
  );
  const { data: genreOptions } = useGenres(mediaType);
  // Streaming services for the filter, resolved for the user's device region;
  // falls back to a static international list when the live list is unavailable.
  const { data: dynamicProviders } = useProviderOptions(mediaType);
  const providerOptions = useMemo(() => {
    if (mediaType !== 'movie' && mediaType !== 'tv') return [];
    return dynamicProviders && dynamicProviders.length
      ? dynamicProviders
      : PROVIDER_OPTIONS;
  }, [mediaType, dynamicProviders]);
  // Genre section = genre collections + TMDB genres, sorted A–Z. Vibe section is
  // its own list. Single choice across everything: picking a collection sets
  // `collection`, picking a TMDB genre sets `genre`, each clears the other.
  const genreFilterOptions = useMemo(
    () =>
      [...genreCollections, ...(genreOptions ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [genreCollections, genreOptions],
  );
  const isCollectionId = (id: string) =>
    genreCollections.some((c) => c.id === id) ||
    vibeOptions.some((c) => c.id === id);
  // Movies/series allow multiple TMDB genres (OR); books/games stay single.
  const genreMulti = mediaType === 'movie' || mediaType === 'tv';
  // The Genre picker holds either a single curated collection OR a set of
  // genres — the two are mutually exclusive.
  const genreSelected = collection ? [collection] : genres;
  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  const onGenreToggle = (id: string) => {
    setMustSee(false);
    if (isCollectionId(id)) {
      setCollection((c) => (c === id ? null : id));
      setGenres([]);
      return;
    }
    setCollection(null);
    setGenres((g) => (genreMulti ? toggleId(g, id) : g[0] === id ? [] : [id]));
  };
  const onCountryToggle = (id: string) => {
    setMustSee(false);
    setCountries((c) => toggleId(c, id));
  };
  const onPlatformToggle = (id: string) =>
    setPlatforms((p) => toggleId(p, id));
  const onProviderToggle = (id: string) => {
    setMustSee(false);
    setProviders((p) => toggleId(p, id));
  };
  const onVibeToggle = (id: string) => {
    setMustSee(false);
    setVibes((v) => toggleId(v, id));
  };
  // Must-See is a self-contained curated feed, so it's exclusive: turning it on
  // clears every other filter, and picking any other filter turns it off.
  const selectMustSee = (value: boolean) => {
    setMustSee(value);
    if (value) {
      setGenres([]);
      setCollection(null);
      setVibes([]);
      setEra(null);
      setCountries([]);
      setActor(null);
      setProviders([]);
    }
  };
  const activeFilterCount =
    genres.length +
    (era ? 1 : 0) +
    countries.length +
    (collection ? 1 : 0) +
    vibes.length +
    (actor ? 1 : 0) +
    platforms.length +
    providers.length +
    (mustSee ? 1 : 0);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMovieFeed(
    genres,
    era ?? undefined,
    countries,
    mustSee ? MUST_SEE_ID : collection ?? undefined,
    actor?.id ?? undefined,
    platforms,
    vibes,
    providers,
  );
  const { markWatched, skip, toggleWatchlist, toggleFavorite, undo } =
    useInteractions();
  const states = useInteractionStates();

  const [topIndex, setTopIndex] = useState(0);

  // Swipe onboarding hint — show only on the very first app open (persisted).
  // null = still loading the flag; false = not seen yet; true = already seen.
  const [hintSeen, setHintSeen] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    getSetting(SWIPE_HINT_KEY).then((v) => {
      if (alive) setHintSeen(v === '1');
    });
    return () => {
      alive = false;
    };
  }, []);

  // Play the swipe onboarding right after the user leaves the landing screen
  // (picks a category) the FIRST time ever, then remember it's been seen.
  // `playHint` drives the deck animation and stays true for the whole session,
  // decoupled from the persisted flag so writing the flag doesn't immediately
  // flip the hint off and cut the animation short (the earlier bug).
  const [playHint, setPlayHint] = useState(false);
  const [hintReplay, setHintReplay] = useState(0);
  useEffect(() => {
    if (chosen && hintSeen === false && !playHint) {
      setPlayHint(true);
      setHintReplay((r) => r + 1);
      setHintSeen(true);
      setSetting(SWIPE_HINT_KEY, '1').catch(() => {});
    }
  }, [chosen, hintSeen, playHint]);

  // When no TMDB token is set we serve a built-in demo feed; surface that so the
  // user knows how to unlock the full catalog.
  const isDemo = !hasTmdbToken();

  const noun =
    mediaType === 'tv'
      ? 'series'
      : mediaType === 'book'
        ? 'books'
        : mediaType === 'game'
          ? 'games'
          : 'movies';
  const emptyIcon: keyof typeof Ionicons.glyphMap =
    mediaType === 'tv'
      ? 'tv-outline'
      : mediaType === 'book'
        ? 'book-outline'
        : mediaType === 'game'
          ? 'game-controller-outline'
          : 'film-outline';

  const movies = useMemo(() => {
    if (SCREENSHOT_MODE) return screenshotFeed(mediaType);
    const all = data?.pages.flatMap((page) => page.movies) ?? [];
    // De-duplicate by id: TMDB pages (and Open Library subjects) can repeat a
    // title, which would otherwise collide as duplicate keys in the deck.
    const seen = new Set<string>();
    return all.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [data, mediaType]);

  // Prefetch the next page as the user nears the bottom of the current deck.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && movies.length - topIndex <= 4) {
      fetchNextPage();
    }
  }, [topIndex, movies.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const exhausted = movies.length > 0 && topIndex >= movies.length;
  // ShelfBackground draws 5 equal rows over the full screen (grid padding 6).
  // Derive the header height from the measured screen so it covers exactly the
  // top row -> 4 equal cubbies always show below it, on any device (no per-format
  // pixel tweaking). Falls back to an estimate until the first layout pass.
  const [screenH, setScreenH] = useState(0);
  const shelfRow = screenH > 0 ? (screenH - 12) / 5 : 0;
  const headerHeight = screenH > 0 ? Math.round(6 + shelfRow) : insets.top + 150;
  const tagline =
    mediaType === 'tv'
      ? 'Swipe your series'
      : mediaType === 'book'
        ? 'Swipe your books'
        : mediaType === 'game'
          ? 'Swipe your games'
          : 'Swipe your films';

  return (
    <View
      style={[styles.container, { paddingTop: headerHeight + spacing.xs }]}
      onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}
    >
      <ShelfBackground />
      <FeatureHeader height={headerHeight} topInset={insets.top} tagline={tagline} scale={0.55} />
      <View style={styles.header}>
        <View style={styles.switcherRow}>
          <MediaSwitcher
            filterCount={activeFilterCount}
            onFilterPress={() => setFiltersOpen(true)}
          />
        </View>
      </View>

      {isDemo && (
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle-outline" size={15} color={colors.amberBright} />
          <Text style={styles.demoText}>
            Demo movies · add a TMDB token in .env for the full catalog
          </Text>
        </View>
      )}

      <View style={styles.deckArea}>
        {!SCREENSHOT_MODE && isLoading ? (
          <Centered>
            <LoadingReel mediaType={mediaType} />
          </Centered>
        ) : !SCREENSHOT_MODE && isError ? (
          <SetupOrError error={error} onRetry={() => refetch()} noun={noun} />
        ) : movies.length === 0 ? (
          <Centered>
            <Ionicons name={emptyIcon} size={48} color={colors.border} />
            <Text style={styles.muted}>No {noun} found right now.</Text>
          </Centered>
        ) : (
          <>
            <SwipeDeck
              key={`${mediaType}:${genres.join(',') || 'all'}:${era ?? 'all'}:${countries.join(',') || 'all'}:${mustSee ? 'mustsee' : collection ?? 'all'}:${vibes.join(',') || 'all'}:${actor?.id ?? 'all'}:${platforms.join(',') || 'all'}:${providers.join(',') || 'all'}`}
              cards={movies}
              onSwipeRight={(movie) => markWatched(movie)}
              onSwipeLeft={(movie) => skip(movie)}
              onStar={toggleWatchlist}
              onHeart={toggleFavorite}
              onUndo={(movie, type) => undo(movie.id, type, movie.mediaType)}
              isWatchlisted={(movie) => states.isWatchlisted(movie.id)}
              isFavorite={(movie) => states.isFavorite(movie.id)}
              onIndexChange={setTopIndex}
              hint={playHint}
              replay={hintReplay}
            />
            {exhausted && (
              <Centered pointerEvents="none">
                {isFetchingNextPage ? (
                  <LoadingReel size={44} mediaType={mediaType} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={48}
                      color={colors.border}
                    />
                    <Text style={styles.muted}>
                      That&apos;s the whole rack for now. Check back later.
                    </Text>
                  </>
                )}
              </Centered>
            )}
          </>
        )}
      </View>

      {/* Swipe hint arrows live on the sides at mid-height (see styles), so the
          card can use the full height down to the tab bar. */}
      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        genreOptions={genreFilterOptions}
        genreSelected={genreSelected}
        genreMulti={genreMulti}
        onGenreToggle={onGenreToggle}
        vibeOptions={vibeOptions}
        vibeSelected={vibes}
        onVibeToggle={onVibeToggle}
        actor={actor}
        onActorChange={(a) => {
          setActor(a);
          if (a) setMustSee(false);
        }}
        hideActor={mediaType !== 'movie'}
        eraOptions={eraOptions}
        era={era}
        onEraChange={(id) => {
          setEra(id);
          if (id) setMustSee(false);
        }}
        countryOptions={COUNTRY_OPTIONS}
        countrySelected={countries}
        onCountryToggle={onCountryToggle}
        hideCountry={mediaType === 'book' || mediaType === 'game'}
        platformOptions={mediaType === 'game' ? PLATFORM_OPTIONS : []}
        platformSelected={platforms}
        onPlatformToggle={onPlatformToggle}
        providerOptions={providerOptions}
        providerSelected={providers}
        onProviderToggle={onProviderToggle}
        mustSee={mustSee}
        onMustSeeChange={selectMustSee}
        hideMustSee={mediaType !== 'movie'}
        onClearAll={() => {
          setGenres([]);
          setEra(null);
          setCountries([]);
          setCollection(null);
          setVibes([]);
          setActor(null);
          setPlatforms([]);
          setProviders([]);
          setMustSee(false);
        }}
      />
    </View>
  );
}

/** Simple centered overlay used for loading / empty / exhausted states. */
function Centered({
  children,
  pointerEvents,
}: {
  children: React.ReactNode;
  pointerEvents?: 'none' | 'auto';
}) {
  return (
    <View style={styles.centered} pointerEvents={pointerEvents}>
      {children}
    </View>
  );
}

/** Friendly handling for the common "no TMDB token" case vs. generic errors. */
function SetupOrError({
  error,
  onRetry,
  noun,
}: {
  error: unknown;
  onRetry: () => void;
  noun: string;
}) {
  const isToken =
    error instanceof TmdbError && /access token/i.test(error.message);

  return (
    <Centered>
      <Ionicons
        name={isToken ? 'key-outline' : 'cloud-offline-outline'}
        size={48}
        color={colors.border}
      />
      <Text style={styles.errorTitle}>
        {isToken ? 'Add your TMDB token' : `Could not load ${noun}`}
      </Text>
      <Text style={styles.muted}>
        {isToken
          ? 'Copy .env.example to .env, paste your TMDB read access token, then restart the dev server.'
          : (error as Error)?.message ?? 'Something went wrong.'}
      </Text>
      {!isToken && (
        <Pressable style={styles.retry} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </Centered>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.sm,
    zIndex: 2,
  },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  filterRow: {
    marginBottom: spacing.sm,
  },
  filterLabel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  brand: {
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  tagline: {
    color: 'rgba(243, 231, 210, 0.78)',
    fontFamily: fonts.body,
    fontSize: 13,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  demoText: {
    flex: 1,
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  deckArea: {
    flex: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  centered: {
    ...absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  muted: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorTitle: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  retry: {
    marginTop: spacing.sm,
    backgroundColor: colors.amber,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.background,
    fontFamily: fonts.label,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
