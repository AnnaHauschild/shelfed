import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
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
}

/**
 * Horizontal row of genre chips with an "All" reset, used to filter a feed by
 * genre. Generic over the option list so it works for movie/TV genres and book
 * subjects alike.
 */
export function GenreChips({
  options,
  selected,
  onSelect,
  accent = colors.amberBright,
}: Props) {
  if (options.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
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
          onPress={() => onSelect(o.id)}
        />
      ))}
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
