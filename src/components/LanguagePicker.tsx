import { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGES } from '@/constants/languages';
import { useLanguage } from '@/context/LanguageProvider';
import { colors, fonts, radius, spacing } from '@/theme';

/**
 * Compact language pill (globe + flag/code) that opens a small picker. Changing
 * the language re-fetches titles + descriptions in that language.
 */
export function LanguagePicker({ style }: { style?: StyleProp<ViewStyle> }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <>
      <Pressable
        style={[styles.pill, style]}
        onPress={() => setOpen(true)}
        hitSlop={8}
      >
        <Ionicons name="globe-outline" size={15} color={colors.textOnPaper} />
        <Text style={styles.pillText}>
          {current.flag} {current.code.toUpperCase()}
        </Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Language</Text>
          <Text style={styles.hint}>
            Titles &amp; descriptions in your language.
          </Text>
          {LANGUAGES.map((l) => {
            const active = l.code === language;
            return (
              <Pressable
                key={l.code}
                style={({ pressed }) => [
                  styles.row,
                  active && styles.rowActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  setLanguage(l.code);
                  setOpen(false);
                }}
              >
                <Text style={styles.flag}>{l.flag}</Text>
                <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                  {l.label}
                </Text>
                {active && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.amberBright}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.paperShade,
    backgroundColor: colors.paper,
  },
  pillText: {
    color: colors.textOnPaper,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    top: '28%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  title: {
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowActive: {
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    opacity: 0.7,
  },
  flag: {
    fontSize: 20,
  },
  rowLabel: {
    flex: 1,
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 15,
  },
  rowLabelActive: {
    color: colors.amberBright,
  },
});
