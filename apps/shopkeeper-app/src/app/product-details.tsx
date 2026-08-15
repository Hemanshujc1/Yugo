import { StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { AppText, Button, Screen, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function ProductDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { productId } = useLocalSearchParams();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ThemedView type="backgroundElement" style={styles.card}>
        <AppText variant="h2">Product Details</AppText>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          Product ID: {productId ?? 'N/A'}
        </AppText>
        <View style={styles.row}>
          <AppText variant="caption">Status</AppText>
          <AppText variant="subtitle">Mock details</AppText>
        </View>
        <Button title="Back to Products" onPress={() => router.push('/products')} />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
