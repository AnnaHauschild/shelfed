import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onStar: () => void;
  onHeart: () => void;
  isWatchlisted?: boolean;
  isFavorite?: boolean;
}

/**
 * Overlay buttons shown on the active swipe card:
 *  - Star  -> add to Watchlist (want to watch later)
 *  - Heart -> mark as Favorite (strong positive signal)
 *
 * Each button fills in (outline -> solid + tinted halo) and bounces when
 * toggled, giving immediate feedback that the tap registered. Independent of
 * the swipe gesture (which handles watched / skip).
 */
export function ActionButtons({
  onStar,
  onHeart,
  isWatchlisted = false,
  isFavorite = false,
}: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <IconButton
        accessibilityLabel="Add to watchlist"
        onPress={onStar}
        active={isWatchlisted}
        activeIcon="star"
        inactiveIcon="star-outline"
        color={colors.star}
      />
      <IconButton
        accessibilityLabel="Mark as favorite"
        onPress={onHeart}
        active={isFavorite}
        activeIcon="heart"
        inactiveIcon="heart-outline"
        color={colors.favorite}
      />
    </View>
  );
}

interface IconButtonProps {
  accessibilityLabel: string;
  onPress: () => void;
  active: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function IconButton({
  accessibilityLabel,
  onPress,
  active,
  activeIcon,
  inactiveIcon,
  color,
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 120 }),
      withSpring(1, { damping: 6 }),
    );
    onPress();
  };

  return (
    <AnimatedPressable
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={handlePress}
      style={[
        styles.button,
        active && { borderColor: color, backgroundColor: `${color}33` },
        animatedStyle,
      ]}
    >
      <Ionicons name={active ? activeIcon : inactiveIcon} size={26} color={color} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 12,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.scrim,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

