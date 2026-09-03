/**
 * YuGo brand design tokens.
 * Source: YuGo — Master PRD, Section 6 (Design System & Brand Identity).
 * Delivery Partner App is dark-first (outdoor, high-glare usage), but both
 * themes are implemented since the app respects the system color scheme.
 */

import { Platform } from 'react-native';

/** Raw brand palette — use via `Colors` below rather than directly, so screens stay theme-aware. */
export const Brand = {
  aqua: '#30F2C2',
  cyan: '#6BE8FF',
  violet: '#7A5AF8',
  success: '#2ED573',
  warning: '#FFB84D',
  error: '#FF5D73',
} as const;

export const Colors = {
  dark: {
    text: '#FFFFFF',
    textSecondary: '#93A0B4',
    background: '#090C14',
    backgroundElement: '#111827',
    backgroundSelected: '#1B2433',
    surface: '#141A24',
    elevated: '#1B2433',
    border: '#283447',
    primary: Brand.aqua,
    onPrimary: '#04140F',
    secondary: Brand.cyan,
    premium: Brand.violet,
    success: Brand.success,
    warning: Brand.warning,
    error: Brand.error,
  },
  light: {
    text: '#101828',
    textSecondary: '#4F5F75',
    background: '#F6F8FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF1F6',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#DCE5EE',
    primary: Brand.aqua,
    onPrimary: '#04140F',
    secondary: Brand.cyan,
    premium: Brand.violet,
    success: Brand.success,
    warning: Brand.warning,
    error: Brand.error,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Space Grotesk (headings) / Inter (body) per brand guide are not yet bundled
 * as local font assets — see PROJECT_CONTEXT.md "Known gaps" for the follow-up
 * task to add them via `expo-font`. Until then we fall back to the platform
 * system font with matching weights so the type scale is still correct.
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Space Grotesk / Inter weight + size scale (Master PRD 6.3), applied to whichever font family is active. */
export const Type = {
  display: { fontFamily: 'SpaceGrotesk_700Bold' as const, fontSize: 32 },
  h1: { fontFamily: 'SpaceGrotesk_700Bold' as const, fontSize: 28 },
  h2: { fontFamily: 'SpaceGrotesk_700Bold' as const, fontSize: 24 },
  h3: { fontFamily: 'SpaceGrotesk_600SemiBold' as const, fontSize: 20 },
  body: { fontFamily: 'Inter_400Regular' as const, fontSize: 16 },
  bodyMedium: { fontFamily: 'Inter_500Medium' as const, fontSize: 16 },
  caption: { fontFamily: 'Inter_500Medium' as const, fontSize: 12 },
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
/** Minimum touch target per accessibility guidelines (44x44 iOS HIG / 48x48 Material). */
export const MinTouchTarget = 48;

