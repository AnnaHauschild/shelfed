import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Lora_400Regular, Lora_500Medium } from '@expo-google-fonts/lora';

/**
 * Named font roles. Fraunces (warm characterful serif) carries titles and
 * display text — like a hand-set poster on a wood desk. Lora is a friendly
 * book serif for body copy. Inter handles small clean labels and chips.
 */
export const fonts = {
  display: 'Fraunces_700Bold',
  heading: 'Fraunces_600SemiBold',
  label: 'Inter_600SemiBold',
  body: 'Lora_400Regular',
} as const;

export const fontMap = {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Inter_500Medium,
  Inter_600SemiBold,
  Lora_400Regular,
  Lora_500Medium,
};
