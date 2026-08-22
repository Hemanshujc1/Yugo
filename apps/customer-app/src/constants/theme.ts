/**
 * YuGo Customer App Theme
 * Colors, fonts, spacing, and design tokens
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#101828',
    background: '#F6F8FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DCE5EE',
    textSecondary: '#4F5F75',
  },
  dark: {
    text: '#F8FAFC',
    background: '#090C14',
    backgroundElement: '#1B2433',
    backgroundSelected: '#283447',
    textSecondary: '#AAB4C5',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const YuGoColors = {
  primary: '#30F2C2',
  secondary: '#6BE8FF',
  premium: '#7A5AF8',
  success: '#2ED573',
  warning: '#FFB84D',
  error: '#FF5D73',
  dark: {
    bg: '#090C14',
    surface: '#141A24',
    card: '#1B2433',
    elevated: '#1B2433',
    border: '#283447',
    divider: '#344155',
    text: '#F8FAFC',
    textSecondary: '#AAB4C5',
    muted: '#7C8CA3',
  },
  light: {
    bg: '#F6F8FB',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#DCE5EE',
    divider: '#C8D4E0',
    text: '#101828',
    textSecondary: '#4F5F75',
    muted: '#708090',
  },
} as const;

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
