import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '@/api/types';
import { useMediaTypeControls } from '@/context/MediaTypeProvider';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';

interface Category {
  type: MediaType | null;
  label: string;
  blurb: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  disabled?: boolean;
}

const CATEGORIES: Category[] = [
  {
    type: 'movie',
    label: 'Movies',
    blurb: 'Recall the films of a lifetime',
    icon: 'film',
    accent: colors.amberBright,
  },
  {
    type: 'tv',
    label: 'Series',
    blurb: 'Track the shows you have binged',
    icon: 'tv',
    accent: colors.watched,
  },
  {
    type: 'book',
    label: 'Books',
    blurb: 'Remember the books you have read',
    icon: 'book',
    accent: colors.star,
  },
];

/**
 * Full-screen launch picker. The user chooses which shelf to browse on every
 * open; once picked, the in-app switcher lets them change category.
 */
export function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { choose } = useMediaTypeControls();

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}>
      <Text style={styles.brand}>Shelfed</Text>
      <Text style={styles.tagline}>Pick a shelf to browse</Text>

      <View style={styles.cards}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.label}
            disabled={c.disabled}
            style={[styles.card, c.disabled && styles.cardDisabled]}
            onPress={() => c.type && choose(c.type)}
          >
            <View style={[styles.iconWrap, { borderColor: c.accent }]}>
              <Ionicons name={c.icon} size={28} color={c.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{c.label}</Text>
              <Text style={styles.cardBlurb}>{c.blurb}</Text>
            </View>
            {!c.disabled && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textOnDarkMuted}
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...absoluteFill,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  brand: {
    color: colors.maroon,
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 0.5,
  },
  tagline: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: 0.2,
  },
  cardBlurb: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
});
