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
import { watchedLabel } from '@/constants/labels';
import { MediaSwitcher } from '@/components/MediaSwitcher';
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
}: Props) {
  const insets = useSafeAreaInsets();
  const mediaType = useMediaType();
  const { data, isLoading } = useShelf(type);
  const { open } = useMovieDetails();
  const states = useInteractionStates();
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('recent');

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
        <Text
          style={[
            styles.count,
            { color: accent === colors.watched ? '#3d5520' : accent },
          ]}
        >
          {sortedMovies.length}
        </Text>
      </View>

      <View style={styles.switcherRow}>
        <MediaSwitcher />
      </View>

      {movies.length > 1 && (
        <View style={styles.sortBar}>
          <Ionicons
            name="swap-vertical"
            size={14}
            color={colors.textOnDarkMuted}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
            style={styles.sortScroll}
          >
            {SORT_OPTIONS.map((opt) => (
              <CategoryChip
                key={opt.key}
                label={opt.label}
                active={sort === opt.key}
                accent={accent}
                onPress={() => setSort(opt.key)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {filterable && genres.length > 0 && (
        <View style={styles.chipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <CategoryChip
              label="All"
              active={genre === null}
              accent={accent}
              onPress={() => setGenre(null)}
            />
            {genres.map((g) => (
              <CategoryChip
                key={g}
                label={g}
                active={genre === g}
                accent={accent}
                onPress={() => setGenre(g)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} style={styles.skeletonTile} />
          ))}
        </View>
      ) : movies.length === 0 ? (
        <EmptyState icon={icon} title={emptyTitle} message={emptyMessage} />
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
    </View>
  );
}

function CategoryChip({
  label,
  active,
  accent,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { borderColor: accent, backgroundColor: `${accent}22` },
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.chipText, active && { color: accent }]}>{label}</Text>
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
  count: {
    fontFamily: fonts.display,
    fontSize: 22,
    marginRight: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sortScroll: {
    flexShrink: 1,
  },
  chipsWrapper: {
    marginBottom: spacing.lg,
  },
  chips: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  chipText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipPressed: {
    transform: [{ scale: 0.94 }],
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
