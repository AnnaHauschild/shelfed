import { Image } from 'expo-image';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, type GestureType } from 'react-native-gesture-handler';
import { Movie } from '@/api/types';
import { posterUrl } from '@/api/tmdb';
import { POSTER_SIZE_SMALL } from '@/constants/config';
import { useProfile } from '@/context/ProfileProvider';
import { useMovieCast } from '@/hooks/useMovieCast';
import { useMovieTrailer } from '@/hooks/useMovieTrailer';
import { useBookDescription } from '@/hooks/useBookDescription';
import { useWatchProviders } from '@/hooks/useWatchProviders';
import { colors, fonts, radius, spacing } from '@/theme';
import { PosterImage } from './PosterImage';

/**
 * Cleans a TMDB character label for display: strips annotations like "(voice)"
 * or "(uncredited)" and drops non-roles such as a documentary "Self". Returns
 * an empty string when there is no real character name worth showing.
 */
function displayCharacter(raw: string): string {
  const cleaned = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (/^(self|himself|herself|themselves)$/i.test(cleaned)) return '';
  return cleaned;
}

/** Public web URL for a movie/series/book, used in share messages. */
function shareUrl(movie: Movie): string {
  if (movie.mediaType === 'book') return `https://openlibrary.org/works/${movie.id}`;
  if (movie.mediaType === 'tv') return `https://www.themoviedb.org/tv/${movie.id}`;
  return `https://www.themoviedb.org/movie/${movie.id}`;
}

async function shareMovie(movie: Movie, name: string | null): Promise<void> {
  const year = movie.year != null ? ` (${movie.year})` : '';
  const lead = name ? `${name} recommends:` : 'Check this out:';
  const message = `${lead} ${movie.title}${year}\n${shareUrl(movie)}`;
  try {
    await Share.share({ message, title: movie.title });
  } catch {
    // user cancelled or share unavailable — nothing to do
  }
}

interface Props {
  movie: Movie;
  /** Action buttons rendered under the synopsis (e.g. in the details modal). */
  children?: React.ReactNode;
  /** When provided (details modal), the poster/title header becomes a drag zone
   *  to pull the sheet down. The parent wires it to a pan gesture. */
  dragGesture?: GestureType;
  /** Opens the note post-it (details modal only). */
  onOpenNote?: () => void;
  /** Whether this title already has a saved note (lights the note button). */
  hasNote?: boolean;
}

/**
 * Presentational "back of the card" details: poster, title, year, rating,
 * genres, synopsis and top-billed cast. Reused by the swipe-card flip and the
 * details modal, so it stays background-agnostic (its parent provides the
 * surface + framing).
 */
