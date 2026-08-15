import { StyleSheet, View } from 'react-native';

import { AppText, Button, Screen, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ThemedView type="backgroundElement" style={styles.card}>
        <AppText variant="h2">Order Details</AppText>
        <AppText variant="caption" style={[styles.subtitle, { color: theme.textSecondary }]}> 
          Order ID: {orderId ?? 'N/A'}
        </AppText>
        <View style={styles.row}>
          <AppText variant="caption">Customer</AppText>
          <AppText variant="subtitle">Mock customer</AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="caption">Amount</AppText>
          <AppText variant="subtitle">$312</AppText>
        </View>
        <Button title="Back to Dashboard" onPress={() => router.push('/')} />
      </ThemedView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.four,
    margin: Spacing.four,
  },
  subtitle: {
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
