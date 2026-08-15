import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen, AppText, Button } from '@/components';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borders';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks';

export default function VerifyOtpScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleVerify = () => {
    login();
    router.replace('/');
  };

  // Local Countdown Timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const isComplete = otp.every((digit) => digit.trim() !== '');

  const handleChange = (text: string, index: number) => {
    const cleanText = text.replace(/\D/g, '');
    const newOtp = [...otp];

    if (cleanText.length > 1) {
      // Handle paste of full 6-digit code
      const pastedDigits = cleanText.slice(0, 6).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedDigits.length, 5)]?.focus();
      return;
    }

    newOtp[index] = cleanText;
    setOtp(newOtp);

    // Auto advance focus to next box if digit entered
    if (cleanText && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setTimer(30);
    inputRefs.current[0]?.focus();
  };

  const formatTimer = (seconds: number) => {
    const secs = seconds < 10 ? `0${seconds}` : seconds;
    return `00:${secs}`;
  };

  return (
    <Screen safeArea scrollable contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        {/* Header Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: theme.backgroundElement },
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}>
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={18}
            tintColor={theme.text}
          />
        </Pressable>

        {/* Title & Subtitle */}
        <View style={styles.header}>
          <AppText variant="h2" style={styles.title}>
            Verify OTP Code
          </AppText>
          <AppText variant="body" style={{ color: theme.textSecondary }}>
            Enter the 6-digit verification code sent to your registered mobile number.
          </AppText>
        </View>

        {/* 6-Digit OTP Auto-Focus Input Grid */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => {
            const isFocusedBox = digit !== '' || index === otp.findIndex((d) => d === '');
            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: isFocusedBox ? palette.primary[500] : palette.gray[200],
                  },
                ]}>
                <TextInput
                  ref={(el) => { inputRefs.current[index] = el; }}
                  style={[styles.otpInput, { color: theme.text }]}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              </View>
            );
          })}
        </View>

        {/* Resend Code Option with Countdown Timer */}
        <View style={styles.resendWrapper}>
          {timer > 0 ? (
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Resend OTP in <AppText variant="caption" weight="semiBold" style={{ color: palette.primary[500] }}>{formatTimer(timer)}</AppText>
            </AppText>
          ) : (
            <Pressable onPress={handleResend} style={({ pressed }) => pressed && styles.pressed}>
              <AppText variant="caption" weight="bold" style={{ color: palette.primary[500] }}>
                Resend OTP Code
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Button
          title="Verify & Continue"
          variant="primary"
          size="lg"
          disabled={!isComplete}
          onPress={handleVerify}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  topSection: {
    gap: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  otpBox: {
    flex: 1,
    height: 54,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
