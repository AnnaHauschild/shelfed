import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { POSTER_SIZE_SMALL } from '@/constants/config';
import { useMovieDetails } from '@/components/MovieDetailsProvider';
import { MediaSwitcher } from '@/components/MediaSwitcher';
import { PosterImage } from '@/components/PosterImage';
import { useMediaType } from '@/context/MediaTypeProvider';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { colors, fonts, radius, spacing } from '@/theme';
import { ShelfBackground } from '@/components/ShelfBackground';
import { FeatureHeader } from '@/components/FeatureHeader';

/** Manual movie search: find a title, then add it to any shelf. */
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const mediaType = useMediaType();
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');

  // Debounce typing so we only search once the user pauses.
  useEffect(() => {
    const id = setTimeout(() => setQuery(text), 350);
    return () => clearTimeout(id);
  }, [text]);

  const { data, isLoading, isError, error } = useMovieSearch(query);
  const results = useMemo(() => data?.movies ?? [], [data]);
  const trimmed = query.trim();
  // See Discover: header = exactly one shelf row (measured screen / 5) so 4 equal
  // cubbies always show below it, device-independent.
  const [screenH, setScreenH] = useState(0);
  const shelfRow = screenH > 0 ? (screenH - 12) / 5 : 0;
  const headerHeight = screenH > 0 ? Math.round(6 + shelfRow) : insets.top + 150;
  const tagline =
    mediaType === 'tv'
      ? 'Find any series'
      : mediaType === 'book'
        ? 'Find any book'
        : 'Find any movie';

  return (
    <Pressable
      style={[styles.container, { paddingTop: headerHeight + spacing.md }]}
      onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}
      onPress={() => Keyboard.dismiss()}
      accessible={false}
    >
      <ShelfBackground />
      <FeatureHeader height={headerHeight} topInset={insets.top} tagline={tagline} scale={0.55} />
      <View style={styles.switcherRow}>
        <MediaSwitcher />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textOnDarkMuted} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={
            mediaType === 'tv'
              ? 'Find a series by title…'
              : mediaType === 'book'
                ? 'Find a book by title…'
                : 'Find a movie by title…'
          }
          placeholderTextColor={colors.textOnDarkMuted}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {text.length > 0 && (
          <Pressable onPress={() => setText('')} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textOnDarkMuted}
            />
          </Pressable>
        )}
      </View>

      {trimmed.length < 2 ? null : isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.amber} size="large" />
      ) : isError ? (
        <Centered
          icon="cloud-offline-outline"
          text={(error as Error)?.message ?? 'Search failed.'}
        />
      ) : results.length === 0 ? (
        <Centered icon="film-outline" text={`No matches for "${trimmed}".`} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item }) => <ResultRow movie={item} />}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      )}
    </Pressable>
  );
}

/** One search result with a poster, meta and quick add-to-list buttons. */
function ResultRow({ movie }: { movie: Movie }) {
  const { open } = useMovieDetails();
  const { toggleWatchlist, toggleFavorite } = useInteractions();
  const states = useInteractionStates();
  const isWatchlisted = states.isWatchlisted(movie.id);
  const isFavorite = states.isFavorite(movie.id);

  return (
    <Pressable
      style={styles.row}
      onPress={() => {
        Keyboard.dismiss();
        open(movie);
      }}
    >
      <PosterImage
        posterPath={movie.posterPath}
        title={movie.title}
        size={POSTER_SIZE_SMALL}
        style={styles.thumb}
      />
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.rowMeta}>
          {movie.year != null && (
            <Text style={styles.rowMetaText}>{movie.year}</Text>
          )}
          {movie.voteAverage > 0 && (
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color={colors.amberBright} />
              <Text style={styles.rowMetaText}>
                {movie.voteAverage.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        {movie.genres.length > 0 && (
          <Text style={styles.rowGenres} numberOfLines={1}>
            {movie.genres.slice(0, 3).join('  •  ')}
          </Text>
        )}
      </View>
      <View style={styles.rowActions}>
        <Pressable
          hitSlop={8}
          onPress={() => toggleWatchlist(movie)}
          style={styles.quick}
          accessibilityLabel="Add to watchlist"
        >
          <Ionicons
            name={isWatchlisted ? 'star' : 'star-outline'}
            size={22}
            color={colors.star}
          />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => toggleFavorite(movie)}
          style={styles.quick}
          accessibilityLabel="Add to favorites"
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={colors.favorite}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

function Centered({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.centered}>
      <Ionicons name={icon} size={44} color={colors.border} />
      <Text style={styles.mutedText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  brand: {
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 30,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  switcherRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  input: {
    flex: 1,
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: 0,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    // Subtle dark scrim so titles stay readable against the busy shelf.
    backgroundColor: 'rgba(20, 12, 6, 0.72)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(122, 74, 34, 0.35)',
  },
  thumb: {
    width: 60,
    height: 90,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 2,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowMetaText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  rowGenres: {
    color: colors.amber,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quick: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  mutedText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
