import { Colors as ThemeColors } from '../constants/theme';

export const palette = {
  primary: {
    50: '#EBF5FF',
    100: '#E1EFFE',
    500: '#3C87F7',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F0F0F3',
    200: '#E0E1E6',
    400: '#9CA3AF',
    500: '#60646C',
    700: '#212225',
    800: '#2E3135',
    900: '#111827',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const colors = {
  ...ThemeColors,
  palette,
} as const;

export type ColorTheme = typeof colors;
