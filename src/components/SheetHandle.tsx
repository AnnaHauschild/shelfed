import { useEffect, type ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type PanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useThemeChrome } from '@/context/ThemeProvider';
import { spacing } from '@/theme';

const SCREEN_H = Dimensions.get('window').height;

/** Past this drag distance (or flick speed) the sheet closes instead of springing back. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 900;

/**
 * Drag-to-dismiss for a bottom sheet. Every sheet uses this so the pull-down
 * distance, the grab area and the animation are identical everywhere.
 */
export function useSheetDismiss(visible: boolean, onClose: () => void) {
  const translateY = useSharedValue(0);

  // A Modal keeps its children mounted, so without this a sheet that was
  // dragged away would reopen already pushed off screen.
  useEffect(() => {
    if (visible) translateY.value = 0;
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(SCREEN_H, { duration: 220 }, (done) => {
          if (done) runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

  return { sheetStyle, gesture };
}

interface Props {
  gesture: PanGesture;
  /** Rendered under the bar and draggable too, for sheets with a fixed header. */
  children?: ReactNode;
}

/** The grab bar at the top of a sheet, sized so it is easy to hit with a thumb. */
export function SheetHandle({ gesture, children }: Props) {
  const chrome = useThemeChrome();
  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.grabZone}>
        <View style={[styles.handle, { backgroundColor: chrome.border }]} />
        {children}
      </View>
    </GestureDetector>
  );
}

/** Re-exported so sheets do not each import Animated just for the wrapper. */
export const SheetView = Animated.View;

const styles = StyleSheet.create({
  grabZone: {
    // Generous on purpose: the visible bar is only 4px tall, the touch target
    // must not be.
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
});
