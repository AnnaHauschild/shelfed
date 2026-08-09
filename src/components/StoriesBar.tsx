import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { StoryGroup, StoryPost } from '@/api/posts';
import { Movie } from '@/api/types';
import { useStories } from '@/hooks/useStories';
import { useInteractions } from '@/hooks/useInteractions';
import { PosterImage } from './PosterImage';
import { POSTER_SIZE } from '@/constants/config';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { Avatar } from './Avatar';

const { width: SCREEN_W } = Dimensions.get('window');

// How long each story segment plays before auto-advancing to the next.
const STORY_MS = 6000;

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

/** Horizontal row of friends' stories (last 24h); tap calls onOpen. */
export function StoriesBar({ onOpen }: { onOpen: (group: StoryGroup) => void }) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const { data: groups } = useStories();

  if (!groups || groups.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {groups.map((g) => (
        <Pressable key={g.user.id} style={styles.item} onPress={() => onOpen(g)}>
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
 * segment per post, auto-advancing; tap the right/left edge to skip forward/back.
 */
export function StoryViewer({
  group,
  onClose,
}: {
  group: StoryGroup | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeViewerStyles(chrome), [chrome]);
  const { toggleWatchlist, toggleFavorite } = useInteractions();
  // getStories returns newest-first; play a person's posts oldest-first.
  const posts = useMemo(() => (group ? [...group.posts].reverse() : []), [group]);
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);

  // Restart from the first post whenever a different person's story opens.
  useEffect(() => {
    setIndex(0);
  }, [group?.user.id]);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i < posts.length - 1) return i + 1;
      onClose();
      return i;
    });
  }, [posts.length, onClose]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : 0));
  }, []);

  // Fill the active segment over STORY_MS, then auto-advance.
  useEffect(() => {
    if (!group) return;
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: STORY_MS, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(goNext)();
      },
    );
  }, [index, group, goNext, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!group || posts.length === 0) return null;
  const item = posts[Math.min(index, posts.length - 1)];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.tapLeft} onPress={goPrev} />
      <Pressable style={styles.tapRight} onPress={goNext} />

      <View style={styles.content} pointerEvents="box-none">
        <View style={styles.bars}>
          {posts.map((p, i) => (
            <View key={p.id} style={styles.barTrack}>
              {i < index ? (
                <View style={[styles.barFill, styles.barFillDone]} />
              ) : i === index ? (
                <Animated.View style={[styles.barFill, fillStyle]} />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.page} pointerEvents="box-none">
          <View style={styles.header} pointerEvents="none">
            <Avatar uri={group.user.avatarUrl} size={30} noZoom />
            <Text style={styles.headerName}>@{group.user.username}</Text>
            <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          </View>
          <View style={styles.info} pointerEvents="none">
            <PosterImage
              posterPath={item.posterPath}
              title={item.title ?? ''}
              size={POSTER_SIZE}
              style={styles.poster}
            />
            <Text style={styles.movieTitle} numberOfLines={2}>
              {item.title}
              {item.year != null ? `  ·  ${item.year}` : ''}
            </Text>
            {item.caption ? (
              <Text style={styles.caption}>{item.caption}</Text>
            ) : null}
          </View>
          <View style={styles.actions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => toggleWatchlist(toMovie(item))}
            >
              <Ionicons name="star-outline" size={20} color={colors.star} />
              <Text style={styles.actionLabel}>Wishlist</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => toggleFavorite(toMovie(item))}
            >
              <Ionicons name="heart-outline" size={20} color={colors.favorite} />
              <Text style={styles.actionLabel}>Favorite</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.close} onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textOnDark} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
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
    poster: {
      width: SCREEN_W * 0.6,
      height: SCREEN_W * 0.9,
      borderRadius: radius.md,
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
