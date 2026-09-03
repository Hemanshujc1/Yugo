import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { usePartnerAuth } from '@/state/partner-auth-context';

const PHONE_LENGTH = 10;

export default function PhoneScreen() {
  const { requestOtp } = usePartnerAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = phone.length === PHONE_LENGTH;

  async function handleContinue() {
    if (!isValid || loading) return;
    setError(null);
    setLoading(true);
    try {
      await requestOtp(`+91${phone}`);
      router.push('/otp');
    } catch {
      setError('Could not send the code. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.dots}>
        <ProgressDots total={4} current={0} />
      </View>

      <View style={styles.header}>
        <ThemedText type="h1">Enter your mobile number</ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          We&apos;ll send a one-time code to verify it&apos;s you.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <TextField
          label="Mobile number"
          prefix="+91"
          value={phone}
          onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, '').slice(0, PHONE_LENGTH))}
          keyboardType="number-pad"
          maxLength={PHONE_LENGTH}
          placeholder="98765 43210"
          error={error ?? undefined}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
      </View>

      <View style={styles.footer}>
        <Button label="Send Code" onPress={handleContinue} disabled={!isValid} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dots: { marginBottom: Spacing.four },
  header: { gap: Spacing.one, marginBottom: Spacing.five },
  form: { flex: 1, gap: Spacing.three },
  footer: { paddingBottom: Spacing.two },
});
