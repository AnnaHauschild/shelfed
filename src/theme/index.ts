export { colors } from './colors';
export type { AppColors } from './colors';
export { fonts, fontMap } from './typography';

// Consistent spacing + corner-radius scale.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 14,
  xl: 22,
} as const;

// Plain-object equivalent of an absolute fill, spreadable inside StyleSheet.create.
export const absoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;
