import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen, AppText, Button } from '@/components';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borders';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  // Sanitize input to only digits
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  const isValid = cleanNumber.length === 10;

  // Validation message logic
  const getErrorMessage = () => {
    if (!isTouched) return '';
    if (cleanNumber.length === 0) {
      return 'Mobile number is required';
    }
    if (cleanNumber.length < 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  };

  const errorMessage = getErrorMessage();

  const handleTextChange = (text: string) => {
    if (!isTouched) setIsTouched(true);
    // Limit to digits only and max 10 chars
    const digitsOnly = text.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(digitsOnly);
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
            Enter Mobile Number
          </AppText>
          <AppText variant="body" style={{ color: theme.textSecondary }}>
            We will send a 6-digit verification code to log in to your shopkeeper account.
          </AppText>
        </View>

        {/* Phone Input Box with Static Country Code */}
        <View style={styles.inputContainer}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            MOBILE NUMBER
          </AppText>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: errorMessage ? palette.error : palette.gray[200],
              },
            ]}>
            {/* Static Country Code Selector Pill */}
            <View style={[styles.countrySelector, { backgroundColor: theme.background }]}>
              <AppText variant="body" style={styles.flagEmoji}>
                🇮🇳
              </AppText>
              <AppText variant="body" weight="semiBold">
                +91
              </AppText>
              <SymbolView
                name={{ ios: 'chevron.down', android: 'arrow_drop_down', web: 'arrow_drop_down' }}
                size={12}
                tintColor={theme.textSecondary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.textSecondary }]} />

            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="98765 43210"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={phoneNumber}
              onChangeText={handleTextChange}
              onBlur={() => setIsTouched(true)}
              maxLength={10}
            />
          </View>

          {/* Validation Error Message */}
          {Boolean(errorMessage) && (
            <AppText variant="caption" style={styles.errorText}>
              {errorMessage}
            </AppText>
          )}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <AppText variant="caption" style={[styles.termsText, { color: theme.textSecondary }]}>
          By continuing, you agree to Yugo&apos;s Terms of Service and Privacy Policy.
        </AppText>

        <Button
          title="Continue"
          variant="primary"
          size="lg"
          disabled={!isValid}
          onPress={() => router.push('/verify-otp')}
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
  inputContainer: {
    gap: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  flagEmoji: {
    fontSize: 16,
  },
  divider: {
    width: 1,
    height: 20,
    marginHorizontal: spacing.xs,
    opacity: 0.2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    color: palette.error,
    marginTop: 2,
    marginLeft: 2,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
