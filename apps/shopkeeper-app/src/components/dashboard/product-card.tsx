import { StyleSheet, View } from 'react-native';

import { AppText, Button, ThemedView, StockStatusBadge } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { ProductItem } from '@/services/product-service';

export function ProductCard({ item, onEdit }: { item: ProductItem; onEdit: () => void }) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
      {/* Header Row: Name & Status Badge */}
      <View style={styles.row}>
        <View style={styles.info}>
          <AppText variant="subtitle" numberOfLines={2} style={styles.nameText}>
            {item.name}
          </AppText>
          <View style={styles.subInfo}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {item.category}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              | Stock: {item.quantity}
            </AppText>
          </View>
        </View>
        <StockStatusBadge status={item.status} />
      </View>

      {/* Footer Row: SKU, Price & Action Button */}
      <View style={styles.footerRow}>
        <View style={styles.metaAndPrice}>
          {Boolean(item.subtitle) && (
            <AppText variant="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
              {item.subtitle}
            </AppText>
          )}
          <View style={styles.priceRow}>
            {Boolean(item.originalPrice) && (
              <AppText variant="caption" style={styles.originalPriceText}>
                {item.originalPrice}
              </AppText>
            )}
            {Boolean(item.discountPercentage) && (
              <AppText variant="caption" style={styles.discountBadge}>
                {item.discountPercentage}% OFF
              </AppText>
            )}
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              {item.price}
            </AppText>
          </View>
        </View>
        <View style={styles.actionContainer}>
          <Button title="Edit" variant="secondary" size="sm" onPress={onEdit} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    width: '100%',
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  info: {
    flex: 1,
    gap: Spacing.one,
  },
  nameText: {
    fontWeight: '600',
  },
  subInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  metaAndPrice: {
    flex: 1,
    gap: Spacing.one,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  discountBadge: {
    color: '#EF4444',
    fontWeight: '600',
  },
  actionContainer: {
    flexShrink: 0,
  },
});
