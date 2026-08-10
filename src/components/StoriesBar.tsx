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
import { Ionicons } from '@expo/vector-icons';
import { StoryGroup, StoryPost } from '@/api/posts';
import { Movie } from '@/api/types';
import { fetchMediaById } from '@/api/movies';
import { useStories, useDeletePost } from '@/hooks/useStories';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useAuth } from '@/context/AuthProvider';
import { PosterImage } from './PosterImage';
import { useMovieDetails } from './MovieDetailsProvider';
import { StaticOverlays } from './StoryOverlays';
import { POSTER_SIZE } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { Avatar } from './Avatar';

const { width: SCREEN_W } = Dimensions.get('window');

// Story poster canvas (2:3) — overlays are positioned relative to this.
const POSTER_W = SCREEN_W * 0.6;
const POSTER_H = SCREEN_W * 0.9;

// How long each story segment plays before auto-advancing to the next.
const STORY_MS = 6000;

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

  if (!groups || groups.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.bar}
      contentContainerStyle={styles.row}
    >
      {groups.map((g, i) => (
        <Pressable
          key={g.user.id}
          style={styles.item}
          onPress={() => onOpen(groups, i)}
        >
          <View style={styles.ring}>
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
    if (!item) return;
    paused.current = false;
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
        onPress: () => del.mutate(item.id, { onSuccess: onClose }),
      },
    ]);
  }, [item, pause, resume, del, onClose]);

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

  if (!group || posts.length === 0 || !item) return null;

  return (
    <View style={styles.overlay}>
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

        <View style={styles.page} pointerEvents="box-none">
          <View style={styles.header} pointerEvents="box-none">
            <Avatar uri={group.user.avatarUrl} size={30} noZoom />
            <Text style={styles.headerName}>@{group.user.username}</Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
            {isMine && (
              <Pressable onPress={confirmDelete} hitSlop={10} style={styles.trash}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.textOnDark}
                />
              </Pressable>
            )}
          </View>
          <View style={styles.info} pointerEvents="none">
            <View style={styles.posterWrap}>
              <PosterImage
                posterPath={item.posterPath}
                title={item.title ?? ''}
                size={POSTER_SIZE}
                style={styles.poster}
              />
              <StaticOverlays
                overlays={item.overlays}
                width={POSTER_W}
                height={POSTER_H}
              />
            </View>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title}
              {item.year != null ? `  ·  ${item.year}` : ''}
            </Text>
            {item.caption ? (
              <Text style={styles.caption}>{item.caption}</Text>
            ) : null}
          </View>
          <View style={styles.actions}>
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
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.textOnDark}
              />
              <Text style={styles.actionLabel}>Details</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[styles.close, { top: insets.top + 22 }]}
          onPress={onClose}
          hitSlop={10}
        >
          <Ionicons name="close" size={26} color={colors.textOnDark} />
        </Pressable>
      </View>
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
}: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  color: string;
  label: string;
  onPress: () => void;
  btnStyle: StyleProp<ViewStyle>;
  labelStyle: StyleProp<TextStyle>;
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
      <Text style={[labelStyle, active && { color }]}>{label}</Text>
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
      backgroundColor: 'rgba(255, 255, 255, 0.28)',
      overflow: 'hidden',
    },
    barFill: { height: '100%', backgroundColor: colors.textOnDark },
    barFillDone: { width: '100%' },
    page: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    info: { alignSelf: 'stretch', alignItems: 'center', gap: spacing.md },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    headerName: {
      flex: 1,
      color: colors.textOnDark,
      fontFamily: fonts.heading,
      fontSize: 15,
    },
    time: { color: c.muted, fontFamily: fonts.body, fontSize: 12 },
    trash: { marginLeft: spacing.sm },
    posterWrap: {
      width: POSTER_W,
      height: POSTER_H,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    poster: {
      width: '100%',
      height: '100%',
    },
    movieTitle: {
      color: colors.textOnDark,
      fontFamily: fonts.heading,
      fontSize: 18,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    caption: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 15,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.xl,
      marginTop: spacing.sm,
    },
    actionBtn: { alignItems: 'center', gap: 4 },
    actionLabel: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    close: {
      position: 'absolute',
      top: spacing.xxl,
      right: spacing.lg,
    },
  });
