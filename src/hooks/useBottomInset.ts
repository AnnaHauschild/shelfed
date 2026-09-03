import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Bottom padding that clears the home indicator and the Android navigation bar.
 *
 * There is a floor rather than a plain inset because some Android devices report
 * `insets.bottom` as 0 under edge-to-edge, which put buttons underneath the
 * system bar. Keep this the single place that number is decided.
 */
export function useBottomInset(extra = 0): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 0) + extra;
}
