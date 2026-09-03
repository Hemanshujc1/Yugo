import { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

/** Six-box OTP entry. Each box holds one digit; focus auto-advances and backspace auto-retreats. */
export function OtpInput({ length = 6, value, onChange, error = false }: OtpInputProps) {
  const theme = useTheme();
  const inputs = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  function handleChange(text: string, index: number) {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (!cleaned) {
      // Handle deletion.
      const next = value.slice(0, index) + value.slice(index + 1);
      onChange(next);
      return;
    }
    const next = value.slice(0, index) + cleaned[cleaned.length - 1] + value.slice(index + 1);
    onChange(next.slice(0, length));
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(e: { nativeEvent: { key: string } }, index: number) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          accessibilityLabel={`OTP digit ${index + 1}`}
          style={[
            styles.box,
            {
              borderColor: error ? theme.error : digit ? theme.primary : theme.border,
              backgroundColor: theme.backgroundElement,
              color: theme.text,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.two, justifyContent: 'space-between' },
  box: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: '700',
  },
});
