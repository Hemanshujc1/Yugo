import { StyleSheet, View } from 'react-native';

import { AppText, Button, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface StockItem {
  product: string;
  quantity: number;
  threshold: number;
}

export function StockCard({ item, onRestock }: { item: StockItem; onRestock: () => void }) {
  const theme = useTheme();
  const warning = item.quantity <= item.threshold;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}> 
        <View>
          <AppText variant="subtitle">{item.product}</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            Remaining: {item.quantity}
          </AppText>
        </View>
        <AppText variant="caption" style={{ color: warning ? '#EF4444' : theme.textSecondary }}>
          {warning ? 'Low stock' : 'Safe'}
        </AppText>
      </View>
      <Button title="Restock" variant="secondary" onPress={onRestock} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