export function MovieDetails({ movie, children, dragGesture, onOpenNote, hasNote }: Props) {
  const isBook = movie.mediaType === 'book';
  const { name } = useProfile();
  const { data: cast } = useMovieCast(movie.id, movie.mediaType);
  const { data: trailerUrl } = useMovieTrailer(movie.id, movie.mediaType);
  const { data: bookDesc } = useBookDescription(movie.id, isBook);
  const { data: watch } = useWatchProviders(movie.id, movie.mediaType);

  const description = isBook ? bookDesc ?? '' : movie.overview;
  const overview =
    description && description.length > 0
      ? description
      : 'No description available for this title.';

  const header = (
      <View style={styles.headerRow}>
        <PosterImage
          posterPath={movie.posterPath}
          title={movie.title}
          size={POSTER_SIZE_SMALL}
          style={styles.poster}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={3}>
            {movie.title}
          </Text>
          <View style={styles.metaRow}>
            {movie.year != null && <Text style={styles.meta}>{movie.year}</Text>}
            {movie.voteAverage > 0 && (
              <View style={styles.rating}>
                <Ionicons name="star" size={13} color={colors.amberBright} />
                <Text style={styles.meta}>{movie.voteAverage.toFixed(1)}</Text>
              </View>
            )}
          </View>
          {movie.genres.length > 0 && (
            <View style={styles.genreRow}>
              {movie.genres.slice(0, 3).map((g) => (
                <View key={g} style={styles.genreChip}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
          )}
          {movie.authors && movie.authors.length > 0 && (
            <Text style={styles.author} numberOfLines={2}>
              {movie.authors.join(', ')}
            </Text>
          )}
        </View>
      </View>
  );

  return (
    <View style={styles.container}>
      {dragGesture ? (
        <GestureDetector gesture={dragGesture}>{header}</GestureDetector>
      ) : (
        header
      )}

      <View style={styles.actionRow}>
        {trailerUrl && (
          <Pressable
            style={[styles.trailerButton, styles.actionFill]}
            onPress={() => {
              Linking.openURL(trailerUrl).catch(() => {});
            }}
          >
            <Ionicons name="play-circle" size={18} color={colors.amberBright} />
            <Text style={styles.trailerText}>Watch Trailer</Text>
          </Pressable>
        )}
        {onOpenNote && (
          <Pressable
            style={[styles.trailerButton, styles.shareCompact]}
            onPress={onOpenNote}
          >
            <Ionicons
              name={hasNote ? 'reader' : 'reader-outline'}
              size={18}
              color={colors.amberBright}
            />
          </Pressable>
        )}
        <Pressable
          style={[styles.trailerButton, trailerUrl ? styles.shareCompact : styles.actionFill]}
          onPress={() => {
            shareMovie(movie, name);
          }}
        >
          <Ionicons name="share-outline" size={18} color={colors.amberBright} />
          {!trailerUrl && <Text style={styles.trailerText}>Share</Text>}
        </Pressable>
      </View>

      <ScrollView
        style={styles.overviewScroll}
        contentContainerStyle={styles.overviewContent}
        showsVerticalScrollIndicator={false}
      >
        {watch && watch.providers.length > 0 && (
          <View style={styles.watchSection}>
            <Text style={styles.sectionLabel}>Where to watch</Text>
            <View style={styles.providerRow}>
              {watch.providers.slice(0, 8).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    if (watch.link) Linking.openURL(watch.link).catch(() => {});
                  }}
                >
                  {p.logoUrl && (
                    <Image
                      source={{ uri: p.logoUrl }}
                      style={styles.providerLogo}
                      contentFit="contain"
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>Synopsis</Text>
        <Text style={styles.overview}>{overview}</Text>

        {cast && cast.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, styles.castLabel]}>Cast</Text>
            {cast.map((member) => {
              const age =
                movie.year != null && member.birthYear != null
                  ? movie.year - member.birthYear
                  : null;
              const character = displayCharacter(member.character);
              const photo = posterUrl(member.profilePath, POSTER_SIZE_SMALL);
              return (
                <View key={member.id} style={styles.castRow}>
                  {photo ? (
                    <Image
                      source={{ uri: photo }}
                      style={styles.castAvatar}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.castAvatar, styles.castAvatarFallback]}>
                      <Ionicons
                        name="person"
                        size={18}
                        color={colors.textOnDarkMuted}
                      />
                    </View>
                  )}
                  <View style={styles.castNameRow}>
                    <Text style={styles.castName} numberOfLines={1}>
                      {member.name}
                    </Text>
                    {age != null && age > 0 && (
                      <Text style={styles.castAge}>{`(${age})`}</Text>
                    )}
                  </View>
                  {character.length > 0 && (
                    <Text style={styles.castCharacter} numberOfLines={1}>
                      {character}
                    </Text>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  poster: {
    width: 96,
    height: 144,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 24,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  author: {
    color: colors.amber,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  genreChip: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  genreText: {
    color: colors.amber,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionFill: {
    flex: 1,
  },
  shareCompact: {
    paddingHorizontal: spacing.md,
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  trailerText: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overviewScroll: {
    flex: 1,
  },
  overviewContent: {
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.amber,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  overview: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  watchSection: {
    marginBottom: spacing.lg,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  providerLogo: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  castLabel: {
    marginTop: spacing.lg,
  },
  castRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  castAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.background,
  },
  castAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  castNameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  castName: {
    flexShrink: 1,
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  castAge: {
    color: colors.amber,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  castCharacter: {
    flexShrink: 1,
    textAlign: 'right',
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
});
