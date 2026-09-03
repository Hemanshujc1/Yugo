import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  onFocus,
  placeholder = 'Search products, shops...',
  autoFocus = false,
  editable = true,
  onPress,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      className="flex-row items-center rounded-xl px-4 mx-4 mb-4"
      style={{
        backgroundColor: isDark ? '#141A24' : '#F0F0F3',
        borderWidth: 1,
        borderColor: isFocused ? YuGoColors.primary : 'transparent',
        height: 48,
      }}
    >
      <ThemedText style={{ fontSize: 18, marginRight: 10 }}>🔍</ThemedText>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? YuGoColors.dark.muted : YuGoColors.light.muted}
          autoFocus={autoFocus}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => setIsFocused(false)}
          className="flex-1"
          style={{
            color: isDark ? YuGoColors.dark.text : YuGoColors.light.text,
            fontSize: 15,
          }}
        />
      ) : (
        <ThemedText
          type="small"
          style={{ color: isDark ? YuGoColors.dark.muted : YuGoColors.light.muted }}
        >
          {placeholder}
        </ThemedText>
      )}
      {value.length > 0 && editable && (
        <Pressable onPress={() => onChangeText('')}>
          <ThemedText style={{ fontSize: 16, color: isDark ? YuGoColors.dark.muted : YuGoColors.light.muted }}>✕</ThemedText>
        </Pressable>
      )}
    </Container>
  );
}
