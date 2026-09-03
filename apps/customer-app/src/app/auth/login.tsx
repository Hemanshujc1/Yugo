import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { Button } from '@/components/shared/Button';
import { sendOtp } from '@/services/auth.service';
import { YuGoColors } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = phone.length === 10;

  const handleSendOtp = async () => {
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(phone);
      router.push({ pathname: '/auth/otp', params: { phone } });
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#090C14' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">
          {/* Logo */}
          <View className="items-center mb-12">
            <View className="flex-row">
              <ThemedText style={{ fontSize: 48, fontWeight: '700', color: '#FFFFFF' }}>
                Yu
              </ThemedText>
              <ThemedText style={{ fontSize: 48, fontWeight: '700', color: YuGoColors.primary }}>
                Go
              </ThemedText>
            </View>
            <ThemedText
              type="small"
              style={{ color: YuGoColors.dark.muted, marginTop: 4 }}
            >
              Why Go Out?
            </ThemedText>
          </View>

          {/* Phone input */}
          <ThemedText
            type="smallBold"
            style={{ fontSize: 18, color: '#FFFFFF', marginBottom: 16 }}
          >
            Enter your phone number
          </ThemedText>

          <PhoneInput value={phone} onChangeText={setPhone} error={error} />

          <Button
            label="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
            disabled={!isValid}
            fullWidth
            size="lg"
          />

          {/* Terms */}
          <ThemedText
            type="small"
            style={{
              color: YuGoColors.dark.muted,
              textAlign: 'center',
              marginTop: 24,
              fontSize: 12,
            }}
          >
            By continuing, you agree to our Terms & Privacy Policy
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
