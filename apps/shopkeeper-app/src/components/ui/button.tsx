import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
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
  style?: ViewStyle | ViewStyle[];
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

  // Resolve size styles
  let sizeStyle: ViewStyle = styles.md;
  let textStyle: TextStyle = styles.mdText;
  if (size === 'sm') {
    sizeStyle = styles.sm;
    textStyle = styles.smText;
  } else if (size === 'lg') {
    sizeStyle = styles.lg;
    textStyle = styles.lgText;
  }

  // Resolve variant styles
  let variantStyle: ViewStyle = styles.primary;
  let variantTextStyle: TextStyle = styles.primaryText;
  if (variant === 'secondary') {
    variantStyle = styles.secondary;
    variantTextStyle = styles.secondaryText;
  } else if (variant === 'outline') {
    variantStyle = styles.outline;
    variantTextStyle = styles.outlineText;
  } else if (variant === 'ghost') {
    variantStyle = styles.ghost;
    variantTextStyle = styles.ghostText;
  } else if (variant === 'danger') {
    variantStyle = styles.danger;
    variantTextStyle = styles.dangerText;
  }

  return (
    <Pressable
      disabled={isPressDisabled}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.12)' }}
      style={[
        styles.base,
        sizeStyle,
        variantStyle,
        isPressDisabled ? styles.disabled : undefined,
        style as any,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? palette.primary[600] : palette.white}
        />
      ) : children ? (
        children
      ) : (
        <Text style={[styles.textBase, textStyle, variantTextStyle]}>
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
  },
  sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    minHeight: 34,
    borderRadius: 8,
  },
  md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
    minHeight: 48,
    borderRadius: borderRadius.md,
  },
  lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    width: '100%',
    minHeight: 54,
    borderRadius: borderRadius.md,
  },
  primary: {
    backgroundColor: palette.primary[600],
  },
  secondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
    color: '#1F2937',
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
