import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mediaPlural, watchedLabel } from '@/constants/labels';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import { ShelfMenu, ShelfMenuSection } from '@/components/ShelfMenu';
import { MoodShelf } from '@/components/MoodShelf';
import { useMovieDetails } from '@/components/MovieDetailsProvider';
import { ShelfBackground } from '@/components/ShelfBackground';
import { ShelfRack } from '@/components/ShelfRack';
import { Skeleton } from '@/components/Skeleton';
import { useMediaType } from '@/context/MediaTypeProvider';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useShelf } from '@/hooks/useShelf';
import { InteractionType, StoredMovie } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';
import { EmptyState } from './EmptyState';

const H_PADDING = spacing.lg;
const { width } = Dimensions.get('window');
const CONTAINER_WIDTH = width - H_PADDING * 2;

/** Ways the user can order a shelf. */
type SortKey = 'recent' | 'rating' | 'title' | 'year';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'rating', label: 'Rating' },
  { key: 'title', label: 'A–Z' },
  { key: 'year', label: 'Year' },
];

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
  const { open } = useMovieDetails();
  const states = useInteractionStates();
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('recent');
  const [menuSection, setMenuSection] = useState<ShelfMenuSection | null>(null);
  const [activeMoodId, setActiveMoodId] = useState<number | null>(null);

  const movies = useMemo(() => data ?? [], [data]);

  // Genres present on this shelf, for the category chips.
  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [movies]);

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
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          <ShelfRack
            movies={sortedMovies}
            onOpen={open}
            isWatchlisted={(id) => states.isWatchlisted(id)}
            isFavorite={(id) => states.isFavorite(id)}
            containerWidth={CONTAINER_WIDTH}
          />
        </ScrollView>
      )}

      <ShelfMenu
        section={menuSection}
        onClose={() => setMenuSection(null)}
        accent={accent}
        sortOptions={SORT_OPTIONS}
        sort={sort}
        onSortChange={(key) => setSort(key as SortKey)}
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
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.controlButton,
        active && { borderColor: accent },
        pressed && styles.controlButtonPressed,
      ]}
    >
      <Ionicons name={icon} size={15} color={active ? accent : colors.paper} />
      <Text
        style={[styles.controlButtonText, active && { color: accent }]}
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
