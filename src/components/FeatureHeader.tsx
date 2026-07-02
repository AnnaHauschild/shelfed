import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, spacing } from '@/theme';

// Warm dark-wood band with the "Shelfed" title, a hanging lamp, a small potted
// plant, and a row of standing book spines. Sits at the top of screens as the
// signature visual carried over from the Play Store feature graphic.
export function FeatureHeader({
  height,
  topInset,
  title = 'Shelfed',
  tagline,
}: {
  height: number;
  topInset: number;
  title?: string;
  tagline?: string;
}) {
  return (
    <View style={[styles.featureHeader, { height }]} pointerEvents="none">
      <LinearGradient
        colors={['#3e2410', '#28180b', '#1a0e05']}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.featureRow, { paddingTop: topInset + spacing.md }]}>
        <View style={styles.featureText}>
          <Text style={styles.brand}>{title}</Text>
          {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
        </View>
        <View style={styles.plantWrap}>
          <View style={styles.plantLeaf1} />
          <View style={styles.plantLeaf2} />
          <View style={styles.plantLeaf3} />
          <View style={styles.plantPot} />
        </View>
        <View style={styles.featureBooks}>
          {FEATURE_SPINES.map((s, i) => (
            <View
              key={i}
              style={{
                width: s.w,
                height: s.h,
                backgroundColor: s.color,
                marginLeft: 2,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View style={styles.spineHighlight} />
              {s.band ? <View style={styles.spineBand} /> : null}
              <LinearGradient
                colors={['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.28)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.hangingLamp, { top: topInset - 4 }]}>
        <View style={styles.hangingGlow} />
        <View style={styles.hangingCord} />
        <View style={styles.hangingShade} />
      </View>

      <View style={styles.featurePlank} />
    </View>
  );
}

const FEATURE_SPINES = [
  { color: '#a7563d', w: 20, h: 128, band: true },
  { color: '#5e7a3c', w: 24, h: 148, band: true },
  { color: '#3f6079', w: 22, h: 138, band: true },
  { color: '#d8a548', w: 20, h: 120, band: false },
  { color: '#8a5a2b', w: 24, h: 158, band: true },
  { color: '#2c4a3a', w: 22, h: 140, band: true },
];

const styles = StyleSheet.create({
  featureHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  featureRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    paddingLeft: 14,
  },
  featureBooks: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  spineHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 240, 200, 0.4)',
  },
  spineBand: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: '20%',
    height: 2,
    backgroundColor: '#d8a548',
    opacity: 0.9,
  },
  featurePlank: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 14,
    backgroundColor: '#5a3618',
    borderTopWidth: 3,
    borderTopColor: '#8a5828',
    borderBottomWidth: 2,
    borderBottomColor: '#1a0e05',
  },
  hangingLamp: {
    position: 'absolute',
    left: 96,
    width: 64,
    alignItems: 'center',
    overflow: 'visible',
  },
  hangingGlow: {
    position: 'absolute',
    left: 32 - 100,
    top: 30,
    width: 200,
    height: 120,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 220, 130, 0.09)',
  },
  hangingCord: {
    width: 2,
    height: 20,
    backgroundColor: '#6a4020',
  },
  hangingShade: {
    width: 64,
    height: 32,
    backgroundColor: '#f0d28c',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  plantWrap: {
    width: 44,
    height: 130,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  plantPot: {
    width: 34,
    height: 20,
    backgroundColor: '#7a4a22',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  plantLeaf1: {
    position: 'absolute',
    left: 3,
    bottom: 12,
    width: 17,
    height: 32,
    borderRadius: 17,
    backgroundColor: '#4f6b35',
    transform: [{ rotate: '-32deg' }],
  },
  plantLeaf2: {
    position: 'absolute',
    right: 3,
    bottom: 14,
    width: 17,
    height: 38,
    borderRadius: 17,
    backgroundColor: '#7a9658',
    transform: [{ rotate: '28deg' }],
  },
  plantLeaf3: {
    position: 'absolute',
    left: 14,
    bottom: 20,
    width: 16,
    height: 30,
    borderRadius: 16,
    backgroundColor: '#4f6b35',
    transform: [{ rotate: '5deg' }],
  },
  brand: {
    color: colors.paper,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
    fontWeight: 'bold',
    fontSize: 38,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  tagline: {
    color: colors.textOnDarkMuted,
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 0.2,
    marginTop: spacing.xs,
  },
});
