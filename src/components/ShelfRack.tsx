import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { PosterImage } from '@/components/PosterImage';
import { StoredMovie } from '@/repositories';
import { colors, fonts, spacing } from '@/theme';

const SPINE_PALETTE = [
  '#7a3527', // brick
  '#a7563d', // terracotta
  '#5e7a3c', // sage
  '#3f6079', // dusty teal
  '#2c4a3a', // forest
  '#8a5a2b', // cinnamon
  '#b3873d', // brass
  '#574a78', // muted plum
  '#2a3b52', // navy
  '#6a4f33', // walnut
];

const SHELF_HEIGHT = 168; // book height
const SHELF_PLANK = 10; // wood plank height under the books
const SPINE_GAP = 2;

interface Props {
  movies: StoredMovie[];
  onOpen: (movie: StoredMovie) => void;
  isWatchlisted?: (id: string) => boolean;
  isFavorite?: (id: string) => boolean;
  /** Available horizontal pixels (after page padding) for laying out spines. */
  containerWidth: number;
}

/**
 * Renders a stack of wooden shelves with movies/books standing as spines on
 * each one. Tapping a spine animates it lifting out and slightly tilting,
 * then opens the details modal.
 */
export function ShelfRack({
  movies,
  onOpen,
  isWatchlisted,
  isFavorite,
  containerWidth,
}: Props) {
  // Choose a spine width that yields a tidy whole-number per row.
  const spinesPerRow = Math.max(5, Math.min(9, Math.floor(containerWidth / 42)));
  const spineWidth =
    (containerWidth - SPINE_GAP * (spinesPerRow - 1)) / spinesPerRow;

  const rows = useMemo(() => {
    const out: StoredMovie[][] = [];
    for (let i = 0; i < movies.length; i += spinesPerRow) {
      out.push(movies.slice(i, i + spinesPerRow));
    }
    return out;
  }, [movies, spinesPerRow]);

  return (
    <View>
      {rows.map((row, idx) => (
        <ShelfRow
          key={idx}
          movies={row}
          onOpen={onOpen}
          isWatchlisted={isWatchlisted}
          isFavorite={isFavorite}
          spineWidth={spineWidth}
        />
      ))}
    </View>
  );
}

function ShelfRow({
  movies,
  onOpen,
  isWatchlisted,
  isFavorite,
  spineWidth,
}: Omit<Props, 'containerWidth'> & { spineWidth: number }) {
  return (
    <View style={styles.rowOuter}>
      <View style={styles.row}>
        {movies.map((m) => (
          <BookSpine
            key={m.id}
            movie={m}
            width={spineWidth}
            onOpen={onOpen}
            watchlisted={isWatchlisted?.(m.id) ?? false}
            favorite={isFavorite?.(m.id) ?? false}
          />
        ))}
      </View>
      {/* Wooden plank under the books. */}
      <LinearGradient
        colors={['#7a4a22', '#4a2d12']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.plank}
      />
      <View style={styles.plankShadow} pointerEvents="none" />
    </View>
  );
}

function BookSpine({
  movie,
  width,
  onOpen,
  watchlisted,
  favorite,
}: {
  movie: StoredMovie;
  width: number;
  onOpen: (movie: StoredMovie) => void;
  watchlisted: boolean;
  favorite: boolean;
}) {
  const lift = useSharedValue(0);
  const tilt = useSharedValue(0);

  const fallbackColor =
    SPINE_PALETTE[hash(movie.id) % SPINE_PALETTE.length];
  const isBook = movie.mediaType === 'book';

  const handlePress = () => {
    lift.value = withSequence(
      withTiming(-22, { duration: 180 }),
      withTiming(0, { duration: 260 }, () => {
        runOnJS(onOpen)(movie);
      }),
    );
    tilt.value = withSequence(
      withTiming(-6, { duration: 180 }),
      withTiming(0, { duration: 260 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: lift.value },
      { rotateZ: `${tilt.value}deg` },
    ],
  }));

  return (
    <Pressable onPress={handlePress} hitSlop={2}>
      <Animated.View
        style={[
          styles.spine,
          {
            width,
            height: SHELF_HEIGHT,
            backgroundColor: fallbackColor,
            borderColor: isBook ? '#1a0d04' : '#0a0a0a',
          },
          animatedStyle,
        ]}
      >
        {/* Poster as the spine's "skin" — unique colours per item. */}
        {movie.posterPath && (
          <PosterImage
            posterPath={movie.posterPath}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}

        {/* Vertical scrim so the title stays legible over any artwork. */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.55)',
            'rgba(0,0,0,0.25)',
            'rgba(0,0,0,0.55)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Top + bottom darker caps for "binding" depth. */}
        <View style={[styles.cap, styles.capTop]} />
        <View style={[styles.cap, styles.capBottom]} />

        {/* Thin highlight stripe down one edge to suggest paper pages. */}
        <View style={styles.pages} />

        {/* Decorative gold band only on books — DVDs get a thin silver foil. */}
        {isBook ? (
          <>
            <View style={[styles.band, styles.bandGold]} />
            <View style={[styles.band, styles.bandGold, { top: undefined, bottom: 32 }]} />
          </>
        ) : (
          <View style={[styles.band, styles.bandSilver]} />
        )}

        {/* Vertical title. */}
        <View style={styles.titleHolder}>
          <Text
            numberOfLines={1}
            style={[styles.title, { width: SHELF_HEIGHT - 32 }]}
          >
            {movie.title}
          </Text>
        </View>

        {/* Tiny badge dots at the very top for star/heart. */}
        {(watchlisted || favorite) && (
          <View style={styles.badges}>
            {watchlisted && (
              <Ionicons name="star" size={9} color={colors.star} />
            )}
            {favorite && (
              <Ionicons name="heart" size={9} color={colors.favorite} />
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

/** djb2-style hash for stable per-item palette assignment. */
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const styles = StyleSheet.create({
  rowOuter: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SPINE_GAP,
    alignItems: 'flex-end',
  },
  plank: {
    height: SHELF_PLANK,
    borderRadius: 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2c1a08',
  },
  plankShadow: {
    height: 6,
    backgroundColor: 'rgba(20, 12, 4, 0.18)',
    marginHorizontal: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  spine: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  cap: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  capTop: { top: 0 },
  capBottom: { bottom: 0 },
  pages: {
    position: 'absolute',
    right: 0,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: 'rgba(243, 231, 210, 0.45)',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 24,
    height: 3,
  },
  bandGold: {
    backgroundColor: 'rgba(216, 165, 72, 0.75)',
  },
  bandSilver: {
    backgroundColor: 'rgba(220, 220, 220, 0.35)',
  },
  titleHolder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f3e7d2',
    fontFamily: fonts.heading,
    fontSize: 11,
    letterSpacing: 0.3,
    transform: [{ rotate: '-90deg' }],
    textAlign: 'center',
  },
  badges: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
  },
});

export { SHELF_HEIGHT };
