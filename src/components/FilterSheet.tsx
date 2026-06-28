import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GenreChips } from './GenreChips';
import { colors, fonts, radius, spacing } from '@/theme';

interface Option {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  genreOptions: Option[];
  genre: string | null;
  onGenreChange: (id: string | null) => void;
  eraOptions: Option[];
  era: string | null;
  onEraChange: (id: string | null) => void;
  countryOptions?: Option[];
  country: string | null;
  onCountryChange: (id: string | null) => void;
  /** When true (books), the country filter is hidden. */
  hideCountry?: boolean;
  onClearAll: () => void;
}

/**
 * Bottom-sheet style filter panel for Discover. Keeps the main screen tidy so
 * the cover stays the hero — open via the "Filter" button next to the switcher.
 */
export function FilterSheet({
  visible,
  onClose,
  genreOptions,
  genre,
  onGenreChange,
  eraOptions,
  era,
  onEraChange,
  countryOptions = [],
  country,
  onCountryChange,
  hideCountry = false,
  onClearAll,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Filters</Text>
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Text style={styles.clear}>Clear all</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {genreOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Genre</Text>
              <GenreChips
                options={genreOptions}
                selected={genre}
                onSelect={onGenreChange}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Year</Text>
            <GenreChips
              options={eraOptions}
              selected={era}
              onSelect={onEraChange}
              accent={colors.amber}
            />
          </View>

          {!hideCountry && countryOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Country</Text>
              <GenreChips
                options={countryOptions}
                selected={country}
                onSelect={onCountryChange}
                accent={colors.watched}
              />
            </View>
          )}
        </ScrollView>

        <Pressable style={styles.doneButton} onPress={onClose} hitSlop={8}>
          <Ionicons name="checkmark" size={18} color={colors.background} />
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  clear: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 2,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.amberBright,
  },
  doneText: {
    color: colors.background,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
