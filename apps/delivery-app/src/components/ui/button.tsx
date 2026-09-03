import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.error
        : variant === 'outline' || variant === 'ghost'
          ? 'transparent'
          : theme.backgroundElement;

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.onPrimary
      : variant === 'outline' || variant === 'ghost'
        ? theme.primary
        : theme.text;

  const borderColor = variant === 'outline' ? theme.primary : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        { opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        fullWidth && styles.fullWidth,
      ]}
      {...rest}>
      <View
        style={[
          styles.base,
          {
            backgroundColor,
            borderColor,
            borderWidth: variant === 'outline' ? 1.5 : 0,
          },
        ]}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <ThemedText type="smallBold" style={{ color: textColor, fontSize: 16 }}>
            {label}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTouchTarget,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});
