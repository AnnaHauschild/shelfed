import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Movie } from '@/api/types';
import { MOODS_LABEL, MOOD_LABEL } from '@/constants/moods';
import {
  useMoodIdsForMovie,
  useMoodMutations,
  useMoods,
} from '@/hooks/useMoods';
import { colors, fonts, radius, spacing } from '@/theme';

interface Props {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet overlay to toggle a single title's membership in the user's
 * moods. Rendered inside the details modal (as an overlay, not a nested RN
 * Modal). New moods are created from the shelf's Moods menu.
 */
export function AddToMoodSheet({ movie, visible, onClose }: Props) {
  const { data: moods } = useMoods();
  const { data: memberIds } = useMoodIdsForMovie(
    movie?.id ?? '',
    movie?.mediaType ?? 'movie',
  );
  const { addMovieToMood, removeFromMood } = useMoodMutations();

  if (!visible || !movie) return null;

  const inMood = new Set(memberIds ?? []);

  return (
    <View style={styles.root}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Add to {MOOD_LABEL.toLowerCase()}</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        {moods && moods.length > 0 ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {moods.map((m) => {
              const checked = inMood.has(m.id);
              return (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.pressed,
                  ]}
                  onPress={() =>
                    checked
                      ? removeFromMood(m.id, movie.id, movie.mediaType)
                      : addMovieToMood(m.id, movie)
                  }
                >
                  <Text style={styles.name} numberOfLines={1}>
                    {m.name}
                  </Text>
                  <Ionicons
                    name={checked ? 'checkmark-circle' : 'add-circle-outline'}
                    size={26}
                    color={checked ? colors.watched : colors.textOnDarkMuted}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.empty}>
            No {MOODS_LABEL.toLowerCase()} yet. Create one from the palette button
            on your shelf, then add titles here.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  done: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  emoji: {
    fontSize: 22,
  },
  name: {
    flex: 1,
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  empty: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
});
