import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { useFilmMatches } from '@/hooks/useFilmMatches';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

/** "@sam likes this too" — followees who favourited the same title. */
export function FilmMatch({ movie }: { movie: Movie }) {
  const { data: friends } = useFilmMatches(movie.id, movie.mediaType);
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);

  if (!friends || friends.length === 0) return null;

  const names = friends
    .slice(0, 3)
    .map((f) => `@${f.username}`)
    .join(', ');
  const extra = friends.length > 3 ? ` +${friends.length - 3}` : '';
  const verb = friends.length === 1 ? 'likes' : 'like';

  return (
    <View style={styles.row}>
      <Ionicons name="heart" size={14} color={colors.favorite} />
      <Text style={styles.text}>
        {names}
        {extra} {verb} this too
      </Text>
    </View>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: c.surfaceRaised,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginTop: spacing.sm,
    },
    text: {
      flex: 1,
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 13,
    },
  });
