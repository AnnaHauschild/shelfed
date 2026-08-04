import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MediaType } from '@/api/types';
import { useThemeChrome } from '@/context/ThemeProvider';
import { colors } from '@/theme';

/**
 * On-theme loading indicator. Media-aware: books get a page-turning book, while
 * films/series/games fall back to the slowly spinning camera-iris "reel".
 */
export function LoadingReel({
  size = 54,
  color,
  mediaType,
}: {
  size?: number;
  color?: string;
  mediaType?: MediaType;
}) {
  const chrome = useThemeChrome();
  const c = color ?? chrome.accent;
  if (mediaType === 'book') {
    return <BookLoader size={size} color={c} />;
  }
  return <ReelLoader size={size} color={c} />;
}

/** A slowly spinning camera-iris icon. */
function ReelLoader({ size, color }: { size: number; color: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2400, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="aperture" size={size} color={color} />
    </Animated.View>
  );
}

/** The book icon (as used elsewhere in the app), seen from above, with a
 *  single page endlessly turning over the spine. */
function BookLoader({ size, color }: { size: number; color: string }) {
  const turn = useSharedValue(0);

  useEffect(() => {
    // ~2 page turns per second. A gravity-ish bezier (gentle lift, quicker fall,
    // soft landing) reads more naturally than a symmetric ease.
    turn.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 360, easing: Easing.bezier(0.45, 0.05, 0.3, 1) }),
        withTiming(1, { duration: 140 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(turn);
  }, [turn]);

  const pageStyle = useAnimatedStyle(() => ({
    // Fade in as the page lifts off the right and out as it settles on the left,
    // so the instant reset back to the right is hidden.
    opacity: interpolate(
      turn.value,
      [0, 0.05, 0.95, 1],
      [0, 1, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      { perspective: size * 5 },
      { rotateY: `${interpolate(turn.value, [0, 1], [0, -180])}deg` },
    ],
  }));

  // Darkens the page as it stands edge-on (mid-turn), like it's catching less
  // light — the main cue that sells the 3D flip.
  const shadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      turn.value,
      [0, 0.5, 1],
      [0, 0.4, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // The turning "page" is the RIGHT HALF of the very same book glyph, clipped
  // out and hinged on the central spine — so its shape always matches the icon.
  return (
    <View style={[styles.bookArea, { width: size, height: size }]}>
      <Ionicons name="book" size={size} color={color} />
      <Animated.View
        style={[
          styles.pageClip,
          {
            left: size / 2,
            width: size / 2,
            height: size,
            transformOrigin: 'left center',
          },
          pageStyle,
        ]}
      >
        <Ionicons
          name="book"
          size={size}
          color={color}
          style={{ marginLeft: -size / 2 }}
        />
        <Animated.View
          style={[styles.pageShade, shadeStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bookArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageClip: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  pageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.shadow,
  },
});
