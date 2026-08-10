import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { posterUrl } from '@/api/tmdb';
import { MediaType, Movie } from '@/api/types';
import { fetchTitle, prefetchPoster, prefetchTitle, prefetchTitleExtras } from '@/api/prefetch';
import { ShelfItem } from '@/api/shelfSync';
import { UserSummary } from '@/api/follows';
import { useUserShelf } from '@/hooks/useUserShelf';
import { useInteractions } from '@/hooks/useInteractions';
import { interactionRepository } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { useAuth } from '@/context/AuthProvider';
import { Avatar } from './Avatar';
import { MovieDetails } from './MovieDetails';
import { PostComposer } from './PostComposer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const COLS = 3;
// Fit exactly COLS posters across the sheet's content width (full-bleed rows).
const POSTER_W = Math.floor(
  (SCREEN_W - spacing.lg * 2 - spacing.sm * (COLS - 1)) / COLS,
);

const SHELF_TYPES: { type: ShelfItem['type']; label: string }[] = [
  { type: 'watched', label: 'Watched' },
  { type: 'favorite', label: 'Liked' },
  { type: 'watchlist', label: 'Wishlist' },
];

const MEDIA_TYPES: { key: MediaType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'movie', label: 'Movies' },
  { key: 'tv', label: 'Series' },
  { key: 'book', label: 'Books' },
  { key: 'game', label: 'Games' },
];

/** A shelf item carries only minimal metadata; the rest is filled on open. */
function toMovie(it: ShelfItem): Movie {
  return {
    id: it.movieId,
    title: it.title,
    year: it.year,
    genreIds: [],
    genres: [],
    posterPath: it.posterPath,
    backdropPath: null,
    overview: '',
    voteAverage: 0,
    voteCount: 0,
    popularity: 0,
    mediaType: it.mediaType,
  };
}

