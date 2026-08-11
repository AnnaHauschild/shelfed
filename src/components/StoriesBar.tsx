import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { CaptionMeta, Sticker, StoryGroup, StoryPost } from '@/api/posts';
import { Movie } from '@/api/types';
import { fetchMediaById } from '@/api/movies';
import { useStories, useDeletePost } from '@/hooks/useStories';
import { useSeenStories, useMarkStorySeen } from '@/hooks/useSeenStories';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useAuth } from '@/context/AuthProvider';
import { POSTER_SIZE } from '@/constants/config';
import { useMovieDetails } from './MovieDetailsProvider';
import { PosterImage } from './PosterImage';
import {
  POSTER_RATIO,
  StaticOverlays,
  captionText,
  captionTextStyle,
  storyPalette,
} from './StoryOverlays';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { Avatar } from './Avatar';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// How long each story segment plays before auto-advancing to the next.
const STORY_MS = 6000;

// Dark ink for chrome sitting on the light (film-tinted) background.
const INK = '#2a2018';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

/** A post's minimal Movie, enough to add it to your own shelves. */
function toMovie(p: StoryPost): Movie {
  return {
    id: p.movieId,
    title: p.title ?? '',
    year: p.year,
    genreIds: [],
    genres: [],
    posterPath: p.posterPath,
    backdropPath: null,
    overview: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    mediaType: p.mediaType,
  };
}

