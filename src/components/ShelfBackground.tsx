import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ShelfTheme, useTheme } from '@/context/ThemeProvider';
import { colors } from '@/theme';

interface Props {
  /** Number of cubby columns. Default 4. */
  columns?: number;
  /** Number of cubby rows. Default 5. */
  rows?: number;
  /** 0..1 — how much the whole wall is dimmed so foreground content pops. */
  dim?: number;
  /**
   * 'cubbies' (default) renders the full bookshelf grid; 'wall' renders only
   * the warm wood backdrop with a single hanging lamp — a calmer surface for
   * screens like the Shelf where the actual book spines do the heavy lifting.
   */
  variant?: 'cubbies' | 'wall';
}

type ItemKind = 'book' | 'lamp' | 'leaf' | 'photo' | 'empty';

interface CubbyContent {
  kind: ItemKind;
  seed: number;
}

const BOOK_PALETTE = [
  '#a7563d', // terracotta
  '#7a3527', // brick
  '#5e7a3c', // sage
  '#3f6079', // dusty teal
  '#d8a548', // brass
  '#8a5a2b', // cinnamon
  '#b89b73', // taupe
  '#2c4a3a', // forest
];

const LEAF_GREEN = '#4f6b35';
const LEAF_GREEN_LIGHT = '#7a9658';

/** Deterministic pseudo-random in [0, 1) from a small integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/** Spread item kinds across the grid so it looks curated, not noisy. */
function buildLayout(cols: number, rowsCount: number): CubbyContent[][] {
  const grid: CubbyContent[][] = [];
  let i = 0;
  for (let r = 0; r < rowsCount; r++) {
    const row: CubbyContent[] = [];
    for (let c = 0; c < cols; c++) {
      const roll = rand(i * 7 + 3);
      let kind: ItemKind;
      if (roll < 0.55) kind = 'book';
      else if (roll < 0.7) kind = 'lamp';
      else if (roll < 0.82) kind = 'leaf';
      else if (roll < 0.92) kind = 'photo';
      else kind = 'empty';
      row.push({ kind, seed: i });
      i++;
    }
    grid.push(row);
  }
  return grid;
}

/** Image-based themes bake the whole scene (incl. their own header) into a
 *  single artwork; the app renders it full-bleed with a dimming scrim. */
const THEME_IMAGES: Partial<Record<ShelfTheme, number>> = {
  scifi: require('../../assets/shelf-themes/scifi.png'),
  minimal: require('../../assets/shelf-themes/minimal.png'),
  vintage: require('../../assets/shelf-themes/vintage.png'),
};

/** Per-theme palette for the simple lamp-lit 'wall' backdrop used on the shelf
 *  screens: wall gradient, lamp cord/shade/glow, ambient pool and the vignette
 *  RGB triplet. Keeps the shelf screens calm while echoing the chosen theme. */
const WALL_THEMES: Record<
  ShelfTheme,
  {
    wood: [string, string, string];
    cord: string;
    shade: string;
    glow: string;
    pool: string;
    vignette: string;
  }
> = {
  classic: {
    wood: ['#5a3618', '#3e2410', '#28180b'],
    cord: '#2a1808',
    shade: '#f0d28c',
    glow: 'rgba(255, 210, 120, 0.30)',
    pool: 'rgba(255, 200, 110, 0.10)',
    vignette: '15, 9, 4',
  },
  scifi: {
    wood: ['#1b2b4a', '#111d38', '#070d1c'],
    cord: '#0a1526',
    shade: '#f7f3cf',
    glow: 'rgba(240, 240, 170, 0.40)',
    pool: 'rgba(150, 200, 255, 0.10)',
    vignette: '4, 8, 18',
  },
  minimal: {
    wood: ['#6b5f50', '#564b3e', '#3f362c'],
    cord: '#3a332b',
    shade: '#f4e8d2',
    glow: 'rgba(255, 236, 200, 0.28)',
    pool: 'rgba(255, 240, 210, 0.10)',
    vignette: '46, 39, 30',
  },
  vintage: {
    wood: ['#4a2f18', '#33200f', '#20130a'],
    cord: '#241407',
    shade: '#9fca94',
    glow: 'rgba(170, 215, 160, 0.24)',
    pool: 'rgba(255, 214, 140, 0.10)',
    vignette: '20, 13, 8',
  },
};

