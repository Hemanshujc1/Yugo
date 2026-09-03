import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePartnerAuth } from '@/state/partner-auth-context';

type LocalStatus = 'polling' | 'approved';

export default function VerificationPendingScreen() {
  const theme = useTheme();
  const { pollVerification } = usePartnerAuth();
  const [status, setStatus] = useState<LocalStatus>('polling');
  const attemptRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    async function poll() {
      while (!cancelledRef.current) {
        attemptRef.current += 1;
        try {
          const result = await pollVerification(attemptRef.current);
          if (cancelledRef.current) return;
          if (result.status === 'approved') {
            setStatus('approved');
            // The root layout auto-swaps to (tabs) the instant `isOnboarded`
            // flips true in context (see app/_layout.tsx RootNavigator) —
            // pollVerification's own dispatch already did that above. This
            // local "approved" state just covers the single render frame
            // before that swap lands, so the screen doesn't flash back to
            // "reviewing" copy right before it unmounts.
            return;
          }
          // still under_review — the mock API already waits ~1.5s per call,
          // so loop straight into the next attempt without an extra delay.
        } catch {
          if (cancelledRef.current) return;
          // Keep polling even on network error
          return;
        }
      }
    }

    poll();
    return () => {
      cancelledRef.current = true;
    };
  }, [pollVerification]);

  function handleContinue() {
    // Defensive fallback only — `isOnboarded` is already true by the time
    // this button is reachable, so the root layout has already (or is about
    // to) swap the whole stack to (tabs) on its own. This just covers any
    // slow-device edge case where that transition feels like it's hanging.
    router.replace('/(tabs)');
  }

  if (status === 'approved') {
    return (
      <Screen scroll>
        <View style={styles.center}>
          <View style={[styles.badge, { backgroundColor: theme.success }]}>
            <ThemedText type="display">✓</ThemedText>
          </View>
          <ThemedText type="h1" style={styles.centerText}>
            You're verified!
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary" style={styles.centerText}>
            Taking you to your dashboard.
          </ThemedText>
        </View>
        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} style={styles.spinner} />
        <ThemedText type="h1" style={styles.centerText}>
          Reviewing your documents
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary" style={styles.centerText}>
          This usually takes just a moment. Don't close the app.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  centerText: { textAlign: 'center' },
  spinner: { marginBottom: Spacing.two },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  footer: { paddingBottom: Spacing.two, paddingTop: Spacing.four },
});
