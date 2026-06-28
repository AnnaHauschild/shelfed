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
import { COUNTRY_OPTIONS, ERA_OPTIONS } from '@/constants/config';
import { watchedLabel } from '@/constants/labels';
import { FilterSheet } from '@/components/FilterSheet';
import { GenreChips } from '@/components/GenreChips';
import { LoadingReel } from '@/components/LoadingReel';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import { ShelfBackground } from '@/components/ShelfBackground';
import { SwipeDeck } from '@/components/SwipeDeck';
import { useMediaType } from '@/context/MediaTypeProvider';
import { useGenres } from '@/hooks/useGenres';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useMovieFeed } from '@/hooks/useMovieFeed';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const mediaType = useMediaType();
  const [genre, setGenre] = useState<string | null>(null);
  const [era, setEra] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters differ per category, so clear them all when switching.
  useEffect(() => {
    setGenre(null);
    setEra(null);
    setCountry(null);
  }, [mediaType]);

  const eraOptions = useMemo(
    () => ERA_OPTIONS.map((e) => ({ id: e.id, name: e.label })),
    [],
  );
  const { data: genreOptions } = useGenres(mediaType);
  const activeFilterCount =
    (genre ? 1 : 0) + (era ? 1 : 0) + (country ? 1 : 0);
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
    genre ?? undefined,
    era ?? undefined,
    country ?? undefined,
  );
  const { markWatched, skip, toggleWatchlist, toggleFavorite, undo } =
    useInteractions();
  const states = useInteractionStates();

  const [topIndex, setTopIndex] = useState(0);

  // When no TMDB token is set we serve a built-in demo feed; surface that so the
  // user knows how to unlock the full catalog.
  const isDemo = !hasTmdbToken();

  const noun =
    mediaType === 'tv' ? 'series' : mediaType === 'book' ? 'books' : 'movies';
  const emptyIcon: keyof typeof Ionicons.glyphMap =
    mediaType === 'tv'
      ? 'tv-outline'
      : mediaType === 'book'
        ? 'book-outline'
        : 'film-outline';

  const movies = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.movies) ?? [];
    // De-duplicate by id: TMDB pages (and Open Library subjects) can repeat a
    // title, which would otherwise collide as duplicate keys in the deck.
    const seen = new Set<string>();
    return all.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [data]);

  // Prefetch the next page as the user nears the bottom of the current deck.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && movies.length - topIndex <= 4) {
      fetchNextPage();
    }
  }, [topIndex, movies.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const exhausted = movies.length > 0 && topIndex >= movies.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ShelfBackground />
      <View style={styles.header}>
        <Text style={styles.brand}>Shelfed</Text>
        <Text style={styles.tagline}>
          {mediaType === 'tv'
            ? "Swipe the series you've watched"
            : mediaType === 'book'
              ? "Swipe the books you've read"
              : "Swipe the films you've watched"}
        </Text>
        <View style={styles.switcherRow}>
          <MediaSwitcher />
          <Pressable
            onPress={() => setFiltersOpen(true)}
            style={({ pressed }) => [
              styles.filterButton,
              activeFilterCount > 0 && styles.filterButtonActive,
              pressed && styles.filterButtonPressed,
            ]}
            hitSlop={4}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={
                activeFilterCount > 0 ? colors.amberBright : colors.textOnDarkMuted
              }
            />
            <Text
              style={[
                styles.filterButtonText,
                activeFilterCount > 0 && { color: colors.amberBright },
              ]}
            >
              {activeFilterCount > 0 ? `Filters · ${activeFilterCount}` : 'Filters'}
            </Text>
          </Pressable>
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
        {isLoading ? (
          <Centered>
            <LoadingReel />
            <Text style={styles.muted}>Loading the reels…</Text>
          </Centered>
        ) : isError ? (
          <SetupOrError error={error} onRetry={() => refetch()} />
        ) : movies.length === 0 ? (
          <Centered>
            <Ionicons name={emptyIcon} size={48} color={colors.border} />
            <Text style={styles.muted}>No {noun} found right now.</Text>
          </Centered>
        ) : (
          <>
            <SwipeDeck
              key={`${mediaType}:${genre ?? 'all'}:${era ?? 'all'}:${country ?? 'all'}`}
              cards={movies}
              onSwipeRight={markWatched}
              onSwipeLeft={skip}
              onStar={toggleWatchlist}
              onHeart={toggleFavorite}
              onUndo={(movie, type) => undo(movie.id, type, movie.mediaType)}
              isWatchlisted={(movie) => states.isWatchlisted(movie.id)}
              isFavorite={(movie) => states.isFavorite(movie.id)}
              onIndexChange={setTopIndex}
            />
            {exhausted && (
              <Centered pointerEvents="none">
                {isFetchingNextPage ? (
                  <>
                    <LoadingReel size={44} />
                    <Text style={styles.muted}>Rewinding more tapes…</Text>
                  </>
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

      {/* Swipe direction legend. */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Ionicons name="arrow-back" size={16} color={colors.skip} />
          <Text style={styles.legendText}>Skip</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendText}>{watchedLabel(mediaType)}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.watched} />
        </View>
      </View>

      <FilterSheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        genreOptions={genreOptions ?? []}
        genre={genre}
        onGenreChange={setGenre}
        eraOptions={eraOptions}
        era={era}
        onEraChange={setEra}
        countryOptions={COUNTRY_OPTIONS}
        country={country}
        onCountryChange={setCountry}
        hideCountry={mediaType === 'book'}
        onClearAll={() => {
          setGenre(null);
          setEra(null);
          setCountry(null);
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
}: {
  error: unknown;
  onRetry: () => void;
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
        {isToken ? 'Add your TMDB token' : 'Could not load movies'}
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
    marginBottom: spacing.md,
    zIndex: 2,
  },
  switcherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterButtonActive: {
    borderColor: colors.amberBright,
    backgroundColor: 'rgba(217, 165, 49, 0.15)',
  },
  filterButtonPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
  filterButtonText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  },
  tagline: {
    color: 'rgba(243, 231, 210, 0.75)',
    fontFamily: fonts.body,
    fontSize: 13,
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
    marginVertical: spacing.md,
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
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
