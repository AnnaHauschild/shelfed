import { Image } from 'expo-image';
import { ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { posterUrl } from '@/api/tmdb';
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
    backgroundColor: '#ecddc1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  letterboxImage: {
    width: '100%',
    height: '100%',
  },
});
