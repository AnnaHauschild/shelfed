import { Image } from 'expo-image';
import { ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { posterUrl } from '@/api/tmdb';
import { SCREENSHOT_MODE } from '@/api/screenshotData';
import { colors, fonts, spacing } from '@/theme';

// Neutral sepia blur placeholder shown while a poster loads.
const BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

interface Props {
  posterPath: string | null;
  size?: string;
  title?: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain';
  /** When true (e.g. book covers), centre the artwork on a dark backdrop. */
  letterbox?: boolean;
}

/**
 * Renders a TMDB poster via expo-image (cached, fast) with a graceful text
 * fallback when no poster path is available.
 */
export function PosterImage({
  posterPath,
  size,
  title,
  style,
  contentFit = 'cover',
  letterbox = false,
}: Props) {
  const uri = posterUrl(posterPath, size);

  // Screenshot mode: replace every poster with our own generated cover art so
  // store screenshots never show protected third-party imagery.
  if (SCREENSHOT_MODE) {
    return <FakeCover seed={title ?? posterPath ?? 'shelfed'} style={style} />;
  }

  if (!uri) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText} numberOfLines={4}>
          {title ?? 'No poster'}
        </Text>
      </View>
    );
  }

  if (letterbox) {
    return (
      <View style={[styles.letterbox, style]}>
        <Image
          source={{ uri }}
          style={styles.letterboxImage}
          contentFit="contain"
          placeholder={{ blurhash: BLURHASH }}
          transition={250}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style as StyleProp<ImageStyle>}
      contentFit={contentFit}
      placeholder={{ blurhash: BLURHASH }}
      transition={250}
    />
  );
}

// --- Screenshot-mode fake cover art (original, no third-party imagery) -------
const PALETTES = [
  { sky: ['#f6b26b', '#d9713b', '#5a2a2e'], sun: '#ffe9c2', hillA: '#7a3b2e', hillB: '#361a17', night: false }, // sunset
  { sky: ['#3a6ea5', '#1f4b73', '#06283d'], sun: '#eaf4ff', hillA: '#123a52', hillB: '#07202f', night: false }, // ocean
  { sky: ['#6a9a5b', '#3f6b4a', '#16321f'], sun: '#f0f5d8', hillA: '#274d33', hillB: '#0f2317', night: false }, // forest
  { sky: ['#3b3566', '#241f47', '#0d0b1f'], sun: '#f2ead0', hillA: '#1c1838', hillB: '#0a0818', night: true },  // dusk
  { sky: ['#e0a950', '#b06a2e', '#4a2a18'], sun: '#fff0c8', hillA: '#5e3418', hillB: '#2c1710', night: false }, // desert
  { sky: ['#274060', '#152a44', '#070d18'], sun: '#dbe7f5', hillA: '#101f30', hillB: '#060c15', night: true },  // night road
] as const;

const FAKE_STARS = [
  { x: 18, y: 14 }, { x: 34, y: 22 }, { x: 52, y: 11 },
  { x: 68, y: 25 }, { x: 80, y: 16 }, { x: 44, y: 31 },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * A stylised, made-up "cover" (warm cinematic vibe: sky, sun, hills) drawn
 * purely with views + gradients. Deterministic per title. Used ONLY in
 * screenshot mode so store screenshots contain no third-party artwork.
 */
function FakeCover({ seed, style }: { seed: string; style?: StyleProp<ViewStyle> }) {
  const h = hashString(seed);
  const p = PALETTES[h % PALETTES.length];
  const sunLeft = 16 + (h % 5) * 12;
  const sunTop = 12 + ((h >> 3) % 4) * 6;
  return (
    <View style={[styles.fakeRoot, style]}>
      <LinearGradient
        colors={p.sky}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {p.night &&
        FAKE_STARS.map((s, i) => (
          <View
            key={i}
            style={[styles.fakeStar, { left: `${s.x}%`, top: `${s.y}%` }]}
          />
        ))}
      <View
        style={[
          styles.fakeSun,
          { backgroundColor: p.sun, left: `${sunLeft}%`, top: `${sunTop}%` },
        ]}
      />
      <View style={[styles.fakeHillBack, { backgroundColor: p.hillA }]} />
      <View style={[styles.fakeHillFront, { backgroundColor: p.hillB }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fallbackText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.heading,
    fontSize: 18,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  letterbox: {
    backgroundColor: '#120a04',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  letterboxImage: {
    width: '100%',
    height: '100%',
  },
  fakeRoot: {
    overflow: 'hidden',
    backgroundColor: '#20140a',
  },
  fakeSun: {
    position: 'absolute',
    width: '32%',
    aspectRatio: 1,
    borderRadius: 999,
    opacity: 0.92,
  },
  fakeStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  fakeHillBack: {
    position: 'absolute',
    bottom: 0,
    left: '-22%',
    width: '86%',
    height: '42%',
    borderTopLeftRadius: 160,
    borderTopRightRadius: 240,
  },
  fakeHillFront: {
    position: 'absolute',
    bottom: 0,
    right: '-18%',
    width: '90%',
    height: '32%',
    borderTopLeftRadius: 240,
    borderTopRightRadius: 140,
  },
});
