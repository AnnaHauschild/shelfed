import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '@/api/types';
import { useMediaTypeControls } from '@/context/MediaTypeProvider';
import { useThemeChrome } from '@/context/ThemeProvider';
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
export function MediaSwitcher({
  filterCount = 0,
  onFilterPress,
}: {
  /** Number of active filters (Discover only). Shows a count badge. */
  filterCount?: number;
  /** When set, a trailing filter pill is shown inside the bar. */
  onFilterPress?: () => void;
} = {}) {
  const { mediaType, setMediaType, backToLanding } = useMediaTypeControls();
  const chrome = useThemeChrome();
  const hasFilters = filterCount > 0;

  return (
    <View style={[styles.row, { backgroundColor: chrome.surface, borderColor: chrome.border }]}>
      <Pressable
        style={({ pressed }) => [styles.homePill, { borderRightColor: chrome.border }, pressed && styles.pressed]}
        onPress={backToLanding}
        hitSlop={4}
        accessibilityLabel="Home"
      >
        <Ionicons name="home" size={15} color={chrome.muted} />
      </Pressable>
      {OPTIONS.map((opt) => {
        const active = mediaType === opt.type;
        return (
          <Pressable
            key={opt.type}
            style={({ pressed }) => [
              styles.pill,
              active && { backgroundColor: chrome.accent },
              pressed && styles.pressed,
            ]}
            onPress={() => setMediaType(opt.type)}
            hitSlop={4}
            accessibilityLabel={opt.label}
          >
            <Ionicons
              name={opt.icon}
              size={14}
              color={active ? chrome.onAccent : chrome.muted}
            />
            {active && (
              <Text style={[styles.pillText, { color: chrome.onAccent }]}>
                {opt.label}
              </Text>
            )}
          </Pressable>
        );
      })}
      {onFilterPress && (
        <Pressable
          style={({ pressed }) => [styles.filterPill, { borderLeftColor: chrome.border }, pressed && styles.pressed]}
          onPress={onFilterPress}
          hitSlop={4}
          accessibilityLabel="Filters"
        >
          <Ionicons
            name="options-outline"
            size={15}
            color={hasFilters ? chrome.accent : chrome.muted}
          />
          {hasFilters && <Text style={[styles.filterCount, { color: chrome.accent }]}>{filterCount}</Text>}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  homePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: 1,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    marginLeft: 1,
  },
  filterCount: {
    color: colors.amberBright,
    fontFamily: fonts.label,
    fontSize: 12,
    fontWeight: '700',
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
