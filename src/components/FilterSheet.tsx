import { useEffect } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GenreChips } from './GenreChips';
import { ActorFilter, SelectedActor } from './ActorFilter';
import { MUST_SEE_LABEL } from '@/api/movies';
import { colors, fonts, radius, spacing } from '@/theme';

const SCREEN_H = Dimensions.get('window').height;

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
  /** Mood/atmosphere collections (Road Trip, Melancholy …). Same select state. */
  vibeOptions?: Option[];
  actor: SelectedActor | null;
  onActorChange: (actor: SelectedActor | null) => void;
  /** When true (series/books), the actor filter is hidden (movies only). */
  hideActor?: boolean;
  eraOptions: Option[];
  era: string | null;
  onEraChange: (id: string | null) => void;
  countryOptions?: Option[];
  country: string | null;
  onCountryChange: (id: string | null) => void;
  /** When true (books), the country filter is hidden. */
  hideCountry?: boolean;
  /** The curated "Must-See" list toggle (movies only). */
  mustSee?: boolean;
  onMustSeeChange?: (value: boolean) => void;
  /** When true (series/books), the Must-See toggle is hidden. */
  hideMustSee?: boolean;
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
  vibeOptions = [],
  eraOptions,
  era,
  onEraChange,
  countryOptions = [],
  country,
  onCountryChange,
  actor,
  onActorChange,
  hideActor = false,
  hideCountry = false,
  mustSee = false,
  onMustSeeChange,
  hideMustSee = false,
  onClearAll,
}: Props) {
  // Drag-to-dismiss, same feel as the movie-details sheet: pull the sheet down
  // past a threshold (or flick it) to close.
  const translateY = useSharedValue(0);
  useEffect(() => {
    if (visible) translateY.value = 0;
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        translateY.value = withTiming(SCREEN_H, { duration: 220 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <GestureDetector gesture={dragGesture}>
            <View style={styles.grabZone}>
              <View style={styles.handleZone}>
                <View style={styles.handle} />
              </View>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Filters</Text>
                <Pressable onPress={onClearAll} hitSlop={8}>
                  <Text style={styles.clear}>Clear all</Text>
                </Pressable>
              </View>
            </View>
          </GestureDetector>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {!hideMustSee && (
            <Pressable
              onPress={() => onMustSeeChange?.(!mustSee)}
              style={[styles.mustSee, mustSee && styles.mustSeeActive]}
            >
              <Text
                style={[styles.mustSeeTitle, mustSee && styles.mustSeeTitleActive]}
              >
                {MUST_SEE_LABEL}
              </Text>
              <Ionicons
                name={mustSee ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={mustSee ? colors.amberBright : colors.border}
              />
            </Pressable>
          )}

          {!hideActor && (
            <View style={styles.section}>
              <Text style={styles.label}>Actor</Text>
              <ActorFilter selected={actor} onSelect={onActorChange} />
            </View>
          )}

          {genreOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Genre</Text>
              <GenreChips
                options={genreOptions}
                selected={genre}
                onSelect={onGenreChange}
                wrap
              />
            </View>
          )}

          {vibeOptions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Vibe</Text>
              <GenreChips
                options={vibeOptions}
                selected={genre}
                onSelect={onGenreChange}
                accent={colors.favorite}
                wrap
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
              wrap
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
                wrap
              />
            </View>
          )}
        </ScrollView>

        <Pressable style={styles.doneButton} onPress={onClose} hitSlop={8}>
          <Ionicons name="checkmark" size={18} color={colors.background} />
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  grabZone: {
    marginBottom: spacing.md,
  },
  handleZone: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  mustSee: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  mustSeeActive: {
    borderColor: colors.amberBright,
    backgroundColor: colors.surfaceRaised,
  },
  mustSeeTitle: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.textOnDarkMuted,
  },
  mustSeeTitleActive: {
    color: colors.amberBright,
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
    color: colors.textOnPaper,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
