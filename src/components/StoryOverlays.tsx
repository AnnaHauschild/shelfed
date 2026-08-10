import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CardLayout, Sticker } from '@/api/posts';
import { fonts, radius } from '@/theme';
import { POSTER_SIZE } from '@/constants/config';
import { PosterImage } from './PosterImage';

// Story card aspect (portrait 9:16): height / width.
export const CARD_RATIO = 16 / 9;
export const CARD_MIN_SCALE = 0.34;
export const DEFAULT_CARD: CardLayout = {
  id: 'card',
  kind: 'card',
  tx: 0,
  ty: 0,
  scale: 1,
};

function hslToHex(h: number, s: number, l: number): string {
  const sf = s / 100;
  const lf = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sf * Math.min(lf, 1 - lf);
  const f = (n: number) => {
    const c = lf - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hashHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Per-film palette (same hue): a light background + a darker card. */
export function storyPalette(seed: string): {
  bg: string;
  card: string;
  text: string;
} {
  const hue = hashHue(seed || 'shelfed');
  return {
    bg: hslToHex(hue, 55, 82),
    card: hslToHex(hue, 42, 20),
    text: '#f3ece0',
  };
}

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
  overlay: Sticker;
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
  cardColor,
  textColor,
}: {
  title: string | null;
  posterPath: string | null;
  year: number | null;
  width: number;
  height: number;
  cardColor: string;
  textColor: string;
}) {
  const pad = width * 0.05;
  const maxPosterH = height * 0.66;
  let posterW = width - pad * 2;
  let posterH = posterW * 1.5;
  if (posterH > maxPosterH) {
    posterH = maxPosterH;
    posterW = posterH / 1.5;
  }
  return (
    <View style={{ width, height, backgroundColor: cardColor }}>
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.22)']}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          paddingHorizontal: pad,
          paddingTop: height * 0.05,
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
            marginTop: height * 0.028,
            fontFamily: fonts.display,
            fontSize: width * 0.075,
            color: textColor,
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
              fontSize: width * 0.042,
              color: textColor,
              opacity: 0.7,
            }}
          >
            {year}
          </Text>
        )}
      </View>
    </View>
  );
}

/** The film card positioned + scaled on the stage (non-interactive, viewer). */
export function StaticCard({
  layout,
  stageW,
  stageH,
  title,
  posterPath,
  year,
  cardColor,
  textColor,
}: {
  layout: CardLayout;
  stageW: number;
  stageH: number;
  title: string | null;
  posterPath: string | null;
  year: number | null;
  cardColor: string;
  textColor: string;
}) {
  return (
    <View style={styles.layer} pointerEvents="none">
      <View
        style={[
          styles.cardShadow,
          {
            width: stageW,
            height: stageH,
            backgroundColor: cardColor,
            transform: [
              { translateX: layout.tx * stageW },
              { translateY: layout.ty * stageH },
              { scale: layout.scale },
            ],
          },
        ]}
      >
        <View style={styles.cardClip}>
          <StoryCard
            title={title}
            posterPath={posterPath}
            year={year}
            width={stageW}
            height={stageH}
            cardColor={cardColor}
            textColor={textColor}
          />
        </View>
      </View>
    </View>
  );
}

/** The film card with pinch-to-resize + drag (composer). */
export function EditableCard({
  layout,
  stageW,
  stageH,
  title,
  posterPath,
  year,
  cardColor,
  textColor,
  onChange,
}: {
  layout: CardLayout;
  stageW: number;
  stageH: number;
  title: string | null;
  posterPath: string | null;
  year: number | null;
  cardColor: string;
  textColor: string;
  onChange: (patch: { tx?: number; ty?: number; scale?: number }) => void;
}) {
  const tx = useSharedValue(layout.tx * stageW);
  const ty = useSharedValue(layout.ty * stageH);
  const scale = useSharedValue(layout.scale);
  const sTx = useSharedValue(0);
  const sTy = useSharedValue(0);
  const sScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      sTx.value = tx.value;
      sTy.value = ty.value;
    })
    .onUpdate((e) => {
      // Keep the card inside the stage (can't move at full size).
      const maxX = ((1 - scale.value) / 2) * stageW;
      const maxY = ((1 - scale.value) / 2) * stageH;
      tx.value = Math.min(maxX, Math.max(-maxX, sTx.value + e.translationX));
      ty.value = Math.min(maxY, Math.max(-maxY, sTy.value + e.translationY));
    })
    .onEnd(() => {
      runOnJS(onChange)({ tx: tx.value / stageW, ty: ty.value / stageH });
    });

  const pinch = Gesture.Pinch()
    .onBegin(() => {
      sScale.value = scale.value;
    })
    .onUpdate((e) => {
      const s = Math.min(1, Math.max(CARD_MIN_SCALE, sScale.value * e.scale));
      scale.value = s;
      // Re-clamp position to the new (smaller/larger) allowed range.
      const maxX = ((1 - s) / 2) * stageW;
      const maxY = ((1 - s) / 2) * stageH;
      tx.value = Math.min(maxX, Math.max(-maxX, tx.value));
      ty.value = Math.min(maxY, Math.max(-maxY, ty.value));
    })
    .onEnd(() => {
      runOnJS(onChange)({
        scale: scale.value,
        tx: tx.value / stageW,
        ty: ty.value / stageH,
      });
    });

  const gesture = Gesture.Simultaneous(pan, pinch);
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
        <Animated.View
          style={[
            styles.cardShadow,
            { width: stageW, height: stageH, backgroundColor: cardColor },
            aStyle,
          ]}
        >
          <View style={styles.cardClip}>
            <StoryCard
              title={title}
              posterPath={posterPath}
              year={year}
              width={stageW}
              height={stageH}
              cardColor={cardColor}
              textColor={textColor}
            />
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/** Non-interactive overlays, positioned on the poster (used in the viewer). */
export function StaticOverlays({
  overlays,
  width,
  height,
}: {
  overlays: Sticker[];
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
                { rotate: `${o.rotation ?? 0}rad` },
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
  overlay: Sticker;
  canvasW: number;
  canvasH: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onEditText: (id: string) => void;
  onChange: (
    id: string,
    patch: { tx?: number; ty?: number; scale?: number; rotation?: number },
  ) => void;
}) {
  const tx = useSharedValue(overlay.tx * canvasW);
  const ty = useSharedValue(overlay.ty * canvasH);
  const scale = useSharedValue(overlay.scale);
  const rot = useSharedValue(overlay.rotation ?? 0);
  const sTx = useSharedValue(0);
  const sTy = useSharedValue(0);
  const sScale = useSharedValue(1);
  const sRot = useSharedValue(0);

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

  const rotate = Gesture.Rotation()
    .onBegin(() => {
      sRot.value = rot.value;
    })
    .onUpdate((e) => {
      rot.value = sRot.value + e.rotation;
    })
    .onEnd(() => {
      runOnJS(onChange)(overlay.id, { rotation: rot.value });
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onSelect)(overlay.id);
      if (overlay.kind === 'text') runOnJS(onEditText)(overlay.id);
    });

  const gesture = Gesture.Simultaneous(pan, pinch, rotate, tap);
  const aStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}rad` },
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
    backgroundColor: '#00000010',
  },
  cardShadow: {
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  cardClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  editItem: {
    minWidth: 64,
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 10,
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
