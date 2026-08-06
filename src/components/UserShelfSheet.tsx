import { useMemo, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { fetchMediaById } from '@/api/movies';
import { ShelfItem } from '@/api/shelfSync';
import { UserSummary } from '@/api/follows';
import { useUserShelf } from '@/hooks/useUserShelf';
import { useInteractions } from '@/hooks/useInteractions';
import { interactionRepository } from '@/repositories';
import { colors, fonts, radius, spacing } from '@/theme';
import { ThemeChrome, useThemeChrome } from '@/context/ThemeProvider';
import { MovieDetails } from './MovieDetails';

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
  const { data: items, isLoading } = useUserShelf(user?.id ?? null);
  const [shelfType, setShelfType] = useState<ShelfItem['type']>('watched');
  const [media, setMedia] = useState<MediaType | 'all'>('all');
  const [index, setIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<Movie | null>(null);

  const shown = useMemo(
    () =>
      (items ?? []).filter(
        (i) => i.type === shelfType && (media === 'all' || i.mediaType === media),
      ),
    [items, shelfType, media],
  );

  const tY = useSharedValue(0);
  const tX = useSharedValue(0);

  // Show item at `i`: minimal instantly, then enrich with full metadata.
  const showAt = (i: number) => {
    const it = shown[i];
    if (!it) return;
    tY.value = 0;
    tX.value = 0;
    setIndex(i);
    setDetail(toMovie(it));
    fetchMediaById(it.mediaType, it.movieId)
      .then((full) => {
        if (full) {
          setDetail((cur) => (cur && cur.id === it.movieId ? full : cur));
        }
      })
      .catch(() => {});
  };
  const closeDetail = () => {
    setIndex(null);
    setDetail(null);
    tY.value = 0;
    tX.value = 0;
  };

  const canPrev = index != null && index > 0;
  const canNext = index != null && index < shown.length - 1;

  // Drag the detail down to dismiss (on the grab handle).
  const dismiss = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-12, 12])
        .failOffsetX([-24, 24])
        .onUpdate((e) => {
          tY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
          if (e.translationY > 120 || e.velocityY > 900) {
            tY.value = withTiming(SCREEN_H, { duration: 220 }, (fin) => {
              if (fin) runOnJS(closeDetail)();
            });
          } else {
            tY.value = withSpring(0, { damping: 22, stiffness: 220 });
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Swipe left / right to page through the current filtered list.
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
            tX.value = withTiming(-SCREEN_W, { duration: 150 }, (fin) => {
              if (fin) runOnJS(showAt)((index as number) + 1);
            });
          } else if (decisive && e.translationX > 0 && canPrev) {
            tX.value = withTiming(SCREEN_W, { duration: 150 }, (fin) => {
              if (fin) runOnJS(showAt)((index as number) - 1);
            });
          } else {
            tX.value = withSpring(0, { damping: 20, stiffness: 220 });
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canPrev, canNext, index],
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

  return (
    <Modal
      visible={!!user}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            @{user?.username}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={20} color={chrome.muted} />
          </Pressable>
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
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && <Text style={styles.hint}>Loading…</Text>}
          {!isLoading && shown.length === 0 && (
            <Text style={styles.hint}>Nothing here.</Text>
          )}
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
                      <Ionicons
                        name="image-outline"
                        size={22}
                        color={chrome.muted}
                      />
                    </View>
                  )}
                  <Text style={styles.posterTitle} numberOfLines={2}>
                    {it.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {index != null && detail && (
          <View style={styles.detailOverlay}>
            <GestureDetector gesture={pager}>
              <Animated.View style={[styles.detailInner, detailStyle]}>
                <GestureDetector gesture={dismiss}>
                  <View style={styles.detailGrab}>
                    <View style={styles.detailHandle} />
                  </View>
                </GestureDetector>
                <MovieDetails movie={detail}>
                  <FriendFilmActions movie={detail} />
                </MovieDetails>
              </Animated.View>
            </GestureDetector>
          </View>
        )}
      </View>
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
      height: '86%',
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
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
      ...StyleSheet.absoluteFillObject,
    },
    detailInner: {
      flex: 1,
      backgroundColor: c.background,
    },
    detailGrab: {
      alignItems: 'center',
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    detailHandle: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
    },
  });
