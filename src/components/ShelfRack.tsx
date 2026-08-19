import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useFrameCallback,
  useScrollViewOffset,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { PosterImage } from '@/components/PosterImage';
import { useThemeChrome } from '@/context/ThemeProvider';
import { StoredMovie } from '@/repositories';
import { colors, fonts, spacing } from '@/theme';

const SPINE_PALETTE = [
  '#7a3527', // brick
  '#a7563d', // terracotta
  '#5e7a3c', // sage
  '#3f6079', // dusty teal
  '#2c4a3a', // forest
  '#8a5a2b', // cinnamon
  '#b3873d', // brass
  '#574a78', // muted plum
  '#2a3b52', // navy
  '#6a4f33', // walnut
];

const SHELF_HEIGHT = 168; // book height
const SHELF_PLANK = 10; // wood plank height under the books
const SPINE_GAP = 2;
const PLANK_SHADOW_H = 6;
const ROW_GAP = spacing.lg;
// Vertical footprint of one shelf row (book + plank + shadow + gap). Used to
// place spines absolutely when the shelf is in drag-to-reorder mode.
const ROW_H = SHELF_HEIGHT + SHELF_PLANK + PLANK_SHADOW_H + ROW_GAP;

interface Props {
  movies: StoredMovie[];
  onOpen: (movie: StoredMovie) => void;
  isWatchlisted?: (id: string) => boolean;
  isFavorite?: (id: string) => boolean;
  /** Available horizontal pixels (after page padding) for laying out spines. */
  containerWidth: number;
  /** Hide the star badge (on the Wishlist shelf, where every item is starred). */
  showStar?: boolean;
  /** Hide the heart badge (on the Favorites shelf, where every item is a fav). */
  showHeart?: boolean;
  /** When true, long-press a spine to drag it into a custom order. */
  reorderable?: boolean;
  /** Called with the new full id order after a drag settles. */
  onReorder?: (orderedIds: string[]) => void;
}

/**
 * Renders a stack of wooden shelves with movies/books standing as spines on
 * each one. Tapping a spine animates it lifting out and slightly tilting,
 * then opens the details modal. In `reorderable` mode the spines are laid out
 * absolutely so they can be long-pressed and dragged into a custom order.
 */
export function ShelfRack({
  movies,
  onOpen,
  isWatchlisted,
  isFavorite,
  containerWidth,
  showStar = true,
  showHeart = true,
  reorderable = false,
  onReorder,
}: Props) {
  // Choose a spine width that yields a tidy whole-number per row.
  const spinesPerRow = Math.max(5, Math.min(9, Math.floor(containerWidth / 42)));
  const spineWidth =
    (containerWidth - SPINE_GAP * (spinesPerRow - 1)) / spinesPerRow;

  const rows = useMemo(() => {
    const out: StoredMovie[][] = [];
    for (let i = 0; i < movies.length; i += spinesPerRow) {
      out.push(movies.slice(i, i + spinesPerRow));
    }
    return out;
  }, [movies, spinesPerRow]);

  if (reorderable && onReorder) {
    return (
      <SortableRack
        movies={movies}
        onOpen={onOpen}
        onReorder={onReorder}
        isWatchlisted={isWatchlisted}
        isFavorite={isFavorite}
        spineWidth={spineWidth}
        cols={spinesPerRow}
        showStar={showStar}
        showHeart={showHeart}
      />
    );
  }

  return (
    <View>
      {rows.map((row, idx) => (
        <ShelfRow
          key={idx}
          movies={row}
          onOpen={onOpen}
          isWatchlisted={isWatchlisted}
          isFavorite={isFavorite}
          spineWidth={spineWidth}
          showStar={showStar}
          showHeart={showHeart}
        />
      ))}
    </View>
  );
}

