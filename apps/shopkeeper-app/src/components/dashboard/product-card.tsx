import { StyleSheet, View } from 'react-native';

import { AppText, Button, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { ProductItem } from '@/services/dashboard-mock-data';

export function ProductCard({ item, onEdit }: { item: ProductItem; onEdit: () => void }) {
  const theme = useTheme();
  const statusColor = item.status === 'Low stock' ? '#F59E0B' : item.status === 'Out of stock' ? '#EF4444' : '#10B981';

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <AppText variant="subtitle">{item.name}</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {item.category}
          </AppText>
        </View>
        <AppText variant="caption" style={{ color: statusColor }}>
          {item.status}
        </AppText>
      </View>
      <View style={styles.row}> 
        <AppText variant="caption">{item.id}</AppText>
        <View style={styles.row}> 
          <AppText variant="subtitle">{item.price}</AppText>
          <Button title="Edit" variant="secondary" onPress={onEdit} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    gap: Spacing.one,
  },
});
