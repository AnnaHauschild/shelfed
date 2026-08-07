import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LANGUAGES } from '@/constants/languages';
import { useLanguage } from '@/context/LanguageProvider';
import { useProfile } from '@/context/ProfileProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { ShelfTheme, ThemeChrome, useTheme, useThemeChrome } from '@/context/ThemeProvider';
import { MediaType } from '@/api/types';
import { useMediaTypeControls } from '@/context/MediaTypeProvider';
import { useShelfFilter } from '@/context/ShelfFilterProvider';
import { useStats } from '@/hooks/useStats';
import { AccountSection } from './AccountSection';
import { AccountActions } from './AccountActions';

const SCREEN_H = Dimensions.get('window').height;

interface ThemeOption {
  id: ShelfTheme;
  label: string;
  /** Swatch colours (top → bottom) previewing the look. */
  swatch: [string, string];
  /** A small accent dot on the swatch (e.g. the warm LED glow). */
  dot?: string;
  /** Not selectable yet — shown as a preview of what's coming. */
  soon?: boolean;
}

const THEMES: ThemeOption[] = [
  {
    id: 'classic',
    label: 'Classic Shelf',
    swatch: ['#3e2410', '#1a0e05'],
  },
  {
    id: 'scifi',
    label: 'Sci-Fi Bay',
    swatch: ['#0b1024', '#05030f'],
    dot: '#42e8ff',
  },
  {
    id: 'minimal',
    label: 'Modern Minimal',
    swatch: ['#e9e3d8', '#cbc3b4'],
    dot: '#f0d28c',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    swatch: ['#4a2f18', '#1c1108'],
    dot: '#9fca94',
  },
];

const STAT_TYPES: {
  key: MediaType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'movie', label: 'Movies', icon: 'film' },
  { key: 'tv', label: 'Series', icon: 'tv' },
  { key: 'book', label: 'Books', icon: 'book' },
  { key: 'game', label: 'Games', icon: 'game-controller' },
];

/**
 * Central settings hub reached from the landing screen. Bundles the display
 * name, content language and (soon) the shelf background theme in one sheet.
 * Dismiss by dragging down (like the other bottom sheets) or tapping outside.
 */