function ShelfRow({
  movies,
  onOpen,
  isWatchlisted,
  isFavorite,
  spineWidth,
  showStar = true,
  showHeart = true,
}: Omit<Props, 'containerWidth'> & { spineWidth: number }) {
  const chrome = useThemeChrome();
  return (
    <View style={styles.rowOuter}>
      <View style={styles.row}>
        {movies.map((m) => (
          <BookSpine
            key={m.id}
            movie={m}
            width={spineWidth}
            onOpen={onOpen}
            watchlisted={isWatchlisted?.(m.id) ?? false}
            favorite={isFavorite?.(m.id) ?? false}
            showStar={showStar}
            showHeart={showHeart}
          />
        ))}
      </View>
      {/* Wooden plank under the books. */}
      <LinearGradient
        colors={chrome.plank}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.plank}
      />
      <View style={styles.plankShadow} pointerEvents="none" />
    </View>
  );
}

/** The spine box size + fallback colour shared by static and draggable spines. */
function spineBox(movie: StoredMovie, width: number) {
  const fallbackColor = SPINE_PALETTE[hash(movie.id) % SPINE_PALETTE.length];
  return {
    width,
    height: SHELF_HEIGHT,
    backgroundColor: fallbackColor,
    borderColor: movie.mediaType === 'book' ? '#1a0d04' : '#0a0a0a',
  };
}

/** The visual "skin" of a spine: poster + binding decor + status badges. */
function SpineFace({
  movie,
  watchlisted,
  favorite,
  showStar,
  showHeart,
}: {
  movie: StoredMovie;
  watchlisted: boolean;
  favorite: boolean;
  showStar: boolean;
  showHeart: boolean;
}) {
  const isBook = movie.mediaType === 'book';
  return (
    <>
      {/* Poster as the spine's "skin" — unique colours per item. */}
      {movie.posterPath && (
        <PosterImage
          posterPath={movie.posterPath}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      )}

      {/* Very light scrim at top/bottom so the binding caps blend in. */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.35)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top + bottom darker caps for "binding" depth. */}
      <View style={[styles.cap, styles.capTop]} />
      <View style={[styles.cap, styles.capBottom]} />

      {/* Thin highlight stripe down one edge to suggest paper pages. */}
      <View style={styles.pages} />

      {/* Decorative gold band only on books — DVDs get a thin silver foil. */}
      {isBook ? (
        <>
          <View style={[styles.band, styles.bandGold]} />
          <View
            style={[styles.band, styles.bandGold, { top: undefined, bottom: 32 }]}
          />
        </>
      ) : (
        <View style={[styles.band, styles.bandSilver]} />
      )}

      {/* Status badges: a dark chip with an accent ring makes the icon read
          clearly over any poster art. Hide the icon matching this shelf. */}
      {((showStar && watchlisted) || (showHeart && favorite)) && (
        <View style={styles.badges}>
          {showStar && watchlisted && (
            <View style={[styles.badgeChip, { borderColor: colors.star }]}>
              <Ionicons name="star" size={11} color={colors.star} />
            </View>
          )}
          {showHeart && favorite && (
            <View style={[styles.badgeChip, { borderColor: colors.favorite }]}>
              <Ionicons name="heart" size={11} color={colors.favorite} />
            </View>
          )}
        </View>
      )}
    </>
  );
}

function BookSpine({
  movie,
  width,
  onOpen,
  watchlisted,
  favorite,
  showStar,
  showHeart,
}: {
  movie: StoredMovie;
  width: number;
  onOpen: (movie: StoredMovie) => void;
  watchlisted: boolean;
  favorite: boolean;
  showStar: boolean;
  showHeart: boolean;
}) {
  const lift = useSharedValue(0);
  const tilt = useSharedValue(0);

  const handlePress = () => {
    lift.value = withSequence(
      withTiming(-22, { duration: 180 }),
      withTiming(0, { duration: 260 }, () => {
        runOnJS(onOpen)(movie);
      }),
    );
    tilt.value = withSequence(
      withTiming(-6, { duration: 180 }),
      withTiming(0, { duration: 260 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { rotateZ: `${tilt.value}deg` }],
  }));

  return (
    <Pressable onPress={handlePress} hitSlop={2}>
      <Animated.View style={[styles.spine, spineBox(movie, width), animatedStyle]}>
        <SpineFace
          movie={movie}
          watchlisted={watchlisted}
          favorite={favorite}
          showStar={showStar}
          showHeart={showHeart}
        />
      </Animated.View>
    </Pressable>
  );
}

