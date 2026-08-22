import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { OtpInput } from '@/components/auth/OtpInput';
import { Button } from '@/components/shared/Button';
import { verifyOtp, sendOtp } from '@/services/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { YuGoColors } from '@/constants/theme';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 4) return;
    setError('');
    setLoading(true);
    try {
      const result = await verifyOtp(phone ?? '', otp);
      login(result.user, result.token);
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [otp, phone, login]);

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setCountdown(60);
    await sendOtp(phone ?? '');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#090C14' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          <ThemedText
            type="smallBold"
            style={{ fontSize: 24, color: '#FFFFFF', textAlign: 'center', marginBottom: 8 }}
          >
            Verify OTP
          </ThemedText>
          <ThemedText
            type="small"
            style={{ color: YuGoColors.dark.textSecondary, textAlign: 'center', marginBottom: 32 }}
          >
            OTP sent to +91 {phone}
          </ThemedText>

          <OtpInput value={otp} onChange={setOtp} />

          {error ? (
            <ThemedText
              type="small"
              style={{ color: YuGoColors.error, textAlign: 'center', marginTop: 12 }}
            >
              {error}
            </ThemedText>
          ) : null}

          <View className="mt-8">
            <Button
              label="Verify & Continue"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 4}
              fullWidth
              size="lg"
            />
          </View>

          <View className="items-center mt-6">
            {canResend ? (
              <Pressable onPress={handleResend}>
                <ThemedText type="small" style={{ color: YuGoColors.primary, fontWeight: '600' }}>
                  Resend OTP
                </ThemedText>
              </Pressable>
            ) : (
              <ThemedText type="small" style={{ color: YuGoColors.dark.muted }}>
                Resend OTP in {countdown}s
              </ThemedText>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
