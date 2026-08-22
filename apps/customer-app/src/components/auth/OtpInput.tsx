import { useRef, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';

type OtpInputProps = {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
};

export function OtpInput({ length = 4, value, onChange }: OtpInputProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
      // Backspace: clear current and move back
      const newOtp = value.slice(0, index) + value.slice(index + 1);
      onChange(newOtp);
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }
    const digit = cleaned[0];
    const newOtp = value.slice(0, index) + digit + value.slice(index + 1);
    onChange(newOtp.slice(0, length));
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = value.slice(0, index - 1) + value.slice(index);
      onChange(newOtp);
    }
  };

  return (
    <View className="flex-row justify-center" style={{ gap: 12 }}>
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        const hasValue = digit !== '';
        return (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocusedIndex(index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: isFocused
                ? YuGoColors.primary
                : hasValue
                  ? YuGoColors.primary + '80'
                  : isDark ? YuGoColors.dark.border : YuGoColors.light.border,
              backgroundColor: isDark ? '#141A24' : '#FFFFFF',
              color: isDark ? YuGoColors.dark.text : YuGoColors.light.text,
              fontSize: 24,
              fontWeight: '700',
              textAlign: 'center',
            }}
          />
        );
      })}
    </View>
  );
}