/** id -> slot index map. */
function listToObject(ids: string[]): Record<string, number> {
  const o: Record<string, number> = {};
  ids.forEach((id, i) => (o[id] = i));
  return o;
}

function slotX(index: number, cols: number, width: number): number {
  'worklet';
  return (index % cols) * (width + SPINE_GAP);
}

function slotY(index: number, cols: number): number {
  'worklet';
  return Math.floor(index / cols) * ROW_H;
}

function clampW(v: number, lo: number, hi: number): number {
  'worklet';
  return Math.min(hi, Math.max(lo, v));
}

/** Shifts slot indices to insert the dragged item at `to` (worklet). */
function objectMove(
  positions: Record<string, number>,
  from: number,
  to: number,
): Record<string, number> {
  'worklet';
  const next: Record<string, number> = {};
  for (const id in positions) {
    const p = positions[id];
    if (from < to) {
      if (p === from) next[id] = to;
      else if (p > from && p <= to) next[id] = p - 1;
      else next[id] = p;
    } else if (from > to) {
      if (p === from) next[id] = to;
      else if (p >= to && p < from) next[id] = p + 1;
      else next[id] = p;
    } else {
      next[id] = p;
    }
  }
  return next;
}

// Auto-scroll: how close (px) to the viewport edge triggers it, and how fast.
const EDGE_ZONE = 74;
const AUTO_SCROLL_SPEED = 9;

