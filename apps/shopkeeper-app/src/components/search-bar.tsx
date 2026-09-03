import React from 'react';
import { StyleSheet, View, TextInput, Pressable, ViewStyle } from 'react-native';
import { AppText } from './ui/text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...', onClear, style }: SearchBarProps) {
  const theme = useTheme();

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: '#9CA3AF33' }, style]}>
      <AppText variant='caption' style={{ color: theme.textSecondary, fontSize: 16 }}>??</AppText>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize='none'
        autoCorrect={false}
      />
      {Boolean(value) && (
        <Pressable onPress={handleClear} hitSlop={8} style={styles.clearBtn}>
          <AppText variant='caption' style={{ color: theme.textSecondary, fontWeight: '800' }}>?</AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
});