/** Horizontal row of friends' stories (last 24h); tap opens the viewer. */
export function StoriesBar({
  onOpen,
}: {
  onOpen: (groups: StoryGroup[], index: number) => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: groups } = useStories();
  const { data: seen } = useSeenStories();

  // Unseen stories first (coloured rings on the left), else keep server order.
  const ordered = useMemo(() => {
    const items = (groups ?? []).map((g, i) => ({
      group: g,
      i,
      unseen: g.posts.some((p) => !(seen?.has(p.id) ?? false)),
    }));
    return items.sort((a, b) =>
      a.unseen === b.unseen ? a.i - b.i : a.unseen ? -1 : 1,
    );
  }, [groups, seen]);

  if (ordered.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.row}
    >
      {ordered.map(({ group: g, unseen }, i) => (
        <Pressable
          key={g.user.id}
          style={styles.item}
          onPress={() => onOpen(ordered.map((x) => x.group), i)}
        >
          <View style={[styles.ring, !unseen && styles.ringSeen]}>
            <Avatar uri={g.user.avatarUrl} size={54} noZoom />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            @{g.user.username}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/**
 * Full-screen story viewer, rendered as an in-tree overlay (NOT a nested Modal,
 * which would stack behind the Friends sheet). Instagram-style: one progress
 * segment per post, auto-advancing; tap right/left to skip, hold to pause, and
 * it rolls on to the next friend's story after the last post. Your own posts
 * can be deleted.
 */
export function StoryViewer({
  story,
  onClose,
}: {
  story: { groups: StoryGroup[]; index: number } | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeViewerStyles(chrome), [chrome]);
  const insets = useSafeAreaInsets();
  const { toggleWatchlist, toggleFavorite } = useInteractions();
  const states = useInteractionStates();
  const { userId } = useAuth();
  const details = useMovieDetails();
  const del = useDeletePost();
  const markSeen = useMarkStorySeen();
  const [gi, setGi] = useState(0);
  const [pi, setPi] = useState(0);
  const progress = useSharedValue(0);
  const paused = useRef(false);

  // Jump to the tapped friend whenever a new viewing session starts.
  useEffect(() => {
    if (story) {
      setGi(story.index);
      setPi(0);
    }
  }, [story]);

  const groups = story?.groups ?? [];
  const group = groups[gi] ?? null;
  // getStories returns newest-first; play each person's posts oldest-first.
  const posts = useMemo(() => (group ? [...group.posts].reverse() : []), [group]);
  const item = posts.length ? posts[Math.min(pi, posts.length - 1)] : null;
  const isMine = !!group && group.user.id === userId;

  const goNext = useCallback(() => {
    if (pi < posts.length - 1) setPi(pi + 1);
    else if (gi < groups.length - 1) {
      setGi(gi + 1);
      setPi(0);
    } else onClose();
  }, [pi, posts.length, gi, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (pi > 0) setPi(pi - 1);
    else if (gi > 0) {
      setGi(gi - 1);
      setPi(0);
    }
  }, [pi, gi]);

  // Fill the active segment, then auto-advance.
  useEffect(() => {
    if (!item) return;    markSeen(item.id);    paused.current = false;
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: STORY_MS, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(goNext)();
      },
    );
  }, [gi, pi, item, goNext, progress]);

  const pause = useCallback(() => {
    paused.current = true;
    cancelAnimation(progress);
  }, [progress]);

  const resume = useCallback(() => {
    if (!paused.current) return;
    paused.current = false;
    const remaining = Math.max(250, (1 - progress.value) * STORY_MS);
    progress.value = withTiming(
      1,
      { duration: remaining, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(goNext)();
      },
    );
  }, [progress, goNext]);

  const confirmDelete = useCallback(() => {
    if (!item) return;
    pause();
    Alert.alert('Delete this story?', 'It will be removed for everyone.', [
      { text: 'Cancel', style: 'cancel', onPress: resume },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => del.mutate(item.id, { onSuccess: goNext }),
      },
    ]);
  }, [item, pause, resume, del, goNext]);

  // Open the full details card ON TOP of the story (paused), so closing it
  // returns to the story rather than the home page.
  const openInfo = useCallback(async () => {
    if (!item) return;
    pause();
    const base = toMovie(item);
    try {
      const full = await fetchMediaById(item.mediaType, item.movieId);
      details.open(full ?? base);
    } catch {
      details.open(base);
    }
  }, [item, pause, details]);

  // Resume the segment once the details card is dismissed.
  const detailsWasOpen = useRef(false);
  useEffect(() => {
    if (details.isOpen) detailsWasOpen.current = true;
    else if (detailsWasOpen.current) {
      detailsWasOpen.current = false;
      resume();
    }
  }, [details.isOpen, resume]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Swipe left = next story, right = previous, down = close (tap zones remain).
  const swipe = useMemo(
    () =>
      Gesture.Race(
        Gesture.Fling()
          .direction(Directions.LEFT)
          .onEnd(() => runOnJS(goNext)()),
        Gesture.Fling()
          .direction(Directions.RIGHT)
          .onEnd(() => runOnJS(goPrev)()),
        Gesture.Fling()
          .direction(Directions.DOWN)
          .onEnd(() => runOnJS(onClose)()),
      ),
    [goNext, goPrev, onClose],
  );

  if (!group || posts.length === 0 || !item) return null;

  const palette = storyPalette(item.title ?? item.movieId);
  const stickers = item.overlays.filter(
    (o): o is Sticker => o.kind === 'text' || o.kind === 'emoji',
  );
  const captionMeta = item.overlays.find((o) => o.kind === 'caption') as
    | CaptionMeta
    | undefined;
  const captionStyle = captionMeta?.style ?? 'normal';
  const caption = item.caption?.trim() ?? '';
  const hasCaption = caption.length > 0;
  // Poster fills the whole space when there's no comment beneath it.
  const posterW = Math.min(
    SCREEN_W - spacing.lg * 2,
    (SCREEN_H * (hasCaption ? 0.5 : 0.62)) / POSTER_RATIO,
  );
  const posterH = posterW * POSTER_RATIO;

  return (
    <View style={[styles.overlay, { backgroundColor: palette.bg }]}>
      <GestureDetector gesture={swipe}>
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={styles.tapLeft}
            onPress={goPrev}
            onLongPress={pause}
            onPressOut={resume}
            delayLongPress={220}
          />
          <Pressable
            style={styles.tapRight}
            onPress={goNext}
            onLongPress={pause}
            onPressOut={resume}
            delayLongPress={220}
          />

      <View style={styles.content} pointerEvents="box-none">
        <View style={[styles.bars, { top: insets.top + 8 }]}>
          {posts.map((p, i) => (
            <View key={p.id} style={styles.barTrack}>
              {i < pi ? (
                <View style={[styles.barFill, styles.barFillDone]} />
              ) : i === pi ? (
                <Animated.View style={[styles.barFill, fillStyle]} />
              ) : null}
            </View>
          ))}
        </View>

        <View
          style={[styles.page, { paddingTop: insets.top + 26 }]}
          pointerEvents="box-none"
        >
          <View style={styles.header} pointerEvents="box-none">
            <Avatar uri={group.user.avatarUrl} size={30} noZoom />
            <Text style={styles.headerName}>@{group.user.username}</Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            {isMine && (
              <Pressable onPress={confirmDelete} hitSlop={10} style={styles.trash}>
                <Ionicons name="trash-outline" size={20} color={INK} />
              </Pressable>
            )}
            <Pressable onPress={onClose} hitSlop={10} style={styles.headerClose}>
              <Ionicons name="close" size={24} color={INK} />
            </Pressable>
          </View>

          <View
            style={[styles.posterWrap, { width: posterW, height: posterH }]}
            pointerEvents="none"
          >
            <PosterImage
              posterPath={item.posterPath}
              title={item.title ?? ''}
              size={POSTER_SIZE}
              style={styles.poster}
            />
            <StaticOverlays overlays={stickers} width={posterW} height={posterH} />
          </View>

          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
            {item.year != null ? `  ·  ${item.year}` : ''}
          </Text>

          <View style={styles.actions} pointerEvents="box-none">
            <StoryAction
              icon="star-outline"
              activeIcon="star"
              active={states.isWatchlisted(item.movieId)}
              color={colors.star}
              label="Wishlist"
              onPress={() => toggleWatchlist(toMovie(item))}
              btnStyle={styles.actionBtn}
              labelStyle={styles.actionLabel}
            />
            <StoryAction
              icon="heart-outline"
              activeIcon="heart"
              active={states.isFavorite(item.movieId)}
              color={colors.favorite}
              label="Favorite"
              onPress={() => toggleFavorite(toMovie(item))}
              btnStyle={styles.actionBtn}
              labelStyle={styles.actionLabel}
            />
            <Pressable style={styles.actionBtn} onPress={openInfo}>
              <Ionicons name="information-circle-outline" size={20} color={INK} />
              <Text style={styles.actionLabel}>Details</Text>
            </Pressable>
          </View>

          {hasCaption && (
            <Text
              style={[styles.caption, captionTextStyle(captionStyle, INK, 17)]}
              numberOfLines={6}
            >
              {captionText(captionStyle, caption)}
            </Text>
          )}
        </View>
      </View>
        </View>
      </GestureDetector>
    </View>
  );
}

/** A story quick-action (Wishlist/Favorite) that fills in and pops on tap. */
function StoryAction({
  icon,
  activeIcon,
  active,
  color,
  label,
  onPress,
  btnStyle,
  labelStyle,
  compact,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  color: string;
  label: string;
  onPress: () => void;
  btnStyle: StyleProp<ViewStyle>;
  labelStyle: StyleProp<TextStyle>;
  /** Icon-only (no label) when the card is too small to fit the text. */
  compact?: boolean;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const handle = () => {
    scale.value = withSequence(
      withTiming(1.18, { duration: 100 }),
      withSpring(1, { damping: 14, stiffness: 200 }),
    );
    onPress();
  };
  return (
    <AnimatedPressable style={[btnStyle, aStyle]} onPress={handle} hitSlop={6}>
      <Ionicons name={active ? activeIcon : icon} size={20} color={color} />
      {!compact && (
        <Text style={[labelStyle, active && { color }]}>{label}</Text>
      )}
    </AnimatedPressable>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    // Wrap to content height; without this a horizontal ScrollView stretches
    // to fill a flex column and pushes siblings down.
    bar: { flexGrow: 0 },
    row: {
      gap: spacing.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    item: { width: 64, alignItems: 'center', gap: 4 },
    ring: {
      padding: 2,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: c.accent,
    },
    // Already-viewed stories fade the ring to a muted grey.
    ringSeen: { borderColor: c.muted },
    name: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 11,
      maxWidth: 64,
    },
  });

const makeViewerStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(6, 4, 2, 0.98)',
      zIndex: 100,
      elevation: 100,
    },
    tapLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '30%',
      zIndex: 1,
    },
    tapRight: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: '70%',
      zIndex: 1,
    },
    content: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
    bars: {
      position: 'absolute',
      top: spacing.lg,
      left: spacing.md,
      right: spacing.md,
      flexDirection: 'row',
      gap: 4,
      height: 3,
    },
    barTrack: {
      flex: 1,
      height: 3,
      borderRadius: 2,
      backgroundColor: 'rgba(0, 0, 0, 0.18)',
      overflow: 'hidden',
    },
    barFill: { height: '100%', backgroundColor: INK },
    barFillDone: { width: '100%' },
    page: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    headerName: {
      flex: 1,
      color: INK,
      fontFamily: fonts.heading,
      fontSize: 15,
    },
    time: { color: 'rgba(43,29,13,0.6)', fontFamily: fonts.body, fontSize: 12 },
    trash: { marginLeft: spacing.sm },
    headerClose: { marginLeft: spacing.xs },
    posterWrap: {
      position: 'relative',
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: '#000',
      marginTop: spacing.md,
    },
    poster: { width: '100%', height: '100%' },
    movieTitle: {
      color: INK,
      fontFamily: fonts.display,
      fontSize: 20,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xl,
      marginTop: spacing.sm,
    },
    actionBtn: { alignItems: 'center', gap: 4 },
    actionLabel: {
      color: INK,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    caption: {
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
      textAlign: 'center',
    },
  });
