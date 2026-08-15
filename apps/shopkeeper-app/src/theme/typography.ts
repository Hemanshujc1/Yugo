import { Fonts } from '../constants/theme';

export const fontFamilies = Fonts;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: 18,
  normal: 24,
  relaxed: 30,
  loose: 44,
  title: 52,
} as const;

export const typography = {
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
} as const;

export type Typography = typeof typography;
