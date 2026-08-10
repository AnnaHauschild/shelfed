import { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MediaType } from '@/api/types';
import { useMediaTypeControls } from '@/context/MediaTypeProvider';
import { useProfile } from '@/context/ProfileProvider';
import { useAuth } from '@/context/AuthProvider';
import { useFollows } from '@/hooks/useFollows';
import { useSettings } from '@/context/SettingsProvider';
import { absoluteFill, colors, fonts, radius, spacing } from '@/theme';
import { AboutModal } from './AboutModal';
import { ShelfBackground } from './ShelfBackground';
import { FeatureHeader } from './FeatureHeader';
import { FriendsSheet } from './FriendsSheet';
import { StoriesBar, StoryViewer } from './StoriesBar';
import { StoryGroup } from '@/api/posts';

interface Category {
  type: MediaType | null;
  label: string;
  blurb: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  disabled?: boolean;
}

// TRIAL: where the Stories row sits on the home screen — 'top' (above the
// category cards) or 'bottom' (below Games). Flip to compare the two.
const STORIES_POSITION: 'top' | 'bottom' = 'top';

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
  {
    type: 'game',
    label: 'Games',
    blurb: 'Log the games you have played',
    icon: 'game-controller',
    accent: colors.rust,
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
  const { enabled, session, profile } = useAuth();
  const { requests } = useFollows();
  const { open: openSettings } = useSettings();
  const signedIn = enabled && !!session;
  const [showFriends, setShowFriends] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [story, setStory] = useState<{ groups: StoryGroup[]; index: number } | null>(
    null,
  );

  // Header = exactly one shelf row (measured screen / 5), matching Discover/Search,
  // so 4 equal cubbies always show below it on any device (no per-format tuning).
  const [screenH, setScreenH] = useState(0);
  const shelfRow = screenH > 0 ? (screenH - 12) / 5 : 0;
  const headerHeight = screenH > 0 ? Math.round(6 + shelfRow) : insets.top + 150;

  return (
    <View style={styles.root} onLayout={(e) => setScreenH(e.nativeEvent.layout.height)}>
      <ShelfBackground />

      {/* Feature-graphic-style header: warm wood band with title + books on a plank. */}
      <FeatureHeader
        height={headerHeight}
        topInset={insets.top}
        tagline="Your lifelong collection."
        scale={0.55}
      />

      <View style={[styles.content, { paddingTop: headerHeight + spacing.lg }]}>
        <View style={styles.topRow}>
          <Pressable style={styles.profilePill} onPress={() => openSettings()} hitSlop={8}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.pillAvatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={18} color={colors.textOnPaper} />
            )}
            <Text style={styles.profileText}>
              {name ? `Hi, ${name}` : 'Tap to set your name'}
            </Text>
            <Ionicons name="pencil" size={12} color={colors.textOnPaperMuted} />
          </Pressable>
          {signedIn && (
            <Pressable style={styles.friendsBtn} onPress={() => setShowFriends(true)} hitSlop={8}>
              <Ionicons name="people" size={18} color={colors.textOnPaper} />
              <Text style={styles.friendsText}>Friends</Text>
              {requests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{requests.length}</Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {STORIES_POSITION === 'top' && signedIn && (
          <StoriesBar onOpen={(groups, index) => setStory({ groups, index })} />
        )}

        <View style={styles.cards}>
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.label} category={c} onPick={choose} />
          ))}
        </View>

        {STORIES_POSITION === 'bottom' && signedIn && (
          <StoriesBar onOpen={(groups, index) => setStory({ groups, index })} />
        )}
      </View>

      <FriendsSheet visible={showFriends} onClose={() => setShowFriends(false)} />
      <StoryViewer story={story} onClose={() => setStory(null)} />
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
    fontSize: 38,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  tagline: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: spacing.xs,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(244, 228, 193, 0.82)',
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
  },
  profileText: {
    color: colors.textOnPaper,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  friendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.paperShade,
    backgroundColor: colors.paper,
  },
  friendsText: {
    color: colors.textOnPaper,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.favorite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.textOnDark,
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '700',
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
