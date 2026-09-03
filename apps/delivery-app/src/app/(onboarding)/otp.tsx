import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { usePartnerAuth } from '@/state/partner-auth-context';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { phone, verifyOtp, requestOtp } = usePartnerAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const isComplete = code.length === OTP_LENGTH;

  // Resend countdown — ticks down to 0, at which point "Resend code" becomes tappable.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Auto-submit as soon as all 6 digits are entered, matching standard OTP UX.
  const verifyingRef = useRef(false);
  useEffect(() => {
    if (isComplete && !verifyingRef.current) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  async function handleVerify() {
    if (!isComplete || loading) return;
    verifyingRef.current = true;
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(code);
      router.push('/partner-type');
    } catch {
      setError('That code didn\u2019t work. Check the digits and try again.');
      setCode('');
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || resending || !phone) return;
    setResending(true);
    setError(null);
    try {
      await requestOtp(phone);
      setCode('');
      setSecondsLeft(RESEND_SECONDS);
    } catch {
      setError('Could not resend the code. Check your connection and try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.dots}>
        <ProgressDots total={4} current={1} />
      </View>

      <View style={styles.header}>
        <ThemedText type="h1">Enter the code</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          We sent a 6-digit code to {phone ?? 'your phone'}.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <OtpInput value={code} onChange={setCode} error={!!error} />
        {error ? (
          <ThemedText type="small" themeColor="error">
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.resendRow}>
          {secondsLeft > 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Resend code in 0:{secondsLeft.toString().padStart(2, '0')}
            </ThemedText>
          ) : (
            <ThemedText
              type="smallBold"
              themeColor="primary"
              onPress={handleResend}
              accessibilityRole="button"
              accessibilityState={{ disabled: resending }}>
              {resending ? 'Resending\u2026' : 'Resend code'}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Verify" onPress={handleVerify} disabled={!isComplete} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dots: { marginBottom: Spacing.four },
  header: { gap: Spacing.one, marginBottom: Spacing.five },
  form: { flex: 1, gap: Spacing.three },
  resendRow: { alignItems: 'center', marginTop: Spacing.two },
  footer: { paddingBottom: Spacing.two },
});
