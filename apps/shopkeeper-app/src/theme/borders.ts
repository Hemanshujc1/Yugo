export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const borderWidth = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 4,
} as const;

export const borders = {
  radius: borderRadius,
  width: borderWidth,
} as const;

export type Borders = typeof borders;
