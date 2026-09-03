import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | 'display'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'body'
    | 'bodyBold'
    | 'caption';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'display' && styles.display,
        type === 'h1' && styles.h1,
        type === 'h2' && styles.h2,
        type === 'h3' && styles.h3,
        type === 'body' && styles.body,
        type === 'bodyBold' && styles.bodyBold,
        type === 'caption' && styles.caption,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_500Medium',
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_700Bold',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Inter_500Medium',
  },
  title: {
    fontSize: 48,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontFamily: 'SpaceGrotesk_600SemiBold',
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
    fontFamily: 'Inter_500Medium',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
  display: { fontSize: 32, lineHeight: 38, fontFamily: 'SpaceGrotesk_700Bold' },
  h1: { fontSize: 28, lineHeight: 34, fontFamily: 'SpaceGrotesk_700Bold' },
  h2: { fontSize: 24, lineHeight: 30, fontFamily: 'SpaceGrotesk_700Bold' },
  h3: { fontSize: 20, lineHeight: 26, fontFamily: 'SpaceGrotesk_600SemiBold' },
  body: { fontSize: 16, lineHeight: 24, fontFamily: 'Inter_400Regular' },
  bodyBold: { fontSize: 16, lineHeight: 24, fontFamily: 'Inter_700Bold' },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: 'Inter_500Medium' },
});
