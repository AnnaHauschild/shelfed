import { StyleSheet, Text } from 'react-native';
import { fonts, radius } from '@/theme';

interface Props {
  label: string;
  color: string;
  side: 'left' | 'right';
}

/**
 * A rubber-stamp style badge ("WATCHED" / "SKIP") overlaid on the card while
 * swiping. Purely visual — the parent animates its opacity based on drag.
 */
export function SwipeStamp({ label, color, side }: Props) {
  return (
    <Text
      style={[
        styles.stamp,
        { color, borderColor: color },
        side === 'right'
          ? { left: 20, transform: [{ rotate: '-14deg' }] }
          : { right: 20, transform: [{ rotate: '14deg' }] },
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: 'absolute',
    top: 36,
    fontFamily: fonts.display,
    fontSize: 38,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 4,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
});
