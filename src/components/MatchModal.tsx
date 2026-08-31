import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { UserSummary } from '@/api/follows';
import { POSTER_SIZE_SMALL } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { useThemeChrome } from '@/context/ThemeProvider';
import { PosterImage } from './PosterImage';

export interface MatchInfo {
  movie: Movie;
  friends: UserSummary[];
  kind: 'favorite' | 'watchlist';
}

/** Tinder-style "It's a Match!" celebration when you favourite a shared film. */
export function MatchModal({
  info,
  onClose,
}: {
  info: MatchInfo | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  if (!info) return null;
  const { movie, friends, kind } = info;
  const names = friends
    .slice(0, 3)
    .map((f) => `@${f.username}`)
    .join(', ');
  const extra = friends.length > 3 ? ` +${friends.length - 3}` : '';
  const feeling = kind === 'watchlist' ? 'both want to see' : 'both love';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={ZoomIn.springify().damping(14)}
          style={[styles.card, { backgroundColor: chrome.background, borderColor: chrome.accent }]}
        >
          <Text style={[styles.title, { color: chrome.accent }]}>It&apos;s a Match!</Text>
          <View style={styles.posterWrap}>
            <PosterImage
              posterPath={movie.posterPath}
              title={movie.title}
              size={POSTER_SIZE_SMALL}
              style={styles.poster}
            />
            <View style={[styles.heart, { borderColor: chrome.background }]}>
              <Ionicons name="heart" size={26} color={colors.favorite} />
            </View>
          </View>
          <Text style={styles.sub}>
            You and{' '}
            <Text style={[styles.who, { color: chrome.accent }]}>
              {names}
              {extra}
            </Text>{' '}
            {feeling}
          </Text>
          <Text style={styles.filmTitle} numberOfLines={2}>
            {movie.title}
          </Text>
          <Pressable
            style={[styles.button, { backgroundColor: chrome.accent }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: chrome.onAccent }]}>Nice!</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 5, 2, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 2,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  posterWrap: {
    marginVertical: spacing.xs,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: radius.md,
  },
  heart: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    backgroundColor: 'rgba(8, 5, 2, 0.9)',
    borderRadius: 999,
    borderWidth: 2,
    padding: 6,
  },
  sub: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 17,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  who: {
    fontFamily: fonts.heading,
  },
  filmTitle: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 18,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    fontFamily: fonts.label,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
