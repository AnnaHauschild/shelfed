import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Movie } from '@/api/types';
import { isUpcoming } from '@/api/movies';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';
import { ActionButtons } from './ActionButtons';
import { PosterImage } from './PosterImage';

interface Props {
  movie: Movie;
  /** When provided, renders the Star/Heart overlay (active card only). */
  onStar?: () => void;
  onHeart?: () => void;
  isWatchlisted?: boolean;
  isFavorite?: boolean;
}

/**
 * Full-bleed movie card: poster fills the frame, a sepia scrim at the bottom
 * keeps the title/genre text legible. Presentational only — swipe gestures and
 * stamps are layered on by SwipeDeck.
 */
export function MovieCard({
  movie,
  onStar,
  onHeart,
  isWatchlisted,
  isFavorite,
}: Props) {
  const subtitle =
    movie.mediaType === 'book' && movie.authors && movie.authors.length > 0
      ? movie.authors.slice(0, 2).join(', ')
      : movie.genres.slice(0, 3).join('  •  ');

  return (
    <View style={styles.card}>
      <PosterImage
        posterPath={movie.posterPath}
        title={movie.title}
        style={styles.poster}
        letterbox={movie.mediaType === 'book'}
      />

      {/* Bottom scrim for text legibility. */}
      <LinearGradient
        colors={['transparent', 'rgba(15,9,4,0.35)', colors.scrim]}
        locations={[0, 0.55, 1]}
        style={styles.scrim}
      />

      {isUpcoming(movie) && <ComingSoonRibbon />}

      {onStar && onHeart && (
        <ActionButtons
          onStar={onStar}
          onHeart={onHeart}
          isWatchlisted={isWatchlisted}
          isFavorite={isFavorite}
        />
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>

        <View style={styles.metaRow}>
          {movie.year != null && (
            <Text style={styles.meta}>{movie.year}</Text>
          )}
          {movie.voteAverage > 0 && (
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={colors.amberBright} />
              <Text style={styles.meta}>{movie.voteAverage.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {subtitle.length > 0 && (
          <Text style={styles.genres} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.innerFrame} pointerEvents="none" />
    </View>
  );
}

/**
 * A cinema-style "Coming Soon" ribbon across the cover, with the text scrolling
 * continuously (marquee) to grab attention. Two identical copies of the text
 * sit side by side; sliding the row by exactly one copy's width and repeating
 * makes the scroll seamless.
 */
function ComingSoonRibbon() {
  const [copyW, setCopyW] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (copyW <= 0) return;
    x.value = 0;
    x.value = withRepeat(
      withTiming(-copyW, { duration: copyW * 9, easing: Easing.linear }),
      -1,
      false,
    );
  }, [copyW, x]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const copy = 'COMING SOON   ✦   '.repeat(6);

  return (
    <View style={styles.ribbon} pointerEvents="none">
      {/* Invisible copy, just to measure one repeat's width once. */}
      <Text
        style={[styles.ribbonText, styles.ribbonMeasure]}
        numberOfLines={1}
        onLayout={(e) => {
          const w = Math.ceil(e.nativeEvent.layout.width);
          if (copyW === 0 && w > 0) setCopyW(w);
        }}
      >
        {copy}
      </Text>
      {copyW > 0 && (
        <Animated.View style={[styles.ribbonRow, rowStyle]}>
          <Text style={[styles.ribbonText, { width: copyW }]} numberOfLines={1}>
            {copy}
          </Text>
          <Text style={[styles.ribbonText, { width: copyW }]} numberOfLines={1}>
            {copy}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: colors.border,
  },
  innerFrame: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(217, 165, 49, 0.22)',
  },
  poster: {
    ...absoluteFill,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  ribbon: {
    position: 'absolute',
    top: '15%',
    left: -24,
    right: -24,
    height: 38,
    backgroundColor: colors.maroon,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.amberBright,
    justifyContent: 'center',
    overflow: 'hidden',
    transform: [{ rotate: '-6deg' }],
  },
  ribbonMeasure: {
    position: 'absolute',
    opacity: 0,
  },
  ribbonRow: {
    flexDirection: 'row',
  },
  ribbonText: {
    fontFamily: fonts.display,
    fontSize: 18,
    letterSpacing: 3,
    color: colors.paper,
  },
  info: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
  },
  title: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 30,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  genres: {
    color: colors.amber,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
  },
});