export function SettingsSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { name, setName } = useProfile();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: stats } = useStats(visible);
  const [statType, setStatType] = useState<MediaType | null>(null);
  const topType = useMemo<MediaType>(() => {
    if (!stats) return 'movie';
    let best: MediaType = STAT_TYPES[0].key;
    for (const t of STAT_TYPES) {
      if (stats.byType[t.key] > stats.byType[best]) best = t.key;
    }
    return best;
  }, [stats]);
  const activeType = statType ?? topType;
  const activeGenres = stats?.genresByType[activeType] ?? [];
  const activeLabel = STAT_TYPES.find((t) => t.key === activeType)?.label ?? '';
  const [draft, setDraft] = useState(name ?? '');
  const [langOpen, setLangOpen] = useState(false);
  const [bgOpen, setBgOpen] = useState(false);
  const currentTheme = useMemo(
    () => THEMES.find((t) => t.id === theme) ?? THEMES[0],
    [theme],
  );

  const translateY = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      setDraft(name ?? '');
      setLangOpen(false);
      setBgOpen(false);
    }
  }, [visible, name, translateY]);

  const commitName = () => {
    if ((draft ?? '').trim() !== (name ?? '')) setName(draft).catch(() => {});
  };
  const handleClose = () => {
    commitName();
    onClose();
  };

  const router = useRouter();
  const { choose } = useMediaTypeControls();
  const { requestGenre } = useShelfFilter();
  // Jump to the Watched shelf for this category, pre-filtered to a genre.
  const openGenre = (genre: string) => {
    choose(activeType);
    requestGenre({ mediaType: activeType, genre });
    handleClose();
    router.push('/shelf');
  };

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
          if (finished) runOnJS(handleClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <GestureDetector gesture={dragGesture}>
            <View style={styles.grabZone}>
              <View style={styles.handleZone}>
                <View style={styles.handle} />
              </View>
              <View style={styles.headerRow}>
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={chrome.accent}
                />
                <Text style={styles.title}>Settings</Text>
              </View>
            </View>
          </GestureDetector>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AccountSection />

            {/* ---------------- Profile ---------------- */}
            <Text style={styles.section}>Profile</Text>
            <Text style={styles.hint}>Your name, shown when you share a title.</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="person-circle-outline"
                size={18}
                color={colors.textOnDarkMuted}
              />
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                onBlur={commitName}
                placeholder="Add your name"
                placeholderTextColor={colors.textOnDarkMuted}
                autoCapitalize="words"
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={commitName}
              />
            </View>

            {/* ---------------- Language (dropdown) ---------------- */}
            <Text style={[styles.section, styles.sectionSpaced]}>Language</Text>
            <Text style={styles.hint}>Titles &amp; descriptions in your language.</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setLangOpen((o) => !o)}
            >
              <Text style={styles.dropdownValue}>{currentLang.label}</Text>
              <Ionicons
                name={langOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textOnDarkMuted}
              />
            </Pressable>
            {langOpen && (
              <View style={styles.dropdownList}>
                {LANGUAGES.map((l) => {
                  const active = l.code === language;
                  return (
                    <Pressable
                      key={l.code}
                      onPress={() => {
                        setLanguage(l.code);
                        setLangOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        active && styles.dropdownItemActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          active && styles.dropdownItemTextActive,
                        ]}
                      >
                        {l.label}
                      </Text>
                      {active && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={chrome.accent}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* ---------------- Statistics ---------------- */}
            <Text style={[styles.section, styles.sectionSpaced]}>Statistics</Text>
            {stats && stats.totalWatched > 0 ? (
              <>
                <Text style={styles.hint}>
                  You&apos;ve collected {stats.totalWatched}{' '}
                  {stats.totalWatched === 1 ? 'title' : 'titles'}. Tap a card for
                  its top genres.
                </Text>
                <View style={styles.statGrid}>
                  {STAT_TYPES.map((t) => {
                    const active = t.key === activeType;
                    return (
                      <Pressable
                        key={t.key}
                        onPress={() => setStatType(t.key)}
                        style={({ pressed }) => [
                          styles.statCard,
                          active && styles.statCardActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Ionicons
                          name={t.icon}
                          size={16}
                          color={active ? chrome.accent : chrome.muted}
                        />
                        <Text
                          style={[styles.statNum, !active && styles.statNumIdle]}
                        >
                          {stats.byType[t.key]}
                        </Text>
                        <Text style={styles.statLabel}>{t.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {activeGenres.length > 0 ? (
                  <>
                    <Text style={styles.statSub}>Top genres · {activeLabel}</Text>
                    <View style={styles.genreStatWrap}>
                      {activeGenres.slice(0, 6).map((g) => (
                        <Pressable
                          key={g.name}
                          style={({ pressed }) => [
                            styles.genreStat,
                            pressed && styles.pressed,
                          ]}
                          onPress={() => openGenre(g.name)}
                        >
                          <Text style={styles.genreStatName}>{g.name}</Text>
                          <Text style={styles.genreStatCount}>{g.count}</Text>
                          <Ionicons
                            name="chevron-forward"
                            size={12}
                            color={chrome.muted}
                          />
                        </Pressable>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.hint}>
                    No {activeLabel.toLowerCase()} logged yet.
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.hint}>
                Nothing on your shelf yet — swipe right on a title to add it.
              </Text>
            )}

            {/* ---------------- Background (dropdown) ---------------- */}
            <Text style={[styles.section, styles.sectionSpaced]}>Background</Text>
            <Text style={styles.hint}>Choose the look of your shelf.</Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setBgOpen((o) => !o)}
            >
              <View style={styles.dropdownValueRow}>
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: currentTheme.swatch[0],
                      borderColor: currentTheme.swatch[1],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.swatchLower,
                      { backgroundColor: currentTheme.swatch[1] },
                    ]}
                  />
                  {currentTheme.dot && (
                    <View
                      style={[styles.swatchDot, { backgroundColor: currentTheme.dot }]}
                    />
                  )}
                </View>
                <Text style={styles.dropdownValue}>{currentTheme.label}</Text>
              </View>
              <Ionicons
                name={bgOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textOnDarkMuted}
              />
            </Pressable>
            {bgOpen && (
              <View style={styles.themeCol}>
                {THEMES.map((t) => {
                  const active = !t.soon && t.id === theme;
                  return (
                    <Pressable
                      key={t.id}
                      disabled={t.soon}
                      onPress={() => {
                        setTheme(t.id);
                        setBgOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.themeRow,
                        active && styles.themeRowActive,
                        t.soon && styles.themeRowSoon,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.swatch,
                          { backgroundColor: t.swatch[0], borderColor: t.swatch[1] },
                        ]}
                      >
                        <View
                          style={[styles.swatchLower, { backgroundColor: t.swatch[1] }]}
                        />
                        {t.dot && (
                          <View style={[styles.swatchDot, { backgroundColor: t.dot }]} />
                        )}
                      </View>
                      <View style={styles.themeText}>
                        <View style={styles.themeLabelRow}>
                          <Text style={styles.themeLabel}>{t.label}</Text>
                          {t.soon && (
                            <View style={styles.soonBadge}>
                              <Text style={styles.soonText}>SOON</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={chrome.accent}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}

            <AccountActions />
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.65)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    backgroundColor: c.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: c.border,
    paddingHorizontal: spacing.lg,
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
    backgroundColor: c.border,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: c.accent,
    fontFamily: fonts.display,
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  content: {
    paddingBottom: spacing.md,
  },
  section: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionSpaced: {
    marginTop: spacing.xl,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  // Language dropdown.
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  dropdownValue: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  dropdownValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dropdownList: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  dropdownItemActive: {
    backgroundColor: c.surfaceRaised,
  },
  dropdownItemText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  dropdownItemTextActive: {
    color: colors.textOnDark,
  },
  // Theme cards.
  themeCol: {
    gap: spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  themeRowActive: {
    borderColor: c.accent,
    backgroundColor: c.surfaceRaised,
  },
  themeRowSoon: {
    opacity: 0.7,
  },
  swatch: {
    width: 40,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  swatchLower: {
    height: '38%',
  },
  swatchDot: {
    position: 'absolute',
    top: 5,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 2,
  },
  themeText: {
    flex: 1,
  },
  themeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeLabel: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 14,
  },
  soonBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.maroon,
  },
  soonText: {
    color: colors.paper,
    fontFamily: fonts.label,
    fontSize: 9,
    letterSpacing: 1,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
  },
  statCardActive: {
    borderColor: c.accent,
    backgroundColor: c.surfaceRaised,
  },
  statNum: {
    color: c.accent,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  statNumIdle: {
    color: c.muted,
  },
  statLabel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statSub: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  genreStatWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  genreStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceRaised,
  },
  genreStatName: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  genreStatCount: {
    color: c.accent,
    fontFamily: fonts.label,
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
