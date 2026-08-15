import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { fontSizes, fontWeights, lineHeights } from '@/theme/typography';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'label'
  | 'code';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: keyof typeof fontWeights;
  color?: string;
  className?: string;
}

export function AppText({
  style,
  variant = 'body',
  weight,
  color,
  className,
  children,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const textColor = color ?? theme.text;
  const fontWeightStyle = weight ? { fontWeight: fontWeights[weight] as any } : {};

  return (
    <RNText
      style={[{ color: textColor }, styles[variant], fontWeightStyle, style]}
      className={className}
      {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights.title,
    fontWeight: fontWeights.bold as any,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights.loose,
    fontWeight: fontWeights.bold as any,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights.relaxed,
    fontWeight: fontWeights.semiBold as any,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.medium as any,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.normal,
    fontWeight: fontWeights.regular as any,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.regular as any,
  },
  label: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.tight,
    fontWeight: fontWeights.medium as any,
  },
  code: {
    fontSize: fontSizes.xs,
    fontFamily: 'monospace',
  },
});