/**
 * Stylised "Tiny Desk" bookshelf wall used as a soft background behind the
 * swipe deck. Pure RN views + gradients — no images required.
 */
export function ShelfBackground({
  columns = 4,
  rows = 5,
  dim = 0.55,
  variant = 'cubbies',
}: Props) {
  const { theme } = useTheme();
  const layout = useMemo(() => buildLayout(columns, rows), [columns, rows]);

  const themeImage = THEME_IMAGES[theme];
  // Image themes fill Discover/Search (the 'cubbies' surface). The shelf
  // screens ('wall') keep a simple lamp-lit wall, recoloured per theme below.
  if (themeImage != null && variant !== 'wall') {
    return (
      <ImageThemeBackground source={themeImage} dim={dim} variant={variant} />
    );
  }

  if (variant === 'wall') {
    const w = WALL_THEMES[theme] ?? WALL_THEMES.classic;
    return (
      <View style={styles.root} pointerEvents="none">
        <LinearGradient
          colors={w.wood}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Hanging lamp in the upper-right — casts a soft pool of light. */}
        <View style={styles.hangingLamp} pointerEvents="none">
          <View style={[styles.hangingCord, { backgroundColor: w.cord }]} />
          <View style={[styles.hangingShade, { backgroundColor: w.shade }]} />
          <View style={[styles.hangingGlow, { backgroundColor: w.glow }]} />
        </View>
        {/* Wide soft pool of lamplight on the wall. */}
        <View
          style={[styles.lampPool, { backgroundColor: w.pool }]}
          pointerEvents="none"
        />
        {/* Subtle vignette to keep foreground content readable. */}
        <LinearGradient
          colors={[
            `rgba(${w.vignette}, ${dim * 0.6})`,
            `rgba(${w.vignette}, ${dim * 1.0})`,
          ]}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <View style={styles.root} pointerEvents="none">
      {/* Warm wood wall tone behind the cubbies. */}
      <LinearGradient
        colors={['#7a4a22', '#5a3618', '#3e2410']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.grid}>
        {layout.map((row, r) => (
          <View key={`r${r}`} style={styles.row}>
            {row.map((cell, c) => (
              <Cubby key={`c${r}-${c}`} content={cell} />
            ))}
          </View>
        ))}
      </View>
      {/* Vignette so the foreground card has room to breathe. */}
      <LinearGradient
        colors={[
          `rgba(28, 18, 8, ${dim * 0.7})`,
          `rgba(28, 18, 8, ${dim})`,
          `rgba(28, 18, 8, ${dim * 0.7})`,
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function Cubby({ content }: { content: CubbyContent }) {
  return (
    <View style={styles.cubby}>
      <View style={styles.cubbyInner}>
        {content.kind === 'book' && <Books seed={content.seed} />}
        {content.kind === 'lamp' && <Lamp />}
        {content.kind === 'leaf' && <Leaves />}
        {content.kind === 'photo' && <Photo />}
        {content.kind === 'empty' && <StackedBooks seed={content.seed} />}
      </View>
    </View>
  );
}

/** A small stack of books lying flat — fills an otherwise empty cubby. */
const STACK_COLORS = ['#7a3527', '#3f6079', '#5e7a3c', '#8a5a2b'];
function StackedBooks({ seed }: { seed: number }) {
  return (
    <View style={styles.stack}>
      {STACK_COLORS.map((color, i) => (
        <View
          key={i}
          style={{
            width: `${62 + rand(seed + i * 5) * 24}%`,
            height: 7,
            borderRadius: 2,
            marginTop: 3,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}

/** A row of standing book spines of varying widths/heights. */
function Books({ seed }: { seed: number }) {
  const count = 4 + Math.floor(rand(seed + 11) * 4); // 4..7
  return (
    <View style={styles.books}>
      {Array.from({ length: count }).map((_, i) => {
        const colorIdx = Math.floor(rand(seed * 31 + i) * BOOK_PALETTE.length);
        const widthPct = 9 + rand(seed + i * 17) * 8; // 9..17%
        const heightPct = 65 + rand(seed + i * 23) * 30; // 65..95%
        const tilt = rand(seed + i * 41) < 0.12 ? (rand(seed + i) - 0.5) * 8 : 0;
        return (
          <View
            key={i}
            style={{
              width: `${widthPct}%`,
              height: `${heightPct}%`,
              backgroundColor: BOOK_PALETTE[colorIdx],
              marginHorizontal: 0.5,
              borderRadius: 1,
              transform: [{ rotate: `${tilt}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}

/** A small warm lamp glow against a darker shade. */
function Lamp() {
  return (
    <View style={styles.lampWrap}>
      <View style={styles.lampShade} />
      <View style={styles.lampGlow} />
      <View style={styles.lampBase} />
    </View>
  );
}

/** A hanging planter: a ring + two ropes from the shelf top down to a pot in
 *  the middle of the cubby, a small leaf tuft, and two vines trailing below. */
const POT_TUFT = [
  { left: 50, top: 28, w: 13, h: 20, rot: 0, tone: LEAF_GREEN },
  { left: 40, top: 31, w: 11, h: 17, rot: -32, tone: LEAF_GREEN_LIGHT },
  { left: 60, top: 31, w: 11, h: 17, rot: 32, tone: LEAF_GREEN },
];

function Leaves() {
  return (
    <View style={styles.plant}>
      {/* Hanger ring + two ropes fanning down to the pot rim. */}
      <View style={styles.hangRing} />
      <View style={[styles.hangRope, { transform: [{ rotate: '-22deg' }] }]} />
      <View style={[styles.hangRope, { transform: [{ rotate: '22deg' }] }]} />
      {/* Planter hanging in the middle of the cubby. */}
      <View style={styles.potRim} />
      <View style={styles.potBody} />
      {/* A small tuft of leaves out of the pot. */}
      {POT_TUFT.map((t, i) => (
        <View
          key={i}
          style={[
            styles.tuftLeaf,
            {
              left: `${t.left}%`,
              top: `${t.top}%`,
              width: t.w,
              height: t.h,
              marginLeft: -t.w / 2,
              borderRadius: t.w / 2,
              backgroundColor: t.tone,
              transform: [{ rotate: `${t.rot}deg` }],
            },
          ]}
        />
      ))}
      {/* Two vines trailing below the pot. */}
      {[42, 58].map((x) => (
        <View key={x} style={styles.vine}>
          <View style={[styles.vineStem, { left: `${x}%` }]} />
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.vineLeaf,
                {
                  left: `${x}%`,
                  top: `${56 + i * 11}%`,
                  backgroundColor: i % 2 ? LEAF_GREEN_LIGHT : LEAF_GREEN,
                  transform: [
                    { translateX: -5 },
                    { rotate: `${i % 2 ? 35 : -35}deg` },
                  ],
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

/** A small framed landscape picture (sky, horizon, sun). */
function Photo() {
  return (
    <View style={styles.photoWrap}>
      <View style={styles.photoFrame}>
        <View style={styles.photoScene}>
          <LinearGradient
            colors={['#d9b25a', '#e7cf86', '#6d8a3f', '#4f6b35']}
            locations={[0, 0.55, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.photoSun} />
        </View>
      </View>
    </View>
  );
}

// --- Image themes (sci-fi / minimal) -------------------------------------
function ImageThemeBackground({
  source,
  dim,
  variant,
}: {
  source: number;
  dim: number;
  variant: 'cubbies' | 'wall';
}) {
  // Shelf ("wall") screens render the user's own spines on top, so dim a touch
  // more there to keep them legible over the artwork.
  const s = variant === 'wall' ? Math.min(dim + 0.18, 0.92) : dim;
  return (
    <View style={styles.root} pointerEvents="none">
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="fill"
        transition={200}
      />
      <LinearGradient
        colors={[
          `rgba(6, 5, 10, ${(s * 0.55).toFixed(3)})`,
          `rgba(6, 5, 10, ${(s * 0.8).toFixed(3)})`,
        ]}
        locations={[0, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const CUBBY_BG = '#2a1808';
const FRAME_COLOR = '#7a4a22';

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  grid: {
    flex: 1,
    padding: 6,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cubby: {
    flex: 1,
    padding: 4,
    backgroundColor: FRAME_COLOR,
    borderColor: '#3e2410',
    borderWidth: 1,
  },
  cubbyInner: {
    flex: 1,
    backgroundColor: CUBBY_BG,
    borderRadius: 1,
    overflow: 'hidden',
    padding: 4,
    justifyContent: 'flex-end',
  },
  books: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
  },
  stack: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 2,
  },
  lampWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
  },
  lampShade: {
    width: '55%',
    height: '32%',
    backgroundColor: '#f0d28c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  lampGlow: {
    position: 'absolute',
    width: '90%',
    height: '70%',
    bottom: '15%',
    backgroundColor: 'rgba(255, 210, 120, 0.32)',
    borderRadius: 100,
  },
  lampBase: {
    width: '8%',
    height: '40%',
    backgroundColor: '#3a2410',
  },
  plant: {
    flex: 1,
  },
  vine: {
    ...StyleSheet.absoluteFillObject,
  },
  hangRing: {
    position: 'absolute',
    top: '1%',
    left: '50%',
    width: 7,
    height: 7,
    marginLeft: -3.5,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#4a3420',
    backgroundColor: 'transparent',
  },
  hangRope: {
    position: 'absolute',
    top: '4%',
    left: '50%',
    width: 1.5,
    height: '34%',
    marginLeft: -0.75,
    backgroundColor: '#4a3420',
    transformOrigin: 'center top',
  },
  tuftLeaf: {
    position: 'absolute',
    transformOrigin: 'center bottom',
  },
  potRim: {
    position: 'absolute',
    top: '38%',
    left: '28%',
    right: '28%',
    height: 5,
    borderRadius: 2,
    backgroundColor: '#c06a40',
  },
  potBody: {
    position: 'absolute',
    top: '41%',
    left: '35%',
    right: '35%',
    height: '12%',
    backgroundColor: '#8a4327',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  vineStem: {
    position: 'absolute',
    top: '52%',
    width: 2,
    height: '30%',
    marginLeft: -1,
    backgroundColor: '#3f5a28',
  },
  vineLeaf: {
    position: 'absolute',
    width: 11,
    height: 15,
    borderRadius: 7,
  },
  photoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFrame: {
    width: '74%',
    height: '82%',
    backgroundColor: '#f3e7d2',
    borderWidth: 2,
    borderColor: '#6b4a2a',
    padding: 3,
  },
  photoScene: {
    flex: 1,
    overflow: 'hidden',
  },
  photoSun: {
    position: 'absolute',
    top: 3,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f8efd6',
  },
  // --- 'wall' variant: hanging lamp in the upper-right corner. ---
  hangingLamp: {
    position: 'absolute',
    top: 0,
    right: 24,
    alignItems: 'center',
  },
  hangingCord: {
    width: 2,
    height: 60,
    backgroundColor: '#2a1808',
  },
  hangingShade: {
    width: 78,
    height: 46,
    backgroundColor: '#f0d28c',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  hangingGlow: {
    position: 'absolute',
    top: 50,
    width: 140,
    height: 90,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 210, 120, 0.30)',
  },
  lampPool: {
    position: 'absolute',
    top: 40,
    right: -40,
    width: 320,
    height: 320,
    borderRadius: 240,
    backgroundColor: 'rgba(255, 200, 110, 0.10)',
  },
});
