import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { mediaPlural, watchedLabel } from '@/constants/labels';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import { ShelfMenu, ShelfMenuSection } from '@/components/ShelfMenu';
import { MoodShelf } from '@/components/MoodShelf';
import { useMovieDetails } from '@/components/MovieDetailsProvider';
import { useThemeChrome } from '@/context/ThemeProvider';
import { ShelfBackground } from '@/components/ShelfBackground';
import { ShelfRack } from '@/components/ShelfRack';
import { Skeleton } from '@/components/Skeleton';
import { useMediaType, useMediaTypeControls } from '@/context/MediaTypeProvider';
import { useShelfFilter } from '@/context/ShelfFilterProvider';
import { useSettings } from '@/context/SettingsProvider';
import { getSetting, setSetting } from '@/db/settings';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useGenreBackfill } from '@/hooks/useGenreBackfill';
import { useShelf, useReorderShelf } from '@/hooks/useShelf';
import { InteractionType, StoredMovie } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';
import { EmptyState } from './EmptyState';

const H_PADDING = spacing.lg;
const { width } = Dimensions.get('window');
const CONTAINER_WIDTH = width - H_PADDING * 2;

/** Ways the user can order a shelf. */
type SortKey = 'recent' | 'rating' | 'title' | 'year' | 'custom';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'rating', label: 'Rating' },
  { key: 'title', label: 'A–Z' },
  { key: 'year', label: 'Year' },
  { key: 'custom', label: 'Custom' },
];

const DEFAULT_SORT: SortKey = 'recent';

function isSortKey(value: string | null): value is SortKey {
  return !!value && SORT_OPTIONS.some((o) => o.key === value);
}

interface Props {
  type: InteractionType;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  emptyTitle: string;
  emptyMessage: string;
  /** Show genre filter chips to organise the shelf into categories. */
  filterable?: boolean;
  /** Show the “Moods” menu (personal, curated sub-shelves). Watched shelf only. */
  moods?: boolean;
}

/**
 * A reusable "shelf" of movie posters laid out as a 3-column grid, evoking a row
 * of DVD spines in a rental store. Used by the Watched, Watchlist and Favorites
 * screens — they differ only by interaction type and accent colour.
 *
 * Tapping a poster opens the shared details modal (where it can be marked or
 * removed). When `filterable`, a genre chip row lets the user narrow the shelf
 * by category.
 */
