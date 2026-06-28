import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
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
