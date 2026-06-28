import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@/theme';

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
  const layout = useMemo(() => buildLayout(columns, rows), [columns, rows]);

  if (variant === 'wall') {
    return (
      <View style={styles.root} pointerEvents="none">
        <LinearGradient
          colors={['#5a3618', '#3e2410', '#28180b']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Hanging lamp in the upper-right — casts a soft warm pool. */}
        <View style={styles.hangingLamp} pointerEvents="none">
          <View style={styles.hangingCord} />
          <View style={styles.hangingShade} />
          <View style={styles.hangingGlow} />
        </View>
        {/* Wide soft pool of lamplight on the wall. */}
        <View style={styles.lampPool} pointerEvents="none" />
        {/* Small trailing plant hanging from the upper-left of the wall. */}
        <View style={styles.hangingPlant} pointerEvents="none">
          <View style={styles.plantPot} />
          <View style={[styles.plantLeaf, styles.plantLeaf1]} />
          <View style={[styles.plantLeaf, styles.plantLeaf2]} />
          <View style={[styles.plantLeaf, styles.plantLeaf3]} />
          <View style={[styles.plantLeaf, styles.plantLeaf4]} />
          <View style={[styles.plantLeaf, styles.plantLeaf5]} />
          <View style={[styles.plantLeaf, styles.plantLeaf6]} />
        </View>
        {/* Subtle vignette to keep foreground content readable. */}
        <LinearGradient
          colors={[
            `rgba(15, 9, 4, ${dim * 0.6})`,
            `rgba(15, 9, 4, ${dim * 1.0})`,
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
        {content.kind === 'leaf' && <Leaves seed={content.seed} />}
        {content.kind === 'photo' && <Photo seed={content.seed} />}
      </View>
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

/** A trailing-vine plant with a few overlapping leaves. */
function Leaves({ seed }: { seed: number }) {
  return (
    <View style={styles.leaves}>
      {Array.from({ length: 5 }).map((_, i) => {
        const left = 10 + rand(seed + i * 13) * 70;
        const top = rand(seed + i * 19) * 60;
        const size = 10 + rand(seed + i * 7) * 8;
        const tone = i % 2 === 0 ? LEAF_GREEN : LEAF_GREEN_LIGHT;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size * 1.4,
              borderRadius: size,
              backgroundColor: tone,
              transform: [{ rotate: `${rand(seed + i) * 360}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}

/** A framed photo / mini poster as a coloured rectangle with a thin border. */
function Photo({ seed }: { seed: number }) {
  const colorIdx = Math.floor(rand(seed + 5) * BOOK_PALETTE.length);
  return (
    <View style={styles.photoWrap}>
      <View
        style={[styles.photo, { backgroundColor: BOOK_PALETTE[colorIdx] }]}
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
  leaves: {
    flex: 1,
  },
  photoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '78%',
    height: '78%',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#f3e7d2',
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
  // --- 'wall' variant: small trailing plant in the upper-left corner. ---
  hangingPlant: {
    position: 'absolute',
    top: 0,
    left: 28,
    width: 70,
    height: 120,
  },
  plantPot: {
    position: 'absolute',
    top: 0,
    left: 18,
    width: 34,
    height: 18,
    backgroundColor: '#5a3a22',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  plantLeaf: {
    position: 'absolute',
    width: 14,
    height: 22,
    borderRadius: 14,
    backgroundColor: '#4f6b35',
  },
  plantLeaf1: { top: 14, left: 6, transform: [{ rotate: '-35deg' }], backgroundColor: '#7a9658' },
  plantLeaf2: { top: 22, left: 44, transform: [{ rotate: '40deg' }] },
  plantLeaf3: { top: 38, left: 2, transform: [{ rotate: '-55deg' }] },
  plantLeaf4: { top: 50, left: 50, transform: [{ rotate: '60deg' }], backgroundColor: '#7a9658' },
  plantLeaf5: { top: 68, left: 10, transform: [{ rotate: '-30deg' }] },
  plantLeaf6: { top: 86, left: 38, transform: [{ rotate: '50deg' }], backgroundColor: '#7a9658' },
});