export function ShelfGrid({
  type,
  title,
  icon,
  accent,
  emptyTitle,
  emptyMessage,
  filterable = false,
  moods = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const mediaType = useMediaType();
  const { data, isLoading } = useShelf(type);
  const reorder = useReorderShelf(type);
  const { open } = useMovieDetails();
  const states = useInteractionStates();
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [menuSection, setMenuSection] = useState<ShelfMenuSection | null>(null);
  const [activeMoodId, setActiveMoodId] = useState<number | null>(null);

  // Each shelf keeps its own arrangement, so a book wishlist can stay A–Z while
  // the movie shelf is hand-arranged.
  const sortSettingKey = `shelfSort:${type}:${mediaType}`;
  useEffect(() => {
    let active = true;
    getSetting(sortSettingKey)
      .then((stored) => {
        if (active) setSort(isSortKey(stored) ? stored : DEFAULT_SORT);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [sortSettingKey]);

  const changeSort = useCallback(
    (key: SortKey) => {
      setSort(key);
      setSetting(sortSettingKey, key).catch(() => {});
    },
    [sortSettingKey],
  );

  // Apply a genre preselected elsewhere (e.g. tapped in Statistics) to the
  // Watched shelf once it opens for the matching category.
  const { pending, clearPending } = useShelfFilter();
  const { open: openSettings } = useSettings();
  const { backToLanding } = useMediaTypeControls();
  const [cameFromStats, setCameFromStats] = useState(false);
  useEffect(() => {
    if (type === 'watched' && pending && pending.mediaType === mediaType) {
      setGenre(pending.genre);
      setActiveMoodId(null);
      setCameFromStats(true);
      clearPending();
    }
  }, [type, pending, mediaType, clearPending]);

  // The "from Statistics" state is transient: leaving the shelf (switching tab
  // or category) drops both the back button and its genre filter.
  const fromStats = useRef(false);
  useEffect(() => {
    fromStats.current = cameFromStats;
  }, [cameFromStats]);
  const clearFromStats = useCallback(() => {
    if (fromStats.current) {
      setGenre(null);
      setCameFromStats(false);
    }
  }, []);
  // On category switch (but not while a Statistics jump is arriving).
  const prevMedia = useRef(mediaType);
  useEffect(() => {
    if (prevMedia.current !== mediaType && !pending) clearFromStats();
    prevMedia.current = mediaType;
  }, [mediaType, pending, clearFromStats]);
  // On blur (leaving this tab).
  useFocusEffect(useCallback(() => clearFromStats, [clearFromStats]));

  // Returns to Statistics over the home page (so swiping Settings down lands
  // home), and drops the shelf's Statistics state.
  const backToStats = () => {
    setGenre(null);
    setCameFromStats(false);
    backToLanding();
    openSettings({ stats: true });
  };

  const movies = useMemo(() => data ?? [], [data]);

  // Genres present on this shelf, for the category chips.
  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

  useGenreBackfill(
    mediaType,
    movies.some((m) => m.genres.length === 0),
  );

  const visibleMovies = useMemo(
    () => (genre ? movies.filter((m) => m.genres.includes(genre)) : movies),
    [movies, genre],
  );
  const sortedMovies = useMemo(
    () => applySort(visibleMovies, sort),
    [visibleMovies, sort],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <ShelfBackground variant="wall" />
      <View style={styles.header}>
        <Ionicons name={icon} size={22} color={accent} />
        <Text style={styles.title}>
          {type === 'watched' ? `${watchedLabel(mediaType)} Shelf` : title}
        </Text>
      </View>

      <View style={styles.switcherRow}>
        <MediaSwitcher />
      </View>

      <View style={styles.controlsRow}>
        <ControlButton
          icon="swap-vertical"
          label={
            sort !== 'recent'
              ? SORT_OPTIONS.find((o) => o.key === sort)?.label ?? 'Sort'
              : 'Sort'
          }
          active={sort !== 'recent'}
          accent={accent}
          onPress={() => setMenuSection('sort')}
        />
        {filterable && (
          <ControlButton
            icon="pricetags-outline"
            label={genre ?? 'Genre'}
            active={genre !== null}
            accent={accent}
            onPress={() => setMenuSection('genre')}
          />
        )}
        {moods && (
          <ControlButton
            icon="color-palette-outline"
            label="Mood"
            active={false}
            accent={accent}
            onPress={() => setMenuSection('moods')}
          />
        )}
      </View>

      {cameFromStats && genre && (
        <View style={styles.statsBackRow}>
          <ControlButton
            icon="arrow-back"
            label="Statistics"
            active
            accent={accent}
            onPress={backToStats}
          />
        </View>
      )}

      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} style={styles.skeletonTile} />
          ))}
        </View>
      ) : movies.length === 0 ? (
        <EmptyState
          icon={icon}
          title={emptyTitle}
          message={emptyMessage.replace('{noun}', mediaPlural(mediaType))}
        />
      ) : visibleMovies.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title="Nothing in this category"
          message={`No ${genre} titles on this shelf yet.`}
        />
      ) : sort === 'custom' ? (
        <ShelfRack
          movies={sortedMovies}
          onOpen={(m) => open(m, sortedMovies)}
          isWatchlisted={(id) => states.isWatchlisted(id)}
          isFavorite={(id) => states.isFavorite(id)}
          containerWidth={CONTAINER_WIDTH}
          showStar={type !== 'watchlist'}
          showHeart={type !== 'favorite'}
          reorderable
          onReorder={(ids) => reorder.mutate(ids)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <ShelfRack
            movies={sortedMovies}
            onOpen={(m) => open(m, sortedMovies)}
            isWatchlisted={(id) => states.isWatchlisted(id)}
            isFavorite={(id) => states.isFavorite(id)}
            containerWidth={CONTAINER_WIDTH}
            showStar={type !== 'watchlist'}
            showHeart={type !== 'favorite'}
          />
        </ScrollView>
      )}

      <ShelfMenu
        section={menuSection}
        onClose={() => setMenuSection(null)}
        accent={accent}
        sortOptions={SORT_OPTIONS}
        sort={sort}
        onSortChange={(key) => changeSort(key as SortKey)}
        genres={filterable ? genres : undefined}
        genre={genre}
        onGenreChange={setGenre}
        onOpenMood={(id) => {
          setMenuSection(null);
          setActiveMoodId(id);
        }}
      />
      {moods && (
        <MoodShelf
          moodId={activeMoodId}
          sourceType={type}
          onClose={() => setActiveMoodId(null)}
        />
      )}
    </View>
  );
}

/** A tappable pill under the media switcher that opens one menu section. */
function ControlButton({
  icon,
  label,
  active,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  const chrome = useThemeChrome();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.controlButton,
        { backgroundColor: chrome.surface, borderColor: chrome.border },
        active && { borderColor: accent },
        pressed && styles.controlButtonPressed,
      ]}
    >
      <Ionicons name={icon} size={15} color={active ? accent : chrome.muted} />
      <Text
        style={[styles.controlButtonText, { color: chrome.muted }, active && { color: accent }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Returns a new array of movies ordered by the chosen key. */
function applySort(movies: StoredMovie[], sort: SortKey): StoredMovie[] {
  // 'recent' is the natural order from the database (most recently added first).
  if (sort === 'recent') return movies;
  const copy = [...movies];
  switch (sort) {
    case 'rating':
      copy.sort((a, b) => b.voteAverage - a.voteAverage);
      break;
    case 'title':
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'year':
      copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
      break;
    case 'custom':
      // Manual drag order; items without a position yet fall to the end.
      copy.sort((a, b) => {
        const ao = a.sortOrder;
        const bo = b.sortOrder;
        if (ao == null && bo == null) return 0;
        if (ao == null) return 1;
        if (bo == null) return -1;
        return ao - bo;
      });
      break;
  }
  return copy;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: H_PADDING,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    zIndex: 2,
  },
  switcherRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    zIndex: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    zIndex: 2,
  },
  statsBackRow: {
    flexDirection: 'row',
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    zIndex: 2,
  },
  title: {
    flex: 1,
    color: colors.paper,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  controlButtonText: {
    color: colors.paper,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    maxWidth: 120,
  },
  controlButtonPressed: {
    opacity: 0.85,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  skeletonTile: {
    width: 32,
    height: 160,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
});
