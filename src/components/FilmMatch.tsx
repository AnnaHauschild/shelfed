import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSummary } from '@/api/follows';
import { Movie } from '@/api/types';
import { useFilmMatchGroups } from '@/hooks/useFilmMatchGroups';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';

interface Group {
  users: UserSummary[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  verb: string;
  heading: string;
}

/** Followees who love / want to see this title, shown under the film. */
export function FilmMatch({ movie }: { movie: Movie }) {
  const { data } = useFilmMatchGroups(movie.id, movie.mediaType);
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const [popup, setPopup] = useState<Group | null>(null);

  const groups: Group[] = [
    {
      users: data?.favorite ?? [],
      icon: 'heart' as const,
      color: colors.favorite,
      verb: 'love this',
      heading: 'Love this',
    },
    {
      users: data?.watchlist ?? [],
      icon: 'star' as const,
      color: colors.star,
      verb: 'want to see this',
      heading: 'Want to see this',
    },
  ].filter((g) => g.users.length > 0);

  if (groups.length === 0) return null;

  return (
    <>
      {groups.map((g) => {
        const names = g.users
          .slice(0, 3)
          .map((u) => `@${u.username}`)
          .join(', ');
        const extra = g.users.length > 3 ? ` +${g.users.length - 3}` : '';
        const expandable = g.users.length > 1;
        return (
          <Pressable
            key={g.heading}
            style={styles.row}
            disabled={!expandable}
            onPress={() => setPopup(g)}
          >
            <Ionicons name={g.icon} size={14} color={g.color} />
            <Text style={styles.text} numberOfLines={1}>
              {names}
              {extra} {g.verb}
            </Text>
            {expandable && (
              <Ionicons name="chevron-forward" size={14} color={chrome.muted} />
            )}
          </Pressable>
        );
      })}

      <Modal
        visible={!!popup}
        transparent
        animationType="fade"
        onRequestClose={() => setPopup(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPopup(null)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              {popup && (
                <Ionicons name={popup.icon} size={16} color={popup.color} />
              )}
              <Text style={styles.sheetTitle}>{popup?.heading}</Text>
            </View>
            {popup?.users.map((u) => (
              <Text key={u.id} style={styles.friend}>
                @{u.username}
              </Text>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(8, 5, 2, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    sheet: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: c.background,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    sheetTitle: {
      color: c.accent,
      fontFamily: fonts.heading,
      fontSize: 15,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    friend: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
      paddingVertical: 2,
    },
  });

