import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { getStockUnitLabel } from '@/utils/stock-unit';
import { StockAdjustmentModal } from '@/components/inventory/stock-adjustment-modal';
import type { ShopInventoryItem } from '@/types/inventory';

export default function StockAuditScreen() {
  const theme = useTheme();
  const { getPendingStockAudits } = useProducts();

  const [audits, setAudits] = useState<{ item: ShopInventoryItem; expectedStock: number; recordedStock: number }[]>([]);
  const [selectedAuditItem, setSelectedAuditItem] = useState<ShopInventoryItem | null>(null);

  const fetchAudits = async () => {
    try {
      const data = await getPendingStockAudits();
      setAudits(data);
    } catch (err) {
      console.error('Failed to fetch stock audits:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getPendingStockAudits()
      .then((data) => {
        if (isMounted) setAudits(data);
      })
      .catch((err) => console.error('Failed to fetch stock audits:', err));
    return () => {
      isMounted = false;
    };
  }, [getPendingStockAudits]);

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Stock Audit' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Stock Audit & Reconciliation"
          subtitle="Review products requiring stock verification to keep your inventory accurate."
        />

        <View style={styles.auditList}>
          {audits.map(({ item, expectedStock, recordedStock }) => {
            const cat = item.catalogProduct;
            const unit = getStockUnitLabel(cat.category, cat.variant, cat.unit);
            const diff = expectedStock - recordedStock;

            return (
              <ThemedView key={item.id} type="backgroundElement" style={[styles.auditCard, { borderColor: '#9CA3AF22' }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, paddingRight: Spacing.two }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      {cat.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {cat.brand} • {cat.variant}
                    </AppText>
                  </View>

                  <View style={styles.diffBadge}>
                    <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>
                      {diff > 0 ? `+${diff}` : diff} Discrepancy
                    </AppText>
                  </View>
                </View>

                <View style={styles.cardDetailRow}>
                  <View>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Expected Stock: <AppText variant="caption" style={{ fontWeight: '700' }}>{expectedStock} {unit}</AppText>
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Current Recorded: <AppText variant="caption" style={{ fontWeight: '700' }}>{recordedStock} {unit}</AppText>
                    </AppText>
                  </View>

                  <Button
                    title="Correct Stock"
                    variant="primary"
                    size="sm"
                    onPress={() => setSelectedAuditItem(item)}
                  />
                </View>
              </ThemedView>
            );
          })}
        </View>
      </ScrollView>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        visible={Boolean(selectedAuditItem)}
        item={selectedAuditItem}
        onClose={() => {
          setSelectedAuditItem(null);
          fetchAudits();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  auditList: {
    gap: Spacing.three,
  },
  auditCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diffBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
  },
});
