import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Overlay } from '@/api/posts';
import { fonts } from '@/theme';
import { POSTER_SIZE } from '@/constants/config';
import { PosterImage } from './PosterImage';

// Story card aspect (portrait 9:16): height / width.
export const CARD_RATIO = 16 / 9;

/** Selectable fonts for a text sticker (key persisted, family resolved here). */
export const STORY_FONTS: { key: string; family?: string; label: string }[] = [
  { key: 'display', family: fonts.display, label: 'Poster' },
  { key: 'type', family: fonts.body, label: 'Type' },
  { key: 'clean', family: undefined, label: 'Clean' },
  { key: 'caps', family: fonts.label, label: 'Caps' },
];

export function fontFamilyFor(key: string): string | undefined {
  return STORY_FONTS.find((f) => f.key === key)?.family;
}

/** Text colours offered in the composer. */
export const STORY_COLORS = [
  '#ffffff',
  '#111111',
  '#ffd84d',
  '#ff5a5f',
  '#66bb6a',
  '#7aa2ff',
  '#ff8ac2',
  '#b98cff',
];

/** Emoji stickers offered in the composer. */
export const STORY_EMOJIS = [
  '😍', '❤️', '🔥', '😂', '😮', '😭', '👏', '🎬',
  '🍿', '⭐️', '👀', '💯', '🥹', '😱', '🤯', '👽',
  '🎃', '💀', '🌙', '✨', '🎉', '🥳', '🤩', '😎',
  '🫶', '👑', '🌟', '💫', '🎈', '🍷', '🧠', '🫣',
];

// Sticker base size as a fraction of the canvas width (scaled further by the
// per-sticker `scale`), so a story looks the same on any screen size.
const TEXT_FRAC = 0.085;
const EMOJI_FRAC = 0.13;

export function OverlayContent({
  overlay,
  canvasW,
}: {
  overlay: Overlay;
  canvasW: number;
}) {
  if (overlay.kind === 'emoji') {
    return (
      <Text style={{ fontSize: EMOJI_FRAC * canvasW }}>{overlay.emoji}</Text>
    );
  }
  return (
    <Text
      style={[
        styles.text,
        {
          fontFamily: fontFamilyFor(overlay.font),
          color: overlay.color,
          fontSize: TEXT_FRAC * canvasW,
          maxWidth: canvasW * 0.92,
        },
      ]}
    >
      {overlay.text}
    </Text>
  );
}

/** The shared "Spotify-style" story card: warm background + framed poster +
 *  title, used by both the composer canvas and the viewer so they match. */
export function StoryCard({
  title,
  posterPath,
  year,
  width,
  height,
}: {
  title: string | null;
  posterPath: string | null;
  year: number | null;
  width: number;
  height: number;
}) {
  const pad = width * 0.08;
  const posterW = width * 0.66;
  const posterH = posterW * 1.5;
  return (
    <View style={{ width, height }}>
      <LinearGradient
        colors={['#f6ecd6', '#e7d0a4']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: pad,
          paddingTop: height * 0.08,
          paddingBottom: pad,
        }}
      >
        <View style={[styles.posterShadow, { borderRadius: width * 0.04 }]}>
          <PosterImage
            posterPath={posterPath}
            title={title ?? ''}
            size={POSTER_SIZE}
            style={{ width: posterW, height: posterH, borderRadius: width * 0.04 }}
          />
        </View>
        <Text
          numberOfLines={2}
          style={{
            marginTop: height * 0.035,
            fontFamily: fonts.display,
            fontSize: width * 0.08,
            color: '#2b1d0d',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
        {year != null && (
          <Text
            style={{
              marginTop: 2,
              fontFamily: fonts.body,
              fontSize: width * 0.045,
              color: '#6a5433',
            }}
          >
            {year}
          </Text>
        )}
        <View style={{ flex: 1 }} />
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: width * 0.05,
            color: 'rgba(43,29,13,0.5)',
            letterSpacing: 2,
          }}
        >
          SHELFED
        </Text>
      </View>
    </View>
  );
}

/** Non-interactive overlays, positioned on the poster (used in the viewer). */
export function StaticOverlays({
  overlays,
  width,
  height,
}: {
  overlays: Overlay[];
  width: number;
  height: number;
}) {
  return (
    <>
      {overlays.map((o) => (
        <View key={o.id} style={styles.layer} pointerEvents="none">
          <View
            style={{
              transform: [
                { translateX: o.tx * width },
                { translateY: o.ty * height },
                { scale: o.scale },
              ],
            }}
          >
            <OverlayContent overlay={o} canvasW={width} />
          </View>
        </View>
      ))}
    </>
  );
}

/** A single draggable + pinch-scalable overlay used inside the composer. */
export function EditableOverlay({
  overlay,
  canvasW,
  canvasH,
  selected,
  onSelect,
  onEditText,
  onChange,
}: {
  overlay: Overlay;
  canvasW: number;
  canvasH: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onEditText: (id: string) => void;
  onChange: (id: string, patch: { tx?: number; ty?: number; scale?: number }) => void;
}) {
  const tx = useSharedValue(overlay.tx * canvasW);
  const ty = useSharedValue(overlay.ty * canvasH);
  const scale = useSharedValue(overlay.scale);
  const sTx = useSharedValue(0);
  const sTy = useSharedValue(0);
  const sScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      sTx.value = tx.value;
      sTy.value = ty.value;
      runOnJS(onSelect)(overlay.id);
    })
    .onUpdate((e) => {
      tx.value = sTx.value + e.translationX;
      ty.value = sTy.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(onChange)(overlay.id, { tx: tx.value / canvasW, ty: ty.value / canvasH });
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      sScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.min(6, Math.max(0.3, sScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(onChange)(overlay.id, { scale: scale.value });
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onSelect)(overlay.id);
      if (overlay.kind === 'text') runOnJS(onEditText)(overlay.id);
    });

  const gesture = Gesture.Simultaneous(pan, pinch, tap);
  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.layer} pointerEvents="box-none">
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.editItem, selected && styles.selected, aStyle]}>
          <OverlayContent overlay={overlay} canvasW={canvasW} />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#00000010',
  },
  editItem: {
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
  },
  selected: {
    borderColor: 'rgba(255,255,255,0.9)',
    borderStyle: 'dashed',
  },
  text: {
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
