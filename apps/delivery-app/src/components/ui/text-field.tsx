import { forwardRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  prefix?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, prefix, style, ...rest },
  ref
) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.row,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.error : theme.border,
          },
        ]}>
        {prefix ? (
          <ThemedText type="bodyBold" style={styles.prefix}>
            {prefix}
          </ThemedText>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }, style]}
          {...rest}
        />
      </View>
      {error ? (
        <ThemedText type="small" themeColor="error" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.one },
  label: { marginBottom: Spacing.half },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minHeight: MinTouchTarget,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  prefix: { fontSize: 16 },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.two,
  },
  error: { marginTop: Spacing.half },
});
