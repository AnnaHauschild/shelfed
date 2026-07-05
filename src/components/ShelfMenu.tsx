import { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { GenreChips } from '@/components/GenreChips';
import { useLanguage } from '@/context/LanguageProvider';
import { MOODS_LABEL, MOOD_LABEL, MOOD_TEMPLATES } from '@/constants/moods';
import { useMoodMutations, useMoods } from '@/hooks/useMoods';
import { colors, fonts, radius, spacing } from '@/theme';

const SCREEN_H = Dimensions.get('window').height;

export type ShelfMenuSection = 'sort' | 'genre' | 'moods';

interface Props {
  /** Which section to show, or null when the menu is closed. */
  section: ShelfMenuSection | null;
  onClose: () => void;
  accent: string;
  sortOptions: { key: string; label: string }[];
  sort: string;
  onSortChange: (key: string) => void;
  genres?: string[];
  genre?: string | null;
  onGenreChange?: (g: string | null) => void;
  onOpenMood?: (id: number) => void;
}

const TITLES: Record<ShelfMenuSection, string> = {
  sort: 'Sort by',
  genre: 'Categories',
  moods: MOODS_LABEL,
};

/**
 * A single-section bottom sheet for the shelf controls. Opened by the Sort /
 * Genre / Mood buttons under the media switcher — each shows just its options.
 */
export function ShelfMenu({
  section,
  onClose,
  accent,
  sortOptions,
  sort,
  onSortChange,
  genres,
  genre,
  onGenreChange,
  onOpenMood,
}: Props) {
  const { data: moods } = useMoods();
  const { createMood } = useMoodMutations();
  const { text } = useLanguage();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const translateY = useSharedValue(0);

  // Reset the create form + drag offset whenever the sheet closes/opens.
  useEffect(() => {
    if (section == null) {
      setCreating(false);
      setName('');
    } else {
      translateY.value = 0;
    }
  }, [section]);

  const close = () => {
    setCreating(false);
    setName('');
    onClose();
  };

  // Drag-to-dismiss, same as the Discover filter sheet.
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const dragGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        translateY.value = withTiming(SCREEN_H, { duration: 220 }, (done) => {
          if (done) runOnJS(close)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = await createMood(trimmed);
    setCreating(false);
    setName('');
    onOpenMood?.(id);
  };

  const genreOptions = (genres ?? []).map((g) => ({ id: g, name: g }));

  return (
    <Modal
      visible={section != null}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <GestureHandlerRootView style={styles.avoider}>
        <KeyboardAvoidingView
          style={styles.avoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={close} />
          <Animated.View style={[styles.sheet, sheetStyle]}>
            <GestureDetector gesture={dragGesture}>
              <View style={styles.grabZone}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            {section === 'moods' && creating ? (
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.headerRow}>
                <Pressable onPress={() => setCreating(false)} hitSlop={8}>
                  <Ionicons
                    name="chevron-back"
                    size={22}
                    color={colors.textOnDark}
                  />
                </Pressable>
                <Text style={styles.title}>New {MOOD_LABEL.toLowerCase()}</Text>
              </View>

              <Text style={styles.label}>Start from an example</Text>
              <View style={styles.chipWrap}>
                {MOOD_TEMPLATES.map((t) => (
                  <OptionChip
                    key={t}
                    label={t}
                    active={name === t}
                    accent={accent}
                    onPress={() => setName(t)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. 🛋️ Comfort"
                placeholderTextColor={colors.textOnDarkMuted}
                maxLength={40}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={create}
              />
              <Text style={styles.hint}>
                Tip: add an emoji from your keyboard to give it a face.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.createButton,
                  !name.trim() && styles.createButtonDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={create}
                disabled={!name.trim()}
              >
                <Ionicons name="add-circle" size={18} color={colors.background} />
                <Text style={styles.createButtonText}>Create &amp; open</Text>
              </Pressable>
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
            >
              <Text style={styles.title}>{section ? TITLES[section] : ''}</Text>

              {section === 'sort' && (
                <View style={styles.chipWrap}>
                  {sortOptions.map((opt) => (
                    <OptionChip
                      key={opt.key}
                      label={opt.label}
                      active={sort === opt.key}
                      accent={accent}
                      onPress={() => {
                        onSortChange(opt.key);
                        close();
                      }}
                    />
                  ))}
                </View>
              )}

              {section === 'genre' &&
                (genreOptions.length > 0 && onGenreChange ? (
                  <GenreChips
                    options={genreOptions}
                    selected={genre ?? null}
                    onSelect={(g) => {
                      onGenreChange(g);
                      close();
                    }}
                    accent={accent}
                    wrap
                  />
                ) : (
                  <Text style={styles.empty}>
                    No categories yet — add titles to this shelf first.
                  </Text>
                ))}

              {section === 'moods' && (
                <>
                  <Text style={styles.moodDesc}>{text.moodsDescription}</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.newButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setCreating(true)}
                  >
                    <Ionicons name="add" size={18} color={colors.background} />
                    <Text style={styles.newButtonText}>
                      New {MOOD_LABEL.toLowerCase()}
                    </Text>
                  </Pressable>

                  {moods && moods.length > 0 ? (
                    <View style={styles.moodList}>
                      {moods.map((m) => (
                        <Pressable
                          key={m.id}
                          style={({ pressed }) => [
                            styles.moodRow,
                            pressed && styles.pressed,
                          ]}
                          onPress={() => onOpenMood?.(m.id)}
                        >
                          <View style={styles.moodInfo}>
                            <Text style={styles.moodName} numberOfLines={1}>
                              {m.name}
                            </Text>
                            <Text style={styles.moodCount}>
                              {m.count} {m.count === 1 ? 'title' : 'titles'}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors.textOnDarkMuted}
                          />
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.empty}>
                      No {MOODS_LABEL.toLowerCase()} yet. Create your first one
                      above.
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          )}
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

function OptionChip({
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
      <Text style={[styles.chipText, active && { color: accent }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avoider: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    maxHeight: '86%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  grabZone: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  label: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 2,
  },
  chipWrap: {
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
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.amberBright,
  },
  newButtonText: {
    color: colors.background,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodList: {
    gap: spacing.sm,
  },
  moodDesc: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -spacing.xs,
  },
  moodRow: {
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
  moodInfo: {
    flex: 1,
  },
  moodName: {
    color: colors.textOnDark,
    fontFamily: fonts.heading,
    fontSize: 16,
  },
  moodCount: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1,
  },
  empty: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    paddingVertical: spacing.sm,
  },
  input: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.amberBright,
  },
  createButtonDisabled: {
    opacity: 0.4,
  },
  createButtonText: {
    color: colors.background,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