/** Read-only view of a followed user's shelves, with an inline detail view. */
export function UserShelfSheet({
  user,
  onClose,
}: {
  user: UserSummary | null;
  onClose: () => void;
}) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeStyles(chrome), [chrome]);
  const qc = useQueryClient();
  const { enabled, session: authSession } = useAuth();
  const signedIn = enabled && !!authSession;
  const [composerMovie, setComposerMovie] = useState<Movie | null>(null);
  const { data: items, isLoading } = useUserShelf(user?.id ?? null);
  const [shelfType, setShelfType] = useState<ShelfItem['type']>('watched');
  const [media, setMedia] = useState<MediaType | 'all'>('all');
  const [query, setQuery] = useState('');
  const [matchesOnly, setMatchesOnly] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<Movie | null>(null);

  // My own shelf rows, to flag titles we both have on the same list ("matches").
  const { data: mine } = useQuery({
    queryKey: ['my-sync-items'],
    queryFn: () => interactionRepository.getSyncItems(),
    staleTime: 1000 * 30,
  });
  const mineKeys = useMemo(
    () => new Set((mine ?? []).map((m) => `${m.type}:${m.mediaType}:${m.movieId}`)),
    [mine],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (i) =>
        i.type === shelfType &&
        (media === 'all' || i.mediaType === media) &&
        (q === '' || i.title.toLowerCase().includes(q)) &&
        (!matchesOnly ||
          mineKeys.has(`${i.type}:${i.mediaType}:${i.movieId}`)),
    );
  }, [items, shelfType, media, query, matchesOnly, mineKeys]);

  const tY = useSharedValue(0);
  const tX = useSharedValue(0);
  // Drag-to-close for the whole friend-shelf sheet (from its top header).
  const sheetY = useSharedValue(0);
  useEffect(() => {
    if (user) sheetY.value = 0;
  }, [user, sheetY]);

  // Set the shown item to `i` WITHOUT touching the drag offsets. Uses cached
  // full metadata when present (so no minimal-poster flash), else fills it in.
  const swapTo = useCallback(
    (i: number) => {
      const it = shown[i];
      if (!it) return;
      setIndex(i);
      const cached = qc.getQueryData<Movie | null>([
        'media',
        it.mediaType,
        it.movieId,
      ]);
      setDetail(cached ?? toMovie(it));
      if (!cached) {
        fetchTitle(qc, it.movieId, it.mediaType)
          .then((full) => {
            if (full) {
              setDetail((cur) => (cur && cur.id === it.movieId ? full : cur));
            }
          })
          .catch(() => {});
      }
      // Warm this title's extras + both neighbours so swiping feels instant.
      prefetchTitleExtras(qc, it.movieId, it.mediaType);
      for (const n of [shown[i - 1], shown[i + 1]]) {
        if (n) {
          prefetchTitle(qc, n.movieId, n.mediaType);
          prefetchTitleExtras(qc, n.movieId, n.mediaType);
          prefetchPoster(n.posterPath);
        }
      }
    },
    [shown, qc],
  );

  // Open item `i` from the grid: recentre the offsets, then show it.
  const showAt = useCallback(
    (i: number) => {
      tY.value = 0;
      tX.value = 0;
      swapTo(i);
    },
    [swapTo, tX, tY],
  );
  const closeDetail = () => {
    // Leave tY/tX where the dismiss animation left them (off-screen); resetting
    // here would snap the panel back to the top for one frame before it
    // unmounts (a visible flicker). showAt() recentres them on the next open.
    setIndex(null);
    setDetail(null);
  };

  // After a page commit, slide the NEW title in from the incoming edge. Runs
  // after render (layout effect) so the previous title never slides back in
  // before the new one loads.
  const pendingDir = useRef<0 | 1 | -1>(0);
  const commitPage = useCallback(
    (newIndex: number, dir: 1 | -1) => {
      pendingDir.current = dir;
      swapTo(newIndex);
    },
    [swapTo],
  );
  useLayoutEffect(() => {
    if (pendingDir.current !== 0) {
      tX.value = pendingDir.current * SCREEN_W;
      tX.value = withTiming(0, { duration: 190 });
      pendingDir.current = 0;
    }
  }, [index, tX]);

  const canPrev = index != null && index > 0;
  const canNext = index != null && index < shown.length - 1;

  // Drag the detail down to dismiss. A fresh instance is wired to BOTH the grab
  // handle and the details header (a gesture can't be shared across detectors).
  const makeDismiss = () =>
    Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-24, 24])
      .onUpdate((e) => {
        tY.value = Math.max(0, e.translationY);
      })
      .onEnd((e) => {
        if (e.translationY > 110 || e.velocityY > 800) {
          tY.value = withTiming(SCREEN_H, { duration: 220 }, (fin) => {
            if (fin) runOnJS(closeDetail)();
          });
        } else {
          tY.value = withSpring(0, { damping: 22, stiffness: 220 });
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dismissHandle = useMemo(makeDismiss, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dismissHeader = useMemo(makeDismiss, []);

  // Swipe left / right to page through the current filtered list. The new page
  // slides in from the opposite edge (over an opaque backdrop) so the shelf
  // grid never flashes through mid-swipe.
  const pager = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-18, 18])
        .onUpdate((e) => {
          let dx = e.translationX;
          if ((!canPrev && dx > 0) || (!canNext && dx < 0)) dx *= 0.3;
          tX.value = dx;
        })
        .onEnd((e) => {
          const decisive =
            Math.abs(e.translationX) > 80 || Math.abs(e.velocityX) > 650;
          if (decisive && e.translationX < 0 && canNext) {
            tX.value = withTiming(-SCREEN_W, { duration: 160 }, (fin) => {
              if (fin) runOnJS(commitPage)((index as number) + 1, 1);
            });
          } else if (decisive && e.translationX > 0 && canPrev) {
            tX.value = withTiming(SCREEN_W, { duration: 160 }, (fin) => {
              if (fin) runOnJS(commitPage)((index as number) - 1, -1);
            });
          } else {
            tX.value = withSpring(0, { damping: 20, stiffness: 220 });
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canPrev, canNext, index, commitPage],
  );

  const sheetDismiss = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-8, 8])
        .failOffsetX([-24, 24])
        .onUpdate((e) => {
          sheetY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
          if (e.translationY > 110 || e.velocityY > 800) {
            sheetY.value = withTiming(SCREEN_H, { duration: 220 }, (fin) => {
              if (fin) runOnJS(onClose)();
            });
          } else {
            sheetY.value = withSpring(0, { damping: 22, stiffness: 220 });
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClose],
  );

  const detailStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tX.value }, { translateY: tY.value }],
    opacity: interpolate(
      Math.abs(tX.value),
      [0, SCREEN_W * 0.6],
      [1, 0.2],
      Extrapolation.CLAMP,
    ),
  }));

  // Opaque backer: follows the vertical drag (so the panel + its background
  // slide down together and reveal the grid) but ignores the horizontal swipe
  // (so it keeps covering the grid while paging left/right).
  const detailBgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tY.value }],
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
  }));

  // Memoised so opening / closing a detail (which flips index+detail state)
  // doesn't re-render the poster images and make the grid flash black.
  const gridEl = useMemo(
    () => (
      <View style={styles.grid}>
        {shown.map((it, i) => {
          const uri = posterUrl(it.posterPath);
          return (
            <Pressable
              key={`${it.mediaType}:${it.movieId}`}
              style={styles.poster}
              onPress={() => showAt(i)}
            >
              {uri ? (
                <Image
                  source={{ uri }}
                  style={styles.posterImg}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.posterImg, styles.posterFallback]}>
                  <Ionicons name="image-outline" size={22} color={chrome.muted} />
                </View>
              )}
              <Text style={styles.posterTitle} numberOfLines={2}>
                {it.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    ),
    [shown, styles, chrome.muted, showAt],
  );

  return (
    <Modal
      visible={!!user}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <GestureDetector gesture={sheetDismiss}>
          <View style={styles.grabZone}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View style={styles.headerUser}>
                <Avatar uri={user?.avatarUrl} size={30} />
                <Text style={styles.title} numberOfLines={1}>
                  @{user?.username}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={20} color={chrome.muted} />
              </Pressable>
            </View>
          </View>
        </GestureDetector>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color={chrome.muted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search this shelf…"
            placeholderTextColor={chrome.muted}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={chrome.muted} />
            </Pressable>
          )}
        </View>

        <View style={styles.chipRow}>
          {SHELF_TYPES.map((t) => {
            const active = shelfType === t.type;
            return (
              <Pressable
                key={t.type}
                onPress={() => setShelfType(t.type)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.chipRow}>
          {MEDIA_TYPES.map((m) => {
            const active = media === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMedia(m.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setMatchesOnly((v) => !v)}
            style={[styles.chip, styles.matchChip, matchesOnly && styles.matchChipActive]}
          >
            <Ionicons
              name="git-compare"
              size={13}
              color={matchesOnly ? chrome.onAccent : colors.favorite}
            />
            <Text style={[styles.chipText, matchesOnly && styles.chipTextActive]}>
              Matches
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && <Text style={styles.hint}>Loading…</Text>}
          {!isLoading && shown.length === 0 && (
            <Text style={styles.hint}>
              {matchesOnly
                ? 'No shared titles on this list yet.'
                : query.trim()
                  ? 'No matches.'
                  : 'Nothing here.'}
            </Text>
          )}
          {gridEl}
        </ScrollView>

        {index != null && detail && (
          <View style={styles.detailOverlay}>
            <Animated.View style={[styles.detailBackdrop, detailBgStyle]} />
            <GestureDetector gesture={pager}>
              <Animated.View style={[styles.detailInner, detailStyle]}>
                <GestureDetector gesture={dismissHandle}>
                  <View style={styles.detailGrab}>
                    <View style={styles.detailHandle} />
                  </View>
                </GestureDetector>
                <MovieDetails
                  movie={detail}
                  dragGesture={dismissHeader}
                  onShare={signedIn ? () => setComposerMovie(detail) : undefined}
                >
                  <FriendFilmActions movie={detail} />
                </MovieDetails>
              </Animated.View>
            </GestureDetector>
          </View>
        )}
        <PostComposer
          movie={composerMovie}
          onClose={() => setComposerMovie(null)}
        />
      </Animated.View>
    </Modal>
  );
}

const ACTIONS: {
  type: 'watched' | 'watchlist' | 'favorite';
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}[] = [
  { type: 'watched', icon: 'albums-outline', activeIcon: 'albums', label: 'Watched', color: colors.watched },
  { type: 'watchlist', icon: 'star-outline', activeIcon: 'star', label: 'Wishlist', color: colors.star },
  { type: 'favorite', icon: 'heart-outline', activeIcon: 'heart', label: 'Favorite', color: colors.favorite },
];

/** Add/remove a friend's title to your own shelves, from the inline detail view. */
function FriendFilmActions({ movie }: { movie: Movie }) {
  const chrome = useThemeChrome();
  const styles = useMemo(() => makeActionStyles(chrome), [chrome]);
  const { toggleWatched, toggleWatchlist, toggleFavorite } = useInteractions();
  const qc = useQueryClient();
  const key = ['film-state', movie.mediaType, movie.id];
  const { data: state } = useQuery({
    queryKey: key,
    queryFn: async () => ({
      watched: await interactionRepository.has(movie.id, 'watched', movie.mediaType),
      watchlist: await interactionRepository.has(movie.id, 'watchlist', movie.mediaType),
      favorite: await interactionRepository.has(movie.id, 'favorite', movie.mediaType),
    }),
  });
  const toggles = {
    watched: toggleWatched,
    watchlist: toggleWatchlist,
    favorite: toggleFavorite,
  };
  const run = async (type: 'watched' | 'watchlist' | 'favorite') => {
    await toggles[type](movie);
    qc.invalidateQueries({ queryKey: key });
  };
  return (
    <View style={styles.row}>
      {ACTIONS.map((a) => {
        const active = !!state?.[a.type];
        return (
          <Pressable key={a.type} style={styles.btn} onPress={() => run(a.type)}>
            <Ionicons
              name={active ? a.activeIcon : a.icon}
              size={22}
              color={active ? a.color : chrome.muted}
            />
            <Text style={[styles.label, active && { color: a.color }]}>
              {a.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeActionStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: spacing.sm,
    },
    btn: {
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    label: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

const makeStyles = (c: ThemeChrome) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(10, 6, 2, 0.6)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '92%',
      backgroundColor: c.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 2,
      borderColor: c.border,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      paddingTop: spacing.sm,
      overflow: 'hidden',
    },
    handle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: 'center',
      marginBottom: spacing.sm,
    },
    grabZone: {
      paddingTop: spacing.xs,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      marginBottom: spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 14,
      padding: 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    headerUser: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      flex: 1,
      color: c.accent,
      fontFamily: fonts.display,
      fontSize: 20,
      letterSpacing: 1,
    },
    content: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    hint: {
      color: c.muted,
      fontFamily: fonts.body,
      fontSize: 13,
      paddingVertical: spacing.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
    },
    chipActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    matchChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderColor: colors.favorite,
    },
    matchChipActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    chipText: {
      color: c.muted,
      fontFamily: fonts.label,
      fontSize: 12,
    },
    chipTextActive: {
      color: c.onAccent,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    poster: {
      width: POSTER_W,
    },
    posterImg: {
      width: POSTER_W,
      height: POSTER_W * 1.5,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surfaceRaised,
    },
    posterFallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    posterTitle: {
      color: colors.textOnDark,
      fontFamily: fonts.body,
      fontSize: 11,
      marginTop: 4,
    },
    detailOverlay: {
      // Break out of the sheet's padding so the detail fills it edge-to-edge.
      position: 'absolute',
      top: -spacing.sm,
      bottom: -spacing.xl,
      left: -spacing.lg,
      right: -spacing.lg,
    },
    detailBackdrop: {
      // Opaque backer so the shelf grid never flashes through while paging.
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.background,
    },
    detailInner: {
      flex: 1,
      backgroundColor: c.background,
    },
    detailGrab: {
      alignItems: 'center',
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    detailHandle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },
  });
