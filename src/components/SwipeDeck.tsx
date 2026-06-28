import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Movie } from '@/api/types';
import { watchedLabel } from '@/constants/labels';
import { InteractionType } from '@/repositories';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';
import { ActionButtons } from './ActionButtons';
import { MovieCard } from './MovieCard';
import { MovieDetails } from './MovieDetails';
import { SwipeStamp } from './SwipeStamp';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { width } = Dimensions.get('window');
// Drag distance past which a release commits the swipe.
const SWIPE_THRESHOLD = width * 0.28;
// Where the card flies off to when dismissed.
const OUT_DISTANCE = width * 1.5;
// A fast flick also commits even if the threshold wasn't reached.
const VELOCITY_THRESHOLD = 800;

interface Props {
  cards: Movie[];
  initialIndex?: number;
  /** Swipe RIGHT — user has watched this movie (-> Watched Shelf). */
  onSwipeRight: (movie: Movie) => void;
  /** Swipe LEFT — user has not watched it (skip). */
  onSwipeLeft: (movie: Movie) => void;
  onStar: (movie: Movie) => void;
  onHeart: (movie: Movie) => void;
  /** Reverses the last swipe: removes its signal so the card returns. */
  onUndo?: (movie: Movie, type: InteractionType) => void;
  isWatchlisted?: (movie: Movie) => boolean;
  isFavorite?: (movie: Movie) => boolean;
  /** Reports the new top-card index after each swipe (for prefetching). */
  onIndexChange?: (index: number) => void;
}

interface TopCardProps {
  movie: Movie;
  onSwipeRight: (movie: Movie) => void;
  onSwipeLeft: (movie: Movie) => void;
  onStar: (movie: Movie) => void;
  onHeart: (movie: Movie) => void;
  isWatchlisted: boolean;
  isFavorite: boolean;
  /** Deck-owned value mirroring this card's horizontal drag, used to fade the
   *  Undo button in/out together with the swipe. */
  dragX: SharedValue<number>;
}

/**
 * The interactive top card. Each instance owns its own shared values, so when
 * the deck advances (cards keyed by movie id) the next card starts centred.
 *
 * A quick tap flips the card to reveal its synopsis/details; a drag swipes it.
 * The two gestures are mutually exclusive (pan wins once the finger moves).
 */
