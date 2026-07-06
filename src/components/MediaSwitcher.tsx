import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '@/api/types';
import { useMediaTypeControls } from '@/context/MediaTypeProvider';
import { colors, fonts, radius, spacing } from '@/theme';

const OPTIONS: {
  type: MediaType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { type: 'movie', label: 'Movies', icon: 'film' },
  { type: 'tv', label: 'Series', icon: 'tv' },
  { type: 'book', label: 'Books', icon: 'book' },
  { type: 'game', label: 'Games', icon: 'game-controller' },
];

/**
 * Compact segmented control to switch the active category (Movies / Series)
 * while inside the app. Reflects and updates the shared media-type context.
 */
export function MediaSwitcher() {
  const { mediaType, setMediaType } = useMediaTypeControls();

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = mediaType === opt.type;
        return (
          <Pressable
            key={opt.type}
            style={({ pressed }) => [
              styles.pill,
              active && styles.pillActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setMediaType(opt.type)}
            hitSlop={4}
          >
            <Ionicons
              name={opt.icon}
              size={14}
              color={active ? colors.background : colors.textOnDarkMuted}
            />
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
  },
  pillActive: {
    backgroundColor: colors.amberBright,
  },
  pillText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillTextActive: {
    color: colors.background,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
});
