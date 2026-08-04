import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Movie } from '@/api/types';
import { watchedLabel, WATCHLIST_LABEL } from '@/constants/labels';
import { MOOD_LABEL } from '@/constants/moods';
import { useInteractions } from '@/hooks/useInteractions';
import { useInteractionStates } from '@/hooks/useInteractionStates';
import { useNote } from '@/hooks/useNotes';
import { useLanguage } from '@/context/LanguageProvider';
import { useThemeChrome } from '@/context/ThemeProvider';
import { colors, fonts, radius, spacing } from '@/theme';
import { AddToMoodSheet } from './AddToMoodSheet';
import { NoteSheet } from './NoteSheet';
import { MovieDetails } from './MovieDetails';

const SCREEN_H = Dimensions.get('window').height;
const SCREEN_W = Dimensions.get('window').width;

interface DetailsContextValue {
  /**
   * Opens the shared details modal for a movie. Pass the surrounding `list`
   * (e.g. the current shelf) to let the user swipe left/right between items.
   */
  open: (movie: Movie, list?: Movie[]) => void;
}

const DetailsContext = createContext<DetailsContextValue | null>(null);

/** Opens the app-wide movie-details modal from anywhere. */
export function useMovieDetails(): DetailsContextValue {
  const ctx = useContext(DetailsContext);
  if (!ctx) {
    throw new Error('useMovieDetails must be used within a MovieDetailsProvider');
  }
  return ctx;
}

/**
 * Provides a single, app-wide movie-details modal. Tapping a poster on any
 * shelf or search result opens it, where the movie can be added to / removed
 * from the Watched shelf, Watchlist and Favorites.
 */
export function MovieDetailsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<{ list: Movie[]; index: number } | null>(
    null,
  );
  const open = useCallback((m: Movie, list?: Movie[]) => {
    const arr = list && list.length ? list : [m];
    const idx = Math.max(
      0,
      arr.findIndex((x) => x.id === m.id && x.mediaType === m.mediaType),
    );
    setSession({ list: arr, index: idx });
  }, []);
  const close = useCallback(() => setSession(null), []);
  const goTo = useCallback((index: number) => {
    setSession((s) =>
      s && index >= 0 && index < s.list.length ? { ...s, index } : s,
    );
  }, []);

  return (
    <DetailsContext.Provider value={{ open }}>
      {children}
      <DetailsModal session={session} onClose={close} onIndexChange={goTo} />
    </DetailsContext.Provider>
  );
}