/** Absolute-positioned, long-press-drag reorderable rack with edge auto-scroll. */
function SortableRack({
  movies,
  onOpen,
  onReorder,
  isWatchlisted,
  isFavorite,
  spineWidth,
  cols,
  showStar,
  showHeart,
}: {
  movies: StoredMovie[];
  onOpen: (movie: StoredMovie) => void;
  onReorder: (orderedIds: string[]) => void;
  isWatchlisted?: (id: string) => boolean;
  isFavorite?: (id: string) => boolean;
  spineWidth: number;
  cols: number;
  showStar: boolean;
  showHeart: boolean;
}) {
  const chrome = useThemeChrome();
  const ids = useMemo(() => movies.map((m) => m.id), [movies]);
  const n = ids.length;
  const rowCount = Math.max(1, Math.ceil(n / cols));
  const step = spineWidth + SPINE_GAP;

  const positions = useSharedValue<Record<string, number>>(listToObject(ids));
  const activeId = useSharedValue<string | null>(null);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const edgeDir = useSharedValue(0);
  const scrollAccum = useSharedValue(0);
  const svTop = useSharedValue(0);
  const svBottom = useSharedValue(0);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  // Reseed slots when the shelf contents change (add/remove/reorder result).
  useEffect(() => {
    positions.value = listToObject(ids);
  }, [ids, positions]);

  // While a spine is held near the top/bottom edge, scroll and keep it pinned
  // to the finger, reordering as new slots pass under it.
  useFrameCallback(() => {
    if (activeId.value == null || edgeDir.value === 0) return;
    const count = Object.keys(positions.value).length;
    const rc = Math.max(1, Math.ceil(count / cols));
    const viewport = svBottom.value - svTop.value;
    const maxScroll = Math.max(0, rc * ROW_H - viewport);
    const cur = scrollOffset.value;
    const next = Math.min(
      maxScroll,
      Math.max(0, cur + edgeDir.value * AUTO_SCROLL_SPEED),
    );
    if (next === cur) return;
    scrollTo(scrollRef, 0, next, false);
    const delta = next - cur;
    scrollAccum.value += delta;
    dragY.value += delta;
    const id = activeId.value;
    const col = clampW(Math.round(dragX.value / step), 0, cols - 1);
    const row = clampW(Math.round(dragY.value / ROW_H), 0, rc - 1);
    const newIndex = clampW(row * cols + col, 0, count - 1);
    const oldIndex = positions.value[id];
    if (newIndex !== oldIndex) {
      positions.value = objectMove(positions.value, oldIndex, newIndex);
    }
  });

  const pickup = () =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={styles.sortScroll}
      contentContainerStyle={styles.sortContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.reorderHint}>
        Long-press a poster and drag it to reorder
      </Text>
      <View style={{ height: rowCount * ROW_H }}>
        {Array.from({ length: rowCount }).map((_, r) => (
          <View key={r} pointerEvents="none">
            <LinearGradient
              colors={chrome.plank}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.plank, styles.sortPlank, { top: r * ROW_H + SHELF_HEIGHT }]}
            />
            <View
              style={[
                styles.plankShadow,
                styles.sortPlankShadow,
                { top: r * ROW_H + SHELF_HEIGHT + SHELF_PLANK },
              ]}
            />
          </View>
        ))}
        {movies.map((m, i) => (
          <SortableSpine
            key={m.id}
            movie={m}
            initialIndex={i}
            width={spineWidth}
            cols={cols}
            count={n}
            rowCount={rowCount}
            step={step}
            positions={positions}
            activeId={activeId}
            dragX={dragX}
            dragY={dragY}
            edgeDir={edgeDir}
            scrollAccum={scrollAccum}
            svTop={svTop}
            svBottom={svBottom}
            scrollRef={scrollRef}
            onOpen={onOpen}
            onCommit={onReorder}
            onPickup={pickup}
            watchlisted={isWatchlisted?.(m.id) ?? false}
            favorite={isFavorite?.(m.id) ?? false}
            showStar={showStar}
            showHeart={showHeart}
          />
        ))}
      </View>
    </Animated.ScrollView>
  );
}

