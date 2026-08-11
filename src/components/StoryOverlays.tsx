import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { CaptionStyle, Sticker, TextVariant } from '@/api/posts';
import { fonts } from '@/theme';

// Poster aspect (portrait 2:3): height / width.
export const POSTER_RATIO = 1.5;

function hashInt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

// Curated, cinematic background tints — each film gets a distinct but tasteful
// one (deterministic). NOTE: not sampled from the poster pixels (that needs a
// native module / dev build); this just avoids random rainbow hues.
const BG_TINTS = [
  '#f3e9d6', '#f1dfe0', '#dfe8db', '#dde6ef', '#e7e0ef', '#f6e2d3',
  '#d9ece4', '#ece3cf', '#efdde2', '#dce9f0', '#f6e4cf', '#e6e2da',
];

// How much to push the tints away from grey (chroma boost). Tweak to taste.
const SAT_BOOST = 0.13;

/** Increase a hex colour's saturation by `amount` (keeps luminance ~constant). */
function saturate(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const f = 1 + amount;
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const nr = cl(luma + (r - luma) * f);
  const ng = cl(luma + (g - luma) * f);
  const nb = cl(luma + (b - luma) * f);
  return `#${((1 << 24) | (nr << 16) | (ng << 8) | nb).toString(16).slice(1)}`;
}

/** Per-film palette: a light background tint + a dark ink for text. */
export function storyPalette(seed: string): { bg: string; ink: string } {
  return {
    bg: saturate(BG_TINTS[hashInt(seed || 'shelfed') % BG_TINTS.length], SAT_BOOST),
    ink: '#2a2018',
  };
}

/** Text style for the caption (comment) under the poster, per chosen style. */
export function captionTextStyle(
  style: CaptionStyle,
  ink: string,
  size: number,
): TextStyle {
  if (style === 'loud') {
    return {
      fontFamily: fonts.display,
      fontSize: size * 1.15,
      color: ink,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1,
    };
  }
  if (style === 'quote') {
    return {
      fontFamily: fonts.body,
      fontSize: size,
      color: ink,
      textAlign: 'center',
      fontStyle: 'italic',
    };
  }
  return { fontFamily: fonts.body, fontSize: size, color: ink, textAlign: 'center' };
}

/** Wraps the caption in typographic quotes for the 'quote' style. */
export function captionText(style: CaptionStyle, text: string): string {
  return style === 'quote' ? `“${text}”` : text;
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

/** Text colours offered in the sticker editor. */
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

// Sticker base size as a fraction of the poster width (scaled further by the
// per-sticker `scale`), so a sticker looks the same on any screen size.
const TEXT_FRAC = 0.09;
const EMOJI_FRAC = 0.14;
const GIF_FRAC = 0.42;

/** Ready-made label stickers (warm, filmic). Tap to drop one on the poster. */
export const LABEL_PRESETS: {
  text: string;
  variant: TextVariant;
  color: string;
  bg?: string;
  font: string;
  rotation?: number;
}[] = [
  { text: 'MUST WATCH', variant: 'stamp', color: '#c1443b', font: 'display', rotation: -0.12 },
  { text: 'MASTERPIECE', variant: 'pill', bg: '#d99a2b', color: '#2a2018', font: 'display' },
  { text: '❤ FAVORITE', variant: 'pill', bg: '#c1443b', color: '#fff5ee', font: 'caps' },
  { text: 'HIDDEN GEM', variant: 'stamp', color: '#3f6b4f', font: 'display', rotation: -0.1 },
  { text: 'REWATCH', variant: 'stamp', color: '#2a2018', font: 'display', rotation: 0.08 },
  { text: '10/10', variant: 'pill', bg: '#2a2018', color: '#f3ece0', font: 'display' },
  { text: 'SO GOOD', variant: 'stamp', color: '#c1443b', font: 'display', rotation: -0.08 },
  { text: 'CLASSIC', variant: 'stamp', color: '#2a2018', font: 'display', rotation: 0.1 },
  { text: 'SPOILERS!', variant: 'pill', bg: '#c1443b', color: '#fff5ee', font: 'caps' },
  { text: 'UNDERRATED', variant: 'stamp', color: '#8a5a2b', font: 'display', rotation: -0.1 },
];

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
  if (overlay.kind === 'gif') {
    const w = GIF_FRAC * canvasW;
    return (
      <Image
        source={{ uri: overlay.url }}
        style={{ width: w, height: w / overlay.aspect, borderRadius: 8 }}
        contentFit="contain"
      />
    );
  }
  const fontSize = TEXT_FRAC * canvasW;
  const variant = overlay.variant ?? 'plain';
  const base: TextStyle = {
    fontFamily: fontFamilyFor(overlay.font),
    color: overlay.color,
    fontSize,
    textAlign: 'center',
    maxWidth: canvasW * 0.92,
  };
  if (variant === 'pill') {
    return (
      <View
        style={{
          backgroundColor: overlay.bg ?? '#c1443b',
          paddingHorizontal: fontSize * 0.72,
          paddingVertical: fontSize * 0.32,
          borderRadius: fontSize * 1.3,
        }}
      >
        <Text style={[base, { textTransform: 'uppercase', letterSpacing: 1 }]}>
          {overlay.text}
        </Text>
      </View>
    );
  }
  if (variant === 'stamp') {
    return (
      <View
        style={{
          borderWidth: Math.max(2, fontSize * 0.09),
          borderColor: overlay.color,
          paddingHorizontal: fontSize * 0.5,
          paddingVertical: fontSize * 0.22,
          borderRadius: fontSize * 0.28,
        }}
      >
        <Text style={[base, { textTransform: 'uppercase', letterSpacing: 2 }]}>
          {overlay.text}
        </Text>
      </View>
    );
  }
  return <Text style={[styles.text, base]}>{overlay.text}</Text>;
}

/** Non-interactive stickers, positioned on the poster (used in the viewer). */
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

/** A single draggable + pinch-scalable sticker used inside the composer. */
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
