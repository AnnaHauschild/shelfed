import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';

/**
 * Named font roles used throughout the UI. Oswald (condensed) carries the
 * movie-poster feel across titles, labels and body copy alike; Special Elite
 * is kept purely as a decorative text style users can pick for a Story.
 */
export const fonts = {
  display: 'Oswald_700Bold',
  heading: 'Oswald_600SemiBold',
  label: 'Oswald_500Medium',
  body: 'Oswald_400Regular',
  typewriter: 'SpecialElite_400Regular',
} as const;

// Passed to expo-font's useFonts() in the root layout.
export const fontMap = {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
  SpecialElite_400Regular,
};