function SortableSpine({
  movie,
  initialIndex,
  width,
  cols,
  count,
  rowCount,
  step,
  positions,
  activeId,
  dragX,
  dragY,
  edgeDir,
  scrollAccum,
  svTop,
  svBottom,
  scrollRef,
  onOpen,
  onCommit,
  onPickup,
  watchlisted,
  favorite,
  showStar,
  showHeart,
}: {
  movie: StoredMovie;
  initialIndex: number;
  width: number;
  cols: number;
  count: number;
  rowCount: number;
  step: number;
  positions: SharedValue<Record<string, number>>;
  activeId: SharedValue<string | null>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  edgeDir: SharedValue<number>;
  scrollAccum: SharedValue<number>;
  svTop: SharedValue<number>;
  svBottom: SharedValue<number>;
  scrollRef: ReturnType<typeof useAnimatedRef<Animated.ScrollView>>;
  onOpen: (movie: StoredMovie) => void;
  onCommit: (orderedIds: string[]) => void;
  onPickup: () => void;
  watchlisted: boolean;
  favorite: boolean;
  showStar: boolean;
  showHeart: boolean;
}) {
  const id = movie.id;
  const tx = useSharedValue(slotX(initialIndex, cols, width));
  const ty = useSharedValue(slotY(initialIndex, cols));
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // Non-dragged spines glide to their slot whenever the order changes.
  useAnimatedReaction(
    () => positions.value[id],
    (index, prev) => {
      if (index == null || index === prev) return;
      if (activeId.value === id) return;
      tx.value = withTiming(slotX(index, cols, width), { duration: 220 });
      ty.value = withTiming(slotY(index, cols), { duration: 220 });
    },
  );

  const pan = Gesture.Pan()
    .activateAfterLongPress(220)
    .onStart(() => {
      activeId.value = id;
      dragX.value = tx.value;
      dragY.value = ty.value;
      startX.value = tx.value;
      startY.value = ty.value;
      scrollAccum.value = 0;
      edgeDir.value = 0;
      const m = measure(scrollRef);
      if (m != null) {
        svTop.value = m.pageY;
        svBottom.value = m.pageY + m.height;
      }
      runOnJS(onPickup)();
    })
    .onUpdate((e) => {
      dragX.value = startX.value + e.translationX;
      dragY.value = startY.value + e.translationY + scrollAccum.value;
      if (e.absoluteY < svTop.value + EDGE_ZONE) edgeDir.value = -1;
      else if (e.absoluteY > svBottom.value - EDGE_ZONE) edgeDir.value = 1;
      else edgeDir.value = 0;
      const col = clampW(Math.round(dragX.value / step), 0, cols - 1);
      const row = clampW(Math.round(dragY.value / ROW_H), 0, rowCount - 1);
      const newIndex = clampW(row * cols + col, 0, count - 1);
      const oldIndex = positions.value[id];
      if (newIndex !== oldIndex) {
        positions.value = objectMove(positions.value, oldIndex, newIndex);
      }
    })
    .onEnd(() => {
      edgeDir.value = 0;
      const finalIndex = positions.value[id];
      const fx = slotX(finalIndex, cols, width);
      const fy = slotY(finalIndex, cols);
      tx.value = fx;
      ty.value = fy;
      dragX.value = withTiming(fx, { duration: 180 });
      dragY.value = withTiming(fy, { duration: 180 }, (fin) => {
        if (fin) activeId.value = null;
      });
      const ordered = Object.keys(positions.value);
      ordered.sort((a, b) => positions.value[a] - positions.value[b]);
      runOnJS(onCommit)(ordered);
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onOpen)(movie);
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const animatedStyle = useAnimatedStyle(() => {
    const active = activeId.value === id;
    const x = active ? dragX.value : tx.value;
    const y = active ? dragY.value : ty.value;
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: active ? 50 : 0,
      shadowColor: '#000',
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: withTiming(active ? 0.35 : 0, { duration: 150 }),
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: withTiming(active ? 1.1 : 1, { duration: 150 }) },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.spine, spineBox(movie, width), animatedStyle]}>
        <SpineFace
          movie={movie}
          watchlisted={watchlisted}
          favorite={favorite}
          showStar={showStar}
          showHeart={showHeart}
        />
      </Animated.View>
    </GestureDetector>
  );
}

/** djb2-style hash for stable per-item palette assignment. */
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

const styles = StyleSheet.create({
  rowOuter: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SPINE_GAP,
    alignItems: 'flex-end',
  },
  plank: {
    height: SHELF_PLANK,
    borderRadius: 2,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2c1a08',
  },
  plankShadow: {
    height: 6,
    backgroundColor: 'rgba(20, 12, 4, 0.18)',
    marginHorizontal: 4,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  sortPlank: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sortPlankShadow: {
    position: 'absolute',
    left: 4,
    right: 4,
    marginHorizontal: 0,
  },
  sortScroll: {
    flex: 1,
  },
  sortContent: {
    paddingBottom: spacing.xxl,
  },
  reorderHint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  spine: {
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  cap: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  capTop: { top: 0 },
  capBottom: { bottom: 0 },
  pages: {
    position: 'absolute',
    right: 0,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: 'rgba(243, 231, 210, 0.45)',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 24,
    height: 3,
  },
  bandGold: {
    backgroundColor: 'rgba(216, 165, 72, 0.75)',
  },
  bandSilver: {
    backgroundColor: 'rgba(220, 220, 220, 0.35)',
  },
  badges: {
    position: 'absolute',
    top: 6,
    right: 4,
    flexDirection: 'column',
    gap: 3,
    alignItems: 'center',
  },
  badgeChip: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(8, 5, 2, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
});

export { SHELF_HEIGHT };
