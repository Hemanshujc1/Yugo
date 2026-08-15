import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen, AppText } from '@/components';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borders';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTouched, setIsTouched] = useState({ email: false, password: false });
  const [isSaving, setIsSaving] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Email format validation helper
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isValid = isEmailValid && isPasswordValid;

  const emailError = isTouched.email && !email.trim()
    ? 'Email is required'
    : isTouched.email && !isEmailValid
      ? 'Please enter a valid email address'
      : '';

  const passwordError = isTouched.password && !password
    ? 'Password is required'
    : isTouched.password && !isPasswordValid
      ? 'Password must be at least 6 characters'
      : '';

  const handleLogin = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    // Simulate minor loading latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Login with credentials and navigate
      login(email.trim(), 'Demo Shopkeeper', 'Yugo Supermart', '+91 98765 43210');
      router.replace('/' as any);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen safeArea scrollable contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        {/* Header Back Button */}
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.backgroundElement }]}
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
            Welcome Back
          </AppText>
          <AppText variant="body" style={{ color: theme.textSecondary }}>
            Log in to manage your shopkeeper account.
          </AppText>
        </View>

        {/* Email Input Field */}
        <View style={styles.inputContainer}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            EMAIL ADDRESS
          </AppText>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: emailError ? palette.error : '#9CA3AF44',
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="user@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onBlur={() => setIsTouched((prev) => ({ ...prev, email: true }))}
            />
          </View>
          {Boolean(emailError) && (
            <AppText variant="caption" style={styles.errorText}>
              {emailError}
            </AppText>
          )}
        </View>

        {/* Password Input Field */}
        <View style={styles.inputContainer}>
          <AppText variant="label" weight="medium" style={{ color: theme.textSecondary }}>
            PASSWORD
          </AppText>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: passwordError ? palette.error : '#9CA3AF44',
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onBlur={() => setIsTouched((prev) => ({ ...prev, password: true }))}
            />
            <Pressable
              onPress={() => setSecureTextEntry((prev) => !prev)}
              style={styles.eyeIcon}
            >
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
          {Boolean(passwordError) && (
            <AppText variant="caption" style={styles.errorText}>
              {passwordError}
            </AppText>
          )}
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <Pressable
            disabled={!isValid || isSaving}
            style={[
              styles.loginButton,
              { opacity: !isValid || isSaving ? 0.5 : 1 }
            ]}
            onPress={handleLogin}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <AppText style={styles.loginButtonText}>Login</AppText>
            )}
          </Pressable>
        </View>

        <View style={styles.registerPromptRow}>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {"Don't have an account? "}
          </AppText>
          <Pressable onPress={() => router.push('/register' as any)}>
            <AppText variant="caption" style={{ color: palette.primary[600], fontWeight: '600' }}>
              Create Account
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
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: spacing.xs,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    color: palette.error,
    marginTop: 2,
    marginLeft: 2,
    fontSize: 12,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  buttonWrapper: {
    width: '100%',
  },
});
