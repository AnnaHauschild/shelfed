import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/theme';

interface Option {
  id: string;
  name: string;
}

interface Props {
  options: Option[];
  /** Currently selected genre id, or null for "All". */
  selected: string | null;
  onSelect: (id: string | null) => void;
  accent?: string;
  /**
   * When true the chips wrap onto multiple rows (a top-down menu you scroll
   * vertically) instead of a single horizontal row you scroll sideways.
   */
  wrap?: boolean;
}

/**
 * Row of genre chips with an "All" reset, used to filter a feed by genre.
 * Generic over the option list so it works for movie/TV genres and book
 * subjects alike. Horizontal-scrolling by default, or wrapping when `wrap`.
 */
export function GenreChips({
  options,
  selected,
  onSelect,
  accent = colors.amberBright,
  wrap = false,
}: Props) {
  if (options.length === 0) return null;

  const chips = (
    <>
      <Chip
        label="All"
        active={selected === null}
        accent={accent}
        onPress={() => onSelect(null)}
      />
      {options.map((o) => (
        <Chip
          key={o.id}
          label={o.name}
          active={selected === o.id}
          accent={accent}
          // Tapping the active chip again clears the filter (toggle), so the
          // user doesn't have to reach for "All".
          onPress={() => onSelect(selected === o.id ? null : o.id)}
        />
      ))}
    </>
  );

  if (wrap) {
    return <View style={styles.wrapRow}>{chips}</View>;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips}
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  accent,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { borderColor: accent, backgroundColor: `${accent}22` },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[styles.chipText, active && { color: accent }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  chipText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
});
