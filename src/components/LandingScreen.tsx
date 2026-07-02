import { useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const headerHeight = insets.top + 200;

  return (
    <View style={styles.root}>
      <ShelfBackground />

      {/* Feature-graphic-style header: warm wood band with title + books on a plank. */}
      <FeatureHeader height={headerHeight} topInset={insets.top} />

      <View style={[styles.content, { paddingTop: headerHeight + spacing.lg }]}>
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

// Warm dark-wood header band matching the store feature graphic: title on the
// left, a row of standing book spines on the right, and a shelf plank as the
// bottom edge.
function FeatureHeader({ height, topInset }: { height: number; topInset: number }) {
  return (
    <View
      style={[styles.featureHeader, { height }]}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['#3e2410', '#28180b', '#1a0e05']}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.featureRow, { paddingTop: topInset + spacing.md }]}>
        <View style={styles.featureText}>
          <Text style={styles.brand}>Shelfed</Text>
          <Text style={styles.tagline}>Your lifelong collection.</Text>
        </View>
        {/* Small potted plant sitting between the title and the book row. */}
        <View style={styles.plantWrap}>
          <View style={styles.plantLeaf1} />
          <View style={styles.plantLeaf2} />
          <View style={styles.plantLeaf3} />
          <View style={styles.plantPot} />
        </View>
        <View style={styles.featureBooks}>
          {FEATURE_SPINES.map((s, i) => (
            <View
              key={i}
              style={{
                width: s.w,
                height: s.h,
                backgroundColor: s.color,
                marginLeft: 2,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View style={styles.spineHighlight} />
              {s.band ? <View style={styles.spineBand} /> : null}
              <LinearGradient
                colors={['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.28)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Hanging lamp above the title — casts a warm glow onto "Shelfed". */}
      <View style={[styles.hangingLamp, { top: topInset - 4 }]}>
        <View style={styles.hangingCord} />
        <View style={styles.hangingShade} />
        <View style={styles.hangingGlow} />
      </View>

      {/* Shelf plank as the bottom edge of the header. */}
      <View style={styles.featurePlank} />
    </View>
  );
}

// Static, curated row of book spines matching the store feature graphic.
const FEATURE_SPINES = [
  { color: '#a7563d', w: 20, h: 128, band: true },
  { color: '#5e7a3c', w: 24, h: 148, band: true },
  { color: '#7a3527', w: 18, h: 110, band: false },
  { color: '#3f6079', w: 22, h: 138, band: true },
  { color: '#d8a548', w: 20, h: 120, band: false },
  { color: '#8a5a2b', w: 24, h: 158, band: true },
  { color: '#574a78', w: 18, h: 128, band: false },
  { color: '#2c4a3a', w: 22, h: 140, band: true },
  { color: '#b89b73', w: 20, h: 118, band: false },
];

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
    zIndex: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  featureHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  featureRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    paddingLeft: 14,
  },
  featureBooks: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  spineHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 240, 200, 0.4)',
  },
  spineBand: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: '20%',
    height: 2,
    backgroundColor: '#d8a548',
    opacity: 0.9,
  },
  featurePlank: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 10,
    backgroundColor: '#3e2410',
    borderTopWidth: 2,
    borderTopColor: '#7a4a22',
    borderBottomWidth: 1,
    borderBottomColor: '#1a0e05',
  },
  // Hanging lamp above the Shelfed title.
  hangingLamp: {
    position: 'absolute',
    left: 96,
    alignItems: 'center',
  },
  hangingCord: {
    width: 2,
    height: 20,
    backgroundColor: '#2a1808',
  },
  hangingShade: {
    width: 64,
    height: 32,
    backgroundColor: '#f0d28c',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  hangingGlow: {
    position: 'absolute',
    top: 26,
    width: 160,
    height: 110,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 210, 130, 0.24)',
  },
  // Potted trailing plant sitting between title and books.
  plantWrap: {
    width: 44,
    height: 130,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plantPot: {
    width: 34,
    height: 20,
    backgroundColor: '#7a4a22',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  plantLeaf1: {
    position: 'absolute',
    left: 3,
    bottom: 12,
    width: 17,
    height: 32,
    borderRadius: 17,
    backgroundColor: '#4f6b35',
    transform: [{ rotate: '-32deg' }],
  },
  plantLeaf2: {
    position: 'absolute',
    right: 3,
    bottom: 14,
    width: 17,
    height: 38,
    borderRadius: 17,
    backgroundColor: '#7a9658',
    transform: [{ rotate: '28deg' }],
  },
  plantLeaf3: {
    position: 'absolute',
    left: 14,
    bottom: 20,
    width: 16,
    height: 30,
    borderRadius: 16,
    backgroundColor: '#4f6b35',
    transform: [{ rotate: '5deg' }],
  },
  brand: {
    color: colors.paper,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontWeight: 'bold',
    fontSize: 46,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  tagline: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: spacing.xs,
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
