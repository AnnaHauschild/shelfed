import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnUI,
  scrollTo,
  type SharedValue,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { setSetting } from '@/db/settings';
import { INTRO_SEEN_KEY, INTRO_TEXT } from '@/constants/intro';
import { useLanguage } from '@/context/LanguageProvider';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

// Icon + accent per slide, index-aligned with INTRO_TEXT[...].slides. The second
// slide uses a bespoke swipe demo instead of a single badge.
type SlideKind = 'badge' | 'swipe';
const VISUALS: {
  kind: SlideKind;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}[] = [
  { kind: 'badge', icon: 'sparkles', accent: colors.amberBright },
  { kind: 'swipe', icon: 'swap-horizontal', accent: colors.star },
  { kind: 'badge', icon: 'library', accent: colors.star },
  { kind: 'badge', icon: 'people', accent: colors.watched },
];

/**
 * First-launch intro. A small paged, animated walkthrough that teaches the core
 * gestures. Shown once (persisted via INTRO_SEEN_KEY); `onDone` closes it.
 */
export function IntroWalkthrough({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const t = INTRO_TEXT[language];
  const slides = t.slides;
  const last = slides.length - 1;

  const aref = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  // Gentle shared "breathing" that every slide badge reads.
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse]);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  const goTo = (i: number) => {
    runOnUI(() => {
      'worklet';
      scrollTo(aref, i * SCREEN_W, 0, true);
    })();
  };

  const finish = () => {
    setSetting(INTRO_SEEN_KEY, '1').catch(() => {});
    onDone();
  };

  const onPrimary = () => (index < last ? goTo(index + 1) : finish());

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.surfaceRaised, colors.background]}
        style={absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Pressable
        style={[styles.skip, { top: insets.top + spacing.sm }]}
        onPress={finish}
        hitSlop={10}
      >
        <Text style={styles.skipText}>{index < last ? t.skip : ''}</Text>
      </Pressable>

      <Animated.ScrollView
        ref={aref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) =>
          setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
        }
      >
        {slides.map((s, i) => (
          <Slide
            key={i}
            index={i}
            scrollX={scrollX}
            pulse={pulse}
            title={s.title}
            body={s.body}
            visual={VISUALS[i]}
          />
        ))}
      </Animated.ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>
        <Pressable style={styles.cta} onPress={onPrimary}>
          <Text style={styles.ctaText}>{index < last ? t.next : t.done}</Text>
          <Ionicons
            name={index < last ? 'arrow-forward' : 'checkmark'}
            size={18}
            color={colors.textOnPaper}
          />
        </Pressable>
      </View>
    </View>
  );
}

function Slide({
  index,
  scrollX,
  pulse,
  title,
  body,
  visual,
}: {
  index: number;
  scrollX: SharedValue<number>;
  pulse: SharedValue<number>;
  title: string;
  body: string;
  visual: (typeof VISUALS)[number];
}) {
  // Content parallax: fade + rise + settle as this page reaches centre.
  const contentStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W];
    return {
      opacity: interpolate(scrollX.value, input, [0.2, 1, 0.2], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            scrollX.value,
            input,
            [28, 0, 28],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            scrollX.value,
            input,
            [0.94, 1, 0.94],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.slideInner, contentStyle]}>
        {visual.kind === 'swipe' ? (
          <SwipeVisual accent={visual.accent} />
        ) : (
          <BadgeVisual icon={visual.icon} accent={visual.accent} pulse={pulse} />
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </Animated.View>
    </View>
  );
}

function BadgeVisual({
  icon,
  accent,
  pulse,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  pulse: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));
  const glow = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.35,
    transform: [{ scale: 1.1 + pulse.value * 0.12 }],
  }));
  return (
    <View style={styles.visual}>
      <Animated.View
        style={[styles.badgeGlow, { backgroundColor: accent }, glow]}
      />
      <Animated.View style={[styles.badge, { borderColor: accent }, style]}>
        <Ionicons name={icon} size={54} color={accent} />
      </Animated.View>
    </View>
  );
}

function SwipeVisual({ accent }: { accent: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [t]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-24, 24]) },
      { rotate: `${interpolate(t.value, [0, 1], [-6, 6])}deg` },
    ],
  }));
  const leftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.5, 1], [1, 0.35, 0.25], Extrapolation.CLAMP),
  }));
  const rightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.5, 1], [0.25, 0.35, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.swipeRow}>
      <Animated.View style={[styles.swipeChip, { borderColor: colors.skip }, leftStyle]}>
        <Ionicons name="close" size={22} color={colors.skip} />
      </Animated.View>
      <Animated.View style={[styles.swipeCard, { borderColor: accent }, cardStyle]}>
        <Ionicons name="film" size={40} color={accent} />
      </Animated.View>
      <Animated.View
        style={[styles.swipeChip, { borderColor: colors.watched }, rightStyle]}
      >
        <Ionicons name="heart" size={22} color={colors.watched} />
      </Animated.View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W];
    return {
      width: interpolate(scrollX.value, input, [8, 22, 8], Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, input, [0.4, 1, 0.4], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: {
    ...absoluteFill,
    backgroundColor: colors.background,
    zIndex: 300,
  },
  skip: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 2,
    minHeight: 24,
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.textOnDarkMuted,
    letterSpacing: 0.5,
  },
  slide: {
    width: SCREEN_W,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  slideInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visual: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  badge: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  badgeGlow: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  swipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  swipeCard: {
    width: 96,
    height: 132,
    borderRadius: radius.lg,
    borderWidth: 2,
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  swipeChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 27,
    color: colors.textOnDark,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amberBright,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.amberBright,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
  },
  ctaText: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.textOnPaper,
    letterSpacing: 0.5,
  },
});
