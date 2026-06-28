import { createContext, useCallback, useContext, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { watchedLabel } from '@/constants/labels';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { colors, fonts, radius, spacing } from '@/theme';
import { MovieDetails } from './MovieDetails';

interface DetailsContextValue {
  /** Opens the shared details modal for a movie. */
  open: (movie: Movie) => void;
}

const DetailsContext = createContext<DetailsContextValue | null>(null);

/** Opens the app-wide movie-details modal from anywhere. */
export function useMovieDetails(): DetailsContextValue {
  const ctx = useContext(DetailsContext);
  if (!ctx) {
    throw new Error('useMovieDetails must be used within a MovieDetailsProvider');
  }
  return ctx;
}

/**
 * Provides a single, app-wide movie-details modal. Tapping a poster on any
 * shelf or search result opens it, where the movie can be added to / removed
 * from the Watched shelf, Watchlist and Favorites.
 */
export function MovieDetailsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const open = useCallback((m: Movie) => setMovie(m), []);
  const close = useCallback(() => setMovie(null), []);

  return (
    <DetailsContext.Provider value={{ open }}>
      {children}
      <DetailsModal movie={movie} onClose={close} />
    </DetailsContext.Provider>
  );
}

function DetailsModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  const { toggleWatched, toggleWatchlist, toggleFavorite } = useInteractions();
  const states = useInteractionStates();

  if (!movie) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <MovieDetails movie={movie}>
          <View style={styles.actions}>
            <DetailAction
              label={watchedLabel(movie.mediaType)}
              color={colors.watched}
              icon="albums-outline"
              activeIcon="albums"
              active={states.isWatched(movie.id)}
              onPress={() => toggleWatched(movie)}
            />
            <DetailAction
              label="Watchlist"
              color={colors.star}
              icon="star-outline"
              activeIcon="star"
              active={states.isWatchlisted(movie.id)}
              onPress={() => toggleWatchlist(movie)}
            />
            <DetailAction
              label="Favorite"
              color={colors.favorite}
              icon="heart-outline"
              activeIcon="heart"
              active={states.isFavorite(movie.id)}
              onPress={() => toggleFavorite(movie)}
            />
          </View>
          <Text style={styles.hint}>
            Tap a lit icon again to remove it from that list.
          </Text>
        </MovieDetails>

        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textOnDarkMuted} />
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

interface DetailActionProps {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}

function DetailAction({
  label,
  color,
  icon,
  activeIcon,
  active,
  onPress,
}: DetailActionProps) {
  return (
    <Pressable style={styles.action} onPress={onPress} hitSlop={6}>
      <View
        style={[
          styles.actionCircle,
          active && { borderColor: color, backgroundColor: `${color}22` },
        ]}
      >
        <Ionicons name={active ? activeIcon : icon} size={26} color={color} />
      </View>
      <Text style={[styles.actionLabel, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '76%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  action: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  closeText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
