import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { POSTER_SIZE_SMALL } from '@/constants/config';
import { watchedLabel } from '@/constants/labels';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import { useMovieDetails } from '@/components/MovieDetailsProvider';
import { Skeleton } from '@/components/Skeleton';
import { useMediaType } from '@/context/MediaTypeProvider';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useShelf } from '@/hooks/useShelf';
import { InteractionType, StoredMovie } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';
import { EmptyState } from './EmptyState';
import { PosterImage } from './PosterImage';

const NUM_COLUMNS = 3;
const H_PADDING = spacing.lg;
const GAP = spacing.md;
const { width } = Dimensions.get('window');
const TILE_WIDTH =
  (width - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

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

  const renderItem = ({ item }: { item: StoredMovie }) => {
    const isWatchlisted = states.isWatchlisted(item.id);
    const isFavorite = states.isFavorite(item.id);
    return (
      <Pressable style={styles.tile} onPress={() => open(item)}>
        <View>
          <PosterImage
            posterPath={item.posterPath}
            title={item.title}
            size={POSTER_SIZE_SMALL}
            style={styles.poster}
          />
          {(isWatchlisted || isFavorite) && (
            <View style={styles.badges}>
              {isWatchlisted && (
                <View style={styles.badge}>
                  <Ionicons name="star" size={11} color={colors.star} />
                </View>
              )}
              {isFavorite && (
                <View style={styles.badge}>
                  <Ionicons name="heart" size={11} color={colors.favorite} />
                </View>
              )}
            </View>
          )}
        </View>
        <Text style={styles.tileTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.year != null && <Text style={styles.tileYear}>{item.year}</Text>}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={22} color={accent} />
        <Text style={styles.title}>
          {type === 'watched' ? `${watchedLabel(mediaType)} Shelf` : title}
        </Text>
        <Text style={[styles.count, { color: accent }]}>
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
        <FlatList
          data={sortedMovies}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          renderItem={renderItem}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
  },
  switcherRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 26,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  count: {
    fontFamily: fonts.display,
    fontSize: 22,
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
    gap: GAP,
  },
  skeletonTile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.5,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: GAP,
    marginBottom: spacing.lg,
  },
  tile: {
    width: TILE_WIDTH,
  },
  poster: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.5,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    // Subtle "spine on a shelf" depth.
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  badges: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.scrim,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileTitle: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  tileYear: {
    color: colors.textOnPaperMuted,
    fontFamily: fonts.body,
    fontSize: 11,
  },
});
