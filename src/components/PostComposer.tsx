import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { useCreatePost } from '@/hooks/useStories';
import { POSTER_SIZE_SMALL } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { PosterImage } from './PosterImage';

/** Compose a Story post for a title (poster + optional caption) → friends. */
export function PostComposer({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const [caption, setCaption] = useState('');
  const create = useCreatePost();

  useEffect(() => {
    if (movie) setCaption('');
  }, [movie]);

  if (!movie) return null;

  const post = () => {
    create.mutate(
      {
        movie: {
          id: movie.id,
          mediaType: movie.mediaType,
          title: movie.title,
          posterPath: movie.posterPath,
          year: movie.year,
        },
        caption,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Share to your friends</Text>
        <View style={styles.card}>
          <PosterImage
            posterPath={movie.posterPath}
            title={movie.title}
            size={POSTER_SIZE_SMALL}
            style={styles.poster}
          />
          <View style={styles.cardInfo}>
            <Text style={styles.movieTitle} numberOfLines={3}>
              {movie.title}
            </Text>
            {movie.year != null && (
              <Text style={styles.year}>{movie.year}</Text>
            )}
          </View>
          </View>
          <TextInput
            style={styles.input}
            value={caption}
            onChangeText={setCaption}
            placeholder="Say something… (optional)"
            placeholderTextColor={chrome.muted}
            multiline
            maxLength={280}
          />
          <Pressable
            style={[styles.postBtn, create.isPending && styles.postBtnOff]}
            onPress={post}
            disabled={create.isPending}
          >
            {create.isPending ? (
              <ActivityIndicator color={chrome.onAccent} size="small" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={16} color={chrome.onAccent} />
                <Text style={styles.postText}>Post</Text>
              </>
            )}
          </Pressable>
          <Text style={styles.hint}>
            Only your accepted friends can see this. Disappears after 24h.
          </Text>
        </View>
      </KeyboardAvoidingView>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      zIndex: 200,
      elevation: 200,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 6, 2, 0.6)',
    },
    sheet: {
      backgroundColor: c.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 2,
      borderColor: c.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      paddingTop: spacing.sm,
      gap: spacing.md,
    },
    handle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
    },
    title: {
      color: c.accent,
      fontFamily: fonts.display,
      fontSize: 20,
      letterSpacing: 0.5,
    },
    card: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'center',
    },
    poster: {
      width: 64,
      height: 96,
      borderRadius: radius.sm,
    },
    cardInfo: { flex: 1, gap: 2 },
    movieTitle: {
      color: colors.textOnDark,
      fontFamily: fonts.heading,
      fontSize: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    year: { color: c.muted, fontFamily: fonts.body, fontSize: 13 },
    input: {
      minHeight: 64,
      maxHeight: 140,
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      backgroundColor: c.surfaceRaised,
      padding: spacing.md,
      textAlignVertical: 'top',
    },
    postBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: c.accent,
      borderRadius: radius.xl,
      paddingVertical: spacing.sm + 2,
    },
    postBtnOff: { opacity: 0.6 },
    postText: {
      color: c.onAccent,
      fontFamily: fonts.label,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    hint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 12,
      textAlign: 'center',
    },
  });
