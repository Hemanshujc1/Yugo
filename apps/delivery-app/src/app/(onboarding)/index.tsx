import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function WelcomeScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={[styles.logoMark, { backgroundColor: theme.primary }]}>
          <ThemedText type="h1" style={{ color: theme.onPrimary }}>
            Yu
          </ThemedText>
        </View>
        <ThemedText type="display" style={styles.wordmark}>
          YuGo
        </ThemedText>
        <ThemedText type="h3" themeColor="textSecondary" style={styles.tagline}>
          Deliver for your neighbourhood
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.legal}>
          By continuing, you agree to become a YuGo Delivery Partner and accept the Partner Terms
          & Privacy Policy.
        </ThemedText>
        <Button label="Get Started" onPress={() => router.push('/phone')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  wordmark: { letterSpacing: -0.5 },
  tagline: { textAlign: 'center' },
  footer: { gap: Spacing.three, paddingBottom: Spacing.two },
  legal: { textAlign: 'center', lineHeight: 18 },
});
