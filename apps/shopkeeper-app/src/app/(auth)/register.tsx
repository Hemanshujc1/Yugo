import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen, AppText, ThemedView } from '@/components';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borders';
import { useTheme } from '@/hooks/use-theme';

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  shopName?: string;
  shopAddress?: string;
}

export default function RegisterScreen() {
  const theme = useTheme();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');

  // UI state
  const [isTouched, setIsTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Validation rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s-]{10,15}$/;

  const errors: FormErrors = {};

  if (!fullName.trim()) {
    errors.fullName = 'Full Name is required';
  }

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(phone.trim())) {
    errors.phone = 'Please enter a valid phone number (10+ digits)';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!shopName.trim()) {
    errors.shopName = 'Shop Name is required';
  }

  if (!shopAddress.trim()) {
    errors.shopAddress = 'Shop Address is required';
  }

  const isValid = Object.keys(errors).length === 0;

  const handleRegister = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    // Simulate loading state
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      setIsSuccess(true);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Check your details.');
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldError = (fieldName: keyof FormErrors) => {
    return isTouched[fieldName] ? errors[fieldName] : '';
  };

  const markTouched = (fieldName: string) => {
    setIsTouched((prev) => ({ ...prev, [fieldName]: true }));
  };

  if (isSuccess) {
    return (
      <Screen safeArea contentContainerStyle={styles.successContainer}>
        <ThemedView type="backgroundElement" style={styles.successCard}>
          <View style={styles.checkIconWrapper}>
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
              size={64}
              tintColor="#10B981"
            />
          </View>
          <AppText variant="h2" style={styles.successTitle}>
            Account Created!
          </AppText>
          <AppText variant="body" style={[styles.successSubtitle, { color: theme.textSecondary }]}>
            Your shopkeeper profile and shop details have been registered successfully.
          </AppText>
          <AppText variant="caption" style={[styles.successInstructions, { color: theme.textSecondary }]}>
            Please log in with your email and password to access the dashboard.
          </AppText>
          <Pressable
            style={styles.successButton}
            onPress={() => router.replace('/login' as any)}
          >
            <AppText style={styles.successButtonText}>Go to Login</AppText>
          </Pressable>
        </ThemedView>
      </Screen>
    );
  }

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
          onPress={() => router.back()}
        >
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={18}
            tintColor={theme.text}
          />
        </Pressable>

        {/* Title & Subtitle */}
        <View style={styles.header}>
          <AppText variant="h2" style={styles.title}>
            Create Shopkeeper Account
          </AppText>
          <AppText variant="body" style={{ color: theme.textSecondary }}>
            Register your shop and get started today.
          </AppText>
        </View>

        {/* Section: Personal Info */}
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={{ fontWeight: '700' }}>Personal Info</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            FULL NAME *
          </AppText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: getFieldError('fullName') ? palette.error : '#9CA3AF44', backgroundColor: theme.backgroundElement }]}
            placeholder="e.g. Ankur Patel"
            placeholderTextColor={theme.textSecondary}
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => markTouched('fullName')}
          />
          {Boolean(getFieldError('fullName')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('fullName')}</AppText>}
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            EMAIL ADDRESS *
          </AppText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: getFieldError('email') ? palette.error : '#9CA3AF44', backgroundColor: theme.backgroundElement }]}
            placeholder="user@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => markTouched('email')}
          />
          {Boolean(getFieldError('email')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('email')}</AppText>}
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            PHONE NUMBER *
          </AppText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: getFieldError('phone') ? palette.error : '#9CA3AF44', backgroundColor: theme.backgroundElement }]}
            placeholder="e.g. 9876543210"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            onBlur={() => markTouched('phone')}
          />
          {Boolean(getFieldError('phone')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('phone')}</AppText>}
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            PASSWORD *
          </AppText>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: getFieldError('password') ? palette.error : '#9CA3AF44',
              },
            ]}
          >
            <TextInput
              style={[styles.textInputStyle, { color: theme.text }]}
              placeholder="••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onBlur={() => markTouched('password')}
            />
            <Pressable onPress={() => setSecureTextEntry((prev) => !prev)} style={styles.eyeIcon}>
              <SymbolView
                name={{
                  ios: secureTextEntry ? 'eye.slash.fill' : 'eye.fill',
                  android: secureTextEntry ? 'visibility_off' : 'visibility',
                  web: secureTextEntry ? 'visibility_off' : 'visibility',
                }}
                size={20}
                tintColor={theme.textSecondary}
              />
            </Pressable>
          </View>
          {Boolean(getFieldError('password')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('password')}</AppText>}
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            CONFIRM PASSWORD *
          </AppText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: getFieldError('confirmPassword') ? palette.error : '#9CA3AF44', backgroundColor: theme.backgroundElement }]}
            placeholder="••••••"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => markTouched('confirmPassword')}
          />
          {Boolean(getFieldError('confirmPassword')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('confirmPassword')}</AppText>}
        </View>

        {/* Section: Shop Info */}
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={{ fontWeight: '700' }}>Shop Info</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            SHOP NAME *
          </AppText>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: getFieldError('shopName') ? palette.error : '#9CA3AF44', backgroundColor: theme.backgroundElement }]}
            placeholder="e.g. Yugo Supermart"
            placeholderTextColor={theme.textSecondary}
            value={shopName}
            onChangeText={setShopName}
            onBlur={() => markTouched('shopName')}
          />
          {Boolean(getFieldError('shopName')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('shopName')}</AppText>}
        </View>

        <View style={styles.field}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            SHOP ADDRESS *
          </AppText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { color: theme.text, borderColor: getFieldError('shopAddress') ? palette.error : '#9CA3AF44', backgroundColor: theme.backgroundElement }
            ]}
            placeholder="Enter shop address..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            value={shopAddress}
            onChangeText={setShopAddress}
            onBlur={() => markTouched('shopAddress')}
          />
          {Boolean(getFieldError('shopAddress')) && <AppText variant="caption" style={styles.errorText}>{getFieldError('shopAddress')}</AppText>}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <Pressable
            disabled={!isValid || isSaving}
            style={[
              styles.registerButton,
              { opacity: !isValid || isSaving ? 0.5 : 1 }
            ]}
            onPress={handleRegister}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <AppText style={styles.registerButtonText}>Register</AppText>
            )}
          </Pressable>
        </View>

        <View style={styles.loginPromptRow}>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            Already have an account?{' '}
          </AppText>
          <Pressable onPress={() => router.push('/login' as any)}>
            <AppText variant="caption" style={{ color: palette.primary[600], fontWeight: '600' }}>
              Login
            </AppText>
          </Pressable>
        </View>
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
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF44',
    paddingBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  textInputStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: palette.error,
    fontSize: 12,
    marginLeft: 2,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  buttonWrapper: {
    position: 'relative',
  },
  spinner: {
    position: 'absolute',
    right: 24,
    top: 15,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successCard: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  checkIconWrapper: {
    marginBottom: spacing.xs,
  },
  successTitle: {
    textAlign: 'center',
  },
  successSubtitle: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  successInstructions: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  registerButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
