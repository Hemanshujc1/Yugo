import { BottomTabInset, MaxContentWidth, Spacing as ThemeSpacing } from '../constants/theme';

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  ...ThemeSpacing,
} as const;

export const layout = {
  bottomTabInset: BottomTabInset,
  maxContentWidth: MaxContentWidth,
} as const;

export type SpacingScale = typeof spacing;
