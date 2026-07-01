import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MediaType } from '@/api/types';
import { useMediaTypeControls } from '@/context/MediaTypeProvider';
import { useProfile } from '@/context/ProfileProvider';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';
import { AboutModal } from './AboutModal';
import { ShelfBackground } from './ShelfBackground';

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
    accent: colors.maroon,
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
    accent: colors.amber,
  },
];

/**
 * Full-screen launch picker. The user chooses which shelf to browse on every
 * open; once picked, the in-app switcher lets them change category.
 */
export function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { choose } = useMediaTypeControls();
  const { name } = useProfile();
  const [editing, setEditing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}>
      <ShelfBackground />
      <Text style={styles.brand}>Shelfed</Text>
      <Text style={styles.tagline}>Pick a shelf to browse</Text>

      <Pressable style={styles.profilePill} onPress={() => setEditing(true)} hitSlop={8}>
        <Ionicons name="person-circle-outline" size={18} color={colors.textOnPaper} />
        <Text style={styles.profileText}>
          {name ? `Hi, ${name}` : 'Tap to set your name'}
        </Text>
        <Ionicons name="pencil" size={12} color={colors.textOnPaperMuted} />
      </Pressable>

      <View style={styles.cards}>
        {CATEGORIES.map((c) => (
          <CategoryCard key={c.label} category={c} onPick={choose} />
        ))}
      </View>

      <NameModal visible={editing} onClose={() => setEditing(false)} />
      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />

      <Pressable
        style={[styles.aboutLink, { bottom: insets.bottom + spacing.md }]}
        onPress={() => setShowAbout(true)}
        hitSlop={10}
      >
        <Text style={styles.aboutText}>About · Credits</Text>
      </Pressable>
    </View>
  );
}

function CategoryCard({
  category,
  onPick,
}: {
  category: Category;
  onPick: (type: MediaType) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={category.disabled}
        onPressIn={() => animate(0.96)}
        onPressOut={() => animate(1)}
        onPress={() => category.type && onPick(category.type)}
        style={[styles.card, category.disabled && styles.cardDisabled]}
      >
        <View style={[styles.iconWrap, { borderColor: category.accent }]}>
          <Ionicons name={category.icon} size={28} color={category.accent} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardLabel}>{category.label}</Text>
          <Text style={styles.cardBlurb}>{category.blurb}</Text>
        </View>
        {!category.disabled && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textOnPaperMuted}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

function NameModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { name, setName } = useProfile();
  const [draft, setDraft] = useState(name ?? '');

  const save = async () => {
    await setName(draft);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose} />
      <View style={styles.modalCard}>
        <Text style={styles.modalTitle}>Your name</Text>
        <Text style={styles.modalHint}>
          Shown when you share a title with friends.
        </Text>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="e.g. Adam"
          placeholderTextColor={colors.textOnDarkMuted}
          autoFocus
          autoCapitalize="words"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={save}
        />
        <View style={styles.modalActions}>
          <Pressable style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={save}>
            <Text style={[styles.modalBtnText, styles.modalBtnTextPrimary]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
    color: colors.amberBright,
    fontFamily: fonts.display,
    fontSize: 40,
    textTransform: 'uppercase',
    letterSpacing: 3,
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
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.paperShade,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: colors.paperShade,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    color: colors.textOnPaper,
    fontFamily: fonts.display,
    fontSize: 22,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBlurb: {
    color: colors.textOnPaper,
    fontFamily: fonts.body,
    fontSize: 14,
    opacity: 0.75,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.paperShade,
    backgroundColor: colors.paper,
    marginBottom: spacing.lg,
  },
  profileText: {
    color: colors.textOnPaper,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  modalCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: '30%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.textOnDark,
    fontFamily: fonts.display,
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalHint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  input: {
    marginTop: spacing.xs,
    color: colors.textOnDark,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnPrimary: {
    backgroundColor: colors.amberBright,
    borderColor: colors.amberBright,
  },
  modalBtnText: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBtnTextPrimary: {
    color: colors.background,
  },
  aboutLink: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  aboutText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
