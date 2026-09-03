import { StyleSheet, View } from 'react-native';

import { AppText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { CategoryItem } from '@/services/dashboard-mock-data';

export function CategoryCard({ item }: { item: CategoryItem }) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <AppText variant="subtitle">{item.name}</AppText>
      <View style={styles.row}>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          {item.count} items
        </AppText>
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
});
