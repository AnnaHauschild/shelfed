import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme';

/** A slowly spinning camera-iris icon used as an on-theme loading indicator. */
export function LoadingReel({
  size = 54,
  color = colors.amber,
}: {
  size?: number;
  color?: string;
}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2400, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Ionicons name="aperture" size={size} color={color} />
    </Animated.View>
  );
}
