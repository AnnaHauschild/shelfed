import {
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';

/**
 * Named font roles used throughout the UI. Oswald (condensed) gives a
 * movie-poster feel for titles/labels; Special Elite is a typewriter face that
 * suits the retro rental-store body text.
 */
export const fonts = {
  display: 'Oswald_700Bold',
  heading: 'Oswald_600SemiBold',
  label: 'Oswald_500Medium',
  body: 'SpecialElite_400Regular',
} as const;

// Passed to expo-font's useFonts() in the root layout.
export const fontMap = {
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
  SpecialElite_400Regular,
};
