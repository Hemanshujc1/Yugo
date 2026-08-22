import { useState } from 'react';
import { TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';

type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  maxLength?: number;
  autoFocus?: boolean;
};

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType,
  secureTextEntry,
  leftIcon,
  maxLength,
  autoFocus,
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const colors = isDark ? YuGoColors.dark : YuGoColors.light;

  const borderColor = error
    ? YuGoColors.error
    : isFocused
      ? YuGoColors.primary
      : colors.border;

  return (
    <View className="mb-4">
      {label && (
        <ThemedText type="small" className="mb-1.5">
          {label}
        </ThemedText>
      )}
      <View
        className="flex-row items-center rounded-xl px-4"
        style={{
          backgroundColor: isDark ? '#141A24' : '#FFFFFF',
          borderWidth: 1.5,
          borderColor,
          height: 52,
        }}
      >
        {leftIcon && <View className="mr-3">{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1"
          style={{
            color: colors.text,
            fontSize: 16,
          }}
        />
      </View>
      {error && (
        <ThemedText type="small" style={{ color: YuGoColors.error }} className="mt-1">
          {error}
        </ThemedText>
      )}
    </View>
  );
}