function DetailsModal({
  session,
  onClose,
  onIndexChange,
}: {
  session: { list: Movie[]; index: number } | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const list = session?.list ?? [];
  const index = session?.index ?? 0;
  const movie = session ? session.list[session.index] : null;
  const chrome = useThemeChrome();
  const { toggleWatched, toggleWatchlist, toggleFavorite } = useInteractions();
  const states = useInteractionStates();
  const { text } = useLanguage();
  const [moodSheetOpen, setMoodSheetOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const { data: noteText } = useNote(
    movie?.id ?? '',
    movie?.mediaType ?? 'movie',
  );

  const translateY = useSharedValue(0);
  const pageX = useSharedValue(0);
  // Reset the drag offset whenever a new movie opens.
  useEffect(() => {
    if (movie) {
      translateY.value = 0;
      setMoodSheetOpen(false);
      setNoteOpen(false);
    }
  }, [movie, translateY]);

  // Recentre the horizontal pager only on a fresh open (not while paging).
  const wasOpen = useRef(false);
  useEffect(() => {
    if (session && !wasOpen.current) pageX.value = 0;
    wasOpen.current = !!session;
  }, [session, pageX]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pageX.value }],
    opacity: interpolate(
      Math.abs(pageX.value),
      [0, SCREEN_W * 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Build a fresh drag-to-dismiss gesture. Used on BOTH the grab handle and the
  // card's poster/title header, so the sheet can be pulled down from either.
  const buildDismiss = () =>
    Gesture.Pan()
      .activeOffsetY([-12, 12])
      .failOffsetX([-24, 24])
      .onUpdate((e) => {
        translateY.value = Math.max(0, e.translationY);
      })
      .onEnd((e) => {
        if (e.translationY > 140 || e.velocityY > 900) {
          translateY.value = withTiming(SCREEN_H, { duration: 220 }, (finished) => {
            if (finished) runOnJS(onClose)();
          });
        } else {
          translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
        }
      });
  const handleDrag = buildDismiss();
  const headerDrag = buildDismiss();

  // Swipe left/right to page through the surrounding list (e.g. the shelf).
  const canPrev = index > 0;
  const canNext = index < list.length - 1;
  const pager = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-18, 18])
    .onUpdate((e) => {
      let dx = e.translationX;
      if ((!canPrev && dx > 0) || (!canNext && dx < 0)) dx *= 0.3;
      pageX.value = dx;
    })
    .onEnd((e) => {
      const decisive =
        Math.abs(e.translationX) > 80 || Math.abs(e.velocityX) > 650;
      if (decisive && e.translationX < 0 && canNext) {
        pageX.value = withTiming(-SCREEN_W, { duration: 160 }, (fin) => {
          if (fin) {
            runOnJS(onIndexChange)(index + 1);
            pageX.value = SCREEN_W;
            pageX.value = withTiming(0, { duration: 190 });
          }
        });
      } else if (decisive && e.translationX > 0 && canPrev) {
        pageX.value = withTiming(SCREEN_W, { duration: 160 }, (fin) => {
          if (fin) {
            runOnJS(onIndexChange)(index - 1);
            pageX.value = -SCREEN_W;
            pageX.value = withTiming(0, { duration: 190 });
          }
        });
      } else {
        pageX.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  if (!movie) return null;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: chrome.background, borderColor: chrome.border }]}>
          <GestureDetector gesture={handleDrag}>
            <View style={styles.handleZone}>
              <View style={[styles.handle, { backgroundColor: chrome.border }]} />
            </View>
          </GestureDetector>
          {list.length > 1 && (
            <Text style={styles.counter}>
              {index + 1} / {list.length}
            </Text>
          )}
          <GestureDetector gesture={pager}>
            <Animated.View style={[styles.pager, pageStyle]}>
          <MovieDetails
            movie={movie}
            dragGesture={headerDrag}
            onOpenNote={() => setNoteOpen(true)}
            hasNote={(noteText ?? '').length > 0}
          >
          <View style={styles.actions}>
            <DetailAction
              label={watchedLabel(movie.mediaType)}
              color={colors.watched}
              icon="albums-outline"
              activeIcon="albums"
              active={states.isWatched(movie.id)}
              onPress={() => toggleWatched(movie)}
            />
            <DetailAction
              label={WATCHLIST_LABEL}
              color={colors.star}
              icon="star-outline"
              activeIcon="star"
              active={states.isWatchlisted(movie.id)}
              onPress={() => toggleWatchlist(movie)}
            />
            <DetailAction
              label="Favorite"
              color={colors.favorite}
              icon="heart-outline"
              activeIcon="heart"
              active={states.isFavorite(movie.id)}
              onPress={() => toggleFavorite(movie)}
            />
            <DetailAction
              label={MOOD_LABEL}
              color={colors.amberBright}
              icon="color-palette-outline"
              activeIcon="color-palette"
              active={false}
              onPress={() => setMoodSheetOpen(true)}
            />
          </View>
          <Text style={styles.hint}>{text.removeHint}</Text>
        </MovieDetails>
            </Animated.View>
          </GestureDetector>

        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textOnDarkMuted} />
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        </Animated.View>
        <AddToMoodSheet
          movie={movie}
          visible={moodSheetOpen}
          onClose={() => setMoodSheetOpen(false)}
        />
        <NoteSheet
          movie={movie}
          visible={noteOpen}
          onClose={() => setNoteOpen(false)}
        />
      </GestureHandlerRootView>
    </Modal>
  );
}

interface DetailActionProps {
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}

function DetailAction({
  label,
  color,
  icon,
  activeIcon,
  active,
  onPress,
}: DetailActionProps) {
  const chrome = useThemeChrome();
  return (
    <Pressable style={styles.action} onPress={onPress} hitSlop={6}>
      <View
        style={[
          styles.actionCircle,
          { backgroundColor: chrome.surfaceRaised, borderColor: chrome.border },
          active && { borderColor: color, backgroundColor: `${color}22` },
        ]}
      >
        <Ionicons name={active ? activeIcon : icon} size={26} color={color} />
      </View>
      <Text style={[styles.actionLabel, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 6, 2, 0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '76%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  modalRoot: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  counter: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  handleZone: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  action: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hint: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  closeText: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.label,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
