import { useEffect, useState } from 'react';
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
import { ActorFilter, SelectedActor } from './ActorFilter';
import { MUST_SEE_LABEL } from '@/api/movies';
import { colors, fonts, radius, spacing } from '@/theme';
import { useThemeChrome } from '@/context/ThemeProvider';

const SCREEN_H = Dimensions.get('window').height;

interface Option {
  id: string;
  name: string;
}

interface FilterDef {
  key: string;
  label: string;
  options: Option[];
  selected: string[];
  multi: boolean;
  onToggle: (id: string) => void;
  accent: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  genreOptions: Option[];
  /** Selected genre + collection ids (collection is single, genres are multi). */
  genreSelected: string[];
  /** Whether multiple TMDB genres can be picked (movies/series only). */
  genreMulti: boolean;
  onGenreToggle: (id: string) => void;
  /** Mood/atmosphere collections (Road Trip, Melancholy …). */
  vibeOptions?: Option[];
  /** Selected vibe collection id, independent from the Genre selection. */
  vibe?: string | null;
  onVibeChange?: (id: string | null) => void;
  actor: SelectedActor | null;
  onActorChange: (actor: SelectedActor | null) => void;
  /** When true (series/books), the actor filter is hidden (movies only). */
  hideActor?: boolean;
  eraOptions: Option[];
  era: string | null;
  onEraChange: (id: string | null) => void;
  countryOptions?: Option[];
  countrySelected?: string[];
  onCountryToggle?: (id: string) => void;
  /** When true (books), the country filter is hidden. */
  hideCountry?: boolean;
  /** Console/platform filter (games only, RAWG parent-platform ids). */
  platformOptions?: Option[];
  platformSelected?: string[];
  onPlatformToggle?: (id: string) => void;
  /** Streaming-service filter (movies/series only, TMDB watch-provider ids). */
  providerOptions?: Option[];
  providerSelected?: string[];
  onProviderToggle?: (id: string) => void;
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
  genreSelected,
  genreMulti,
  onGenreToggle,
  vibeOptions = [],
  vibe = null,
  onVibeChange,
  eraOptions,
  era,
  onEraChange,
  countryOptions = [],
  countrySelected = [],
  onCountryToggle,
  actor,
  onActorChange,
  hideActor = false,
  hideCountry = false,
  platformOptions = [],
  platformSelected = [],
  onPlatformToggle,
  providerOptions = [],
  providerSelected = [],
  onProviderToggle,
  mustSee = false,
  onMustSeeChange,
  hideMustSee = false,
  onClearAll,
}: Props) {
  // Drag-to-dismiss, same feel as the movie-details sheet: pull the sheet down
  // past a threshold (or flick it) to close.
  const translateY = useSharedValue(0);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) =>
    setOpenKey((cur) => (cur === key ? null : key));
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      setOpenKey(null);
    }
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

  const chrome = useThemeChrome();
  const filterDefs: FilterDef[] = [
    genreOptions.length > 0 && {
      key: 'genre',
      label: 'Genre',
      options: genreOptions,
      selected: genreSelected,
      multi: genreMulti,
      onToggle: onGenreToggle,
      accent: chrome.accent,
    },
    vibeOptions.length > 0 && {
      key: 'vibe',
      label: 'Vibe',
      options: vibeOptions,
      selected: vibe ? [vibe] : [],
      multi: false,
      onToggle: (id: string) => onVibeChange?.(vibe === id ? null : id),
      accent: chrome.accent,
    },
    {
      key: 'year',
      label: 'Year',
      options: eraOptions,
      selected: era ? [era] : [],
      multi: false,
      onToggle: (id: string) => onEraChange(era === id ? null : id),
      accent: chrome.accent,
    },
    platformOptions.length > 0 && {
      key: 'console',
      label: 'Console',
      options: platformOptions,
      selected: platformSelected,
      multi: true,
      onToggle: (id: string) => onPlatformToggle?.(id),
      accent: chrome.accent,
    },
    !hideCountry && countryOptions.length > 0 && {
      key: 'country',
      label: 'Country',
      options: countryOptions,
      selected: countrySelected,
      multi: true,
      onToggle: (id: string) => onCountryToggle?.(id),
      accent: chrome.accent,
    },
    providerOptions.length > 0 && {
      key: 'provider',
      label: 'Streaming',
      options: providerOptions,
      selected: providerSelected,
      multi: true,
      onToggle: (id: string) => onProviderToggle?.(id),
      accent: chrome.accent,
    },
  ].filter(Boolean) as FilterDef[];
  const openDef = filterDefs.find((f) => f.key === openKey) ?? null;
  const selectOption = (def: FilterDef, id: string) => {
    def.onToggle(id);
    if (!def.multi) setOpenKey(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: chrome.background, borderColor: chrome.border }]}>
          <GestureDetector gesture={dragGesture}>
            <View style={styles.grabZone}>
              <View style={styles.handleZone}>
                <View style={[styles.handle, { backgroundColor: chrome.border }]} />
              </View>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Filters</Text>
                <Pressable onPress={onClearAll} hitSlop={8}>
                  <Text style={[styles.clear, { color: chrome.accent }]}>Clear all</Text>
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
              style={[styles.mustSee, { backgroundColor: chrome.surface, borderColor: chrome.border }, mustSee && styles.mustSeeActive, mustSee && { borderColor: chrome.accent }]}
            >
              <Text
                style={[styles.mustSeeTitle, mustSee && styles.mustSeeTitleActive, mustSee && { color: chrome.accent }]}
              >
                {MUST_SEE_LABEL}
              </Text>
              <Ionicons
                name={mustSee ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={mustSee ? chrome.accent : colors.border}
              />
            </Pressable>
          )}

          {!hideActor && (
            <View style={styles.section}>
              <Text style={styles.label}>Actor</Text>
              <ActorFilter selected={actor} onSelect={onActorChange} />
            </View>
          )}

          <View style={styles.filterGrid}>
            {filterDefs.map((f) => {
              const chosen = f.options.filter((o) => f.selected.includes(o.id));
              const valueLabel =
                chosen.length === 0
                  ? ''
                  : chosen.length === 1
                    ? chosen[0].name
                    : `${chosen.length} selected`;
              const isOpen = openKey === f.key;
              return (
                <Pressable
                  key={f.key}
                  style={[styles.gridDropdown, { backgroundColor: chrome.surface, borderColor: chrome.border }, isOpen && styles.gridDropdownOpen, isOpen && { borderColor: chrome.accent }]}
                  onPress={() => toggle(f.key)}
                  hitSlop={4}
                >
                  <View style={styles.gridTextWrap}>
                    <Text style={styles.gridLabel}>{f.label}</Text>
                    <Text
                      style={[styles.gridValue, chosen.length > 0 && { color: f.accent }]}
                      numberOfLines={1}
                    >
                      {valueLabel}
                    </Text>
                  </View>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.textOnDarkMuted}
                  />
                </Pressable>
              );
            })}
          </View>

          {openDef && (
            <View style={[styles.dropdownList, { backgroundColor: chrome.surface, borderColor: chrome.border }]}>
              {openDef.options.map((o) => {
                const active = openDef.selected.includes(o.id);
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => selectOption(openDef, o.id)}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        active && {
                          color: openDef.accent,
                          fontFamily: fonts.label,
                        },
                      ]}
                    >
                      {o.name}
                    </Text>
                    {active && (
                      <Ionicons name="checkmark" size={16} color={openDef.accent} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <Pressable style={[styles.doneButton, { backgroundColor: chrome.accent }]} onPress={onClose} hitSlop={8}>
          <Ionicons name="checkmark" size={18} color={chrome.onAccent} />
          <Text style={[styles.doneText, { color: chrome.onAccent }]}>Done</Text>
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
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm,
  },
  gridDropdown: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  gridDropdownOpen: {
    borderColor: colors.amberBright,
  },
  gridTextWrap: {
    flex: 1,
    marginRight: 4,
  },
  gridLabel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gridValue: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: 1,
    minHeight: 17,
  },
  dropdownList: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    flexShrink: 1,
  },
  itemPressed: {
    backgroundColor: colors.surfaceRaised,
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
