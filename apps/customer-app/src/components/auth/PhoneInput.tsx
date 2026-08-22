import { View, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';
import { useState } from 'react';

type PhoneInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
};

export function PhoneInput({ value, onChangeText, error }: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';

  const borderColor = error
    ? YuGoColors.error
    : isFocused
      ? YuGoColors.primary
      : isDark ? YuGoColors.dark.border : YuGoColors.light.border;

  return (
    <View className="mb-4">
      <View
        className="flex-row items-center rounded-xl overflow-hidden"
        style={{
          borderWidth: 1.5,
          borderColor,
          height: 56,
        }}
      >
        <View
          className="px-4 h-full justify-center"
          style={{
            backgroundColor: isDark ? '#1B2433' : '#F0F0F3',
            borderRightWidth: 1,
            borderRightColor: borderColor,
          }}
        >
          <ThemedText type="default" style={{ fontWeight: '600' }}>+91</ThemedText>
        </View>
        <TextInput
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ''))}
          placeholder="Enter phone number"
          placeholderTextColor={isDark ? YuGoColors.dark.muted : YuGoColors.light.muted}
          keyboardType="number-pad"
          maxLength={10}
          autoFocus
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 px-4"
          style={{
            color: isDark ? YuGoColors.dark.text : YuGoColors.light.text,
            fontSize: 18,
            letterSpacing: 1,
            backgroundColor: isDark ? '#141A24' : '#FFFFFF',
            height: '100%',
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
