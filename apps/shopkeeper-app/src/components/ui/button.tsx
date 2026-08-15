import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { borderRadius } from '@/theme/borders';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSizes, fontWeights } from '@/theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function Button({
  title,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  className,
  ...rest
}: ButtonProps) {
  const isPressDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isPressDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && styles.pressed,
        isPressDisabled && styles.disabled,
        style,
      ]}
      className={className}
      {...rest}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? palette.primary[500] : palette.white}
        />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.textBase, styles[`${size}Text`], styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  primary: {
    backgroundColor: palette.primary[500],
  },
  secondary: {
    backgroundColor: palette.gray[100],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: palette.primary[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: palette.error,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontWeight: fontWeights.semiBold as any,
    textAlign: 'center',
  },
  smText: {
    fontSize: fontSizes.sm,
  },
  mdText: {
    fontSize: fontSizes.base,
  },
  lgText: {
    fontSize: fontSizes.lg,
  },
  primaryText: {
    color: palette.white,
  },
  secondaryText: {
    color: palette.gray[900],
  },
  outlineText: {
    color: palette.primary[500],
  },
  ghostText: {
    color: palette.primary[500],
  },
  dangerText: {
    color: palette.white,
  },
});