function TopCard({
  movie,
  onSwipeRight,
  onSwipeLeft,
  onStar,
  onHeart,
  isWatchlisted,
  isFavorite,
  dragX,
}: TopCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const flip = useSharedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const isFlippedRef = useRef(false);

  const commit = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'right') onSwipeRight(movie);
      else onSwipeLeft(movie);
    },
    [movie, onSwipeRight, onSwipeLeft],
  );

  const toggleFlip = useCallback(() => {
    // Update the shared value from the gesture callback (not inside a setState
    // updater), so we never write to it during React's render phase.
    const next = !isFlippedRef.current;
    isFlippedRef.current = next;
    setIsFlipped(next);
    flip.value = withTiming(next ? 1 : 0, { duration: 450 });
  }, [flip]);

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .enabled(!isFlipped)
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.15;
        dragX.value = event.translationX;
      })
      .onEnd((event) => {
        const dismiss =
          Math.abs(translateX.value) > SWIPE_THRESHOLD ||
          Math.abs(event.velocityX) > VELOCITY_THRESHOLD;

        if (dismiss) {
          const direction = translateX.value > 0 ? 'right' : 'left';
          dragX.value = withTiming(
            direction === 'right' ? OUT_DISTANCE : -OUT_DISTANCE,
            { duration: 220 },
          );
          translateX.value = withTiming(
            direction === 'right' ? OUT_DISTANCE : -OUT_DISTANCE,
            { duration: 220 },
            () => {
              runOnJS(commit)(direction);
            },
          );
        } else {
          dragX.value = withSpring(0);
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      });

    const tap = Gesture.Tap()
      .maxDuration(250)
      .onEnd(() => {
        runOnJS(toggleFlip)();
      });

    return Gesture.Exclusive(pan, tap);
  }, [isFlipped, commit, toggleFlip, translateX, translateY, dragX]);

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width, 0, width],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  // Dim the poster while swiping so the stamp reads clearly on top of it.
  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0, 0.55],
      Extrapolation.CLAMP,
    ),
  }));

  // Fade the Star/Heart buttons out as soon as a swipe begins, so they don't
  // clash with the WATCHED/SKIP stamp.
  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const watchedStampStyle = useAnimatedStyle(() => {
    const p = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: p, transform: [{ scale: 0.85 + p * 0.15 }] };
  });

  const skipStampStyle = useAnimatedStyle(() => {
    const p = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity: p, transform: [{ scale: 0.85 + p * 0.15 }] };
  });

  return (
    <Animated.View style={[styles.cardWrapper, cardStyle]}>
      <GestureDetector gesture={gesture}>
        <View style={absoluteFill}>
          <Animated.View style={[styles.face, frontStyle]}>
            <MovieCard movie={movie} />
            <Animated.View
              style={[styles.dimOverlay, dimStyle]}
              pointerEvents="none"
            />
            <Animated.View
              style={[styles.stampLayer, watchedStampStyle]}
              pointerEvents="none"
            >
              <SwipeStamp
                label={watchedLabel(movie.mediaType)}
                color={colors.watched}
                side="right"
              />
            </Animated.View>
            <Animated.View
              style={[styles.stampLayer, skipStampStyle]}
              pointerEvents="none"
            >
              <SwipeStamp label="Skip" color={colors.skip} side="left" />
            </Animated.View>
            <View style={styles.flipHint} pointerEvents="none">
              <Ionicons
                name="sync-outline"
                size={13}
                color={colors.textOnDarkMuted}
              />
              <Text style={styles.flipHintText}>Tap for details</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.face, styles.back, backStyle]}>
            <View style={styles.backInner}>
              <MovieDetails movie={movie} />
              <View style={styles.flipHint} pointerEvents="none">
                <Ionicons
                  name="sync-outline"
                  size={13}
                  color={colors.textOnDarkMuted}
                />
                <Text style={styles.flipHintText}>Tap to flip back</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      {!isFlipped && (
        <Animated.View
          style={[absoluteFill, buttonsStyle]}
          pointerEvents="box-none"
        >
          <ActionButtons
            onStar={() => onStar(movie)}
            onHeart={() => onHeart(movie)}
            isWatchlisted={isWatchlisted}
            isFavorite={isFavorite}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

/**
 * A Tinder-style swipe deck. Renders the active card plus up to two upcoming
 * cards beneath it (scaled + offset) for a physical "stack of DVDs" feel.
 * Keeps a small history so the last swipe can be undone.
 */
export function SwipeDeck({
  cards,
  initialIndex = 0,
  onSwipeRight,
  onSwipeLeft,
  onStar,
  onHeart,
  onUndo,
  isWatchlisted,
  isFavorite,
  onIndexChange,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [history, setHistory] = useState<
    { movie: Movie; type: InteractionType }[]
  >([]);
  // Mirrors the active card's horizontal drag so the Undo button can fade out
  // during a swipe and back in afterwards (like the Star/Heart buttons).
  const dragX = useSharedValue(0);

  const advance = useCallback(
    (handler: (movie: Movie) => void, movie: Movie, type: InteractionType) => {
      handler(movie);
      setHistory((prev) => [...prev, { movie, type }]);
      setIndex((current) => current + 1);
    },
    [],
  );

  // Report the active-card index to the parent from an effect, i.e. AFTER
  // render — calling it inside the setIndex updater would update the parent
  // mid-render and trigger React's "setState while rendering" warning.
  useEffect(() => {
    onIndexChange?.(index);
    // Reset the drag mirror so the Undo button is fully visible on a new card.
    dragX.value = 0;
  }, [index, onIndexChange, dragX]);

  const handleRight = useCallback(
    (movie: Movie) => advance(onSwipeRight, movie, 'watched'),
    [advance, onSwipeRight],
  );
  const handleLeft = useCallback(
    (movie: Movie) => advance(onSwipeLeft, movie, 'skipped'),
    [advance, onSwipeLeft],
  );

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      onUndo?.(last.movie, last.type);
      setIndex((current) => Math.max(0, current - 1));
      return prev.slice(0, -1);
    });
  }, [onUndo]);

  // Fade the Undo button out as the card is dragged, mirroring Star/Heart.
  const undoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(dragX.value),
      [0, SWIPE_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Active card + two upcoming, rendered back-to-front so the top card is last.
  const visible = cards
    .slice(index, index + 3)
    .map((movie, depth) => ({ movie, depth }))
    .reverse();

  return (
    <View style={styles.deck}>
      <LinearGradient
        colors={['rgba(216, 165, 72, 0.22)', 'rgba(216, 165, 72, 0.05)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={styles.glow}
        pointerEvents="none"
      />
      {visible.map(({ movie, depth }) =>
        depth === 0 ? (
          <TopCard
            key={movie.id}
            movie={movie}
            onSwipeRight={handleRight}
            onSwipeLeft={handleLeft}
            onStar={onStar}
            onHeart={onHeart}
            isWatchlisted={isWatchlisted?.(movie) ?? false}
            isFavorite={isFavorite?.(movie) ?? false}
            dragX={dragX}
          />
        ) : (
          <View
            key={movie.id}
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: 1 - depth * 0.04 }, { translateY: depth * 12 }],
                zIndex: -depth,
              },
            ]}
            pointerEvents="none"
          >
            <MovieCard movie={movie} />
          </View>
        ),
      )}

      {history.length > 0 && (
        <AnimatedPressable
          style={[styles.undoButton, undoStyle]}
          onPress={handleUndo}
          hitSlop={8}
        >
          <Ionicons name="arrow-undo" size={16} color={colors.paper} />
          <Text style={styles.undoText}>Undo</Text>
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deck: {
    flex: 1,
  },
  glow: {
    ...absoluteFill,
  },
  cardWrapper: {
    ...absoluteFill,
  },
  face: {
    ...absoluteFill,
    backfaceVisibility: 'hidden',
  },
  back: {
    backgroundColor: 'transparent',
  },
  backInner: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stampLayer: {
    ...absoluteFill,
  },
  dimOverlay: {
    ...absoluteFill,
    backgroundColor: colors.scrim,
    borderRadius: radius.xl,
  },
  flipHint: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.8,
  },
  flipHintText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  undoButton: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.scrim,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 20,
  },
  undoText: {
    color: colors.paper,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
