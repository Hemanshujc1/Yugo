import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { StockReceipt } from '@/types/inventory';
import { getStockUnitLabel } from '@/utils/stock-unit';

export default function StockReceiptDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getStockReceiptById } = useProducts();

  const receiptId =
    typeof params.receiptId === 'string'
      ? params.receiptId
      : Array.isArray(params.receiptId)
        ? params.receiptId[0]
        : '';

  const [receipt, setReceipt] = useState<StockReceipt | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!receiptId) return;

    getStockReceiptById(receiptId)
      .then((res) => {
        if (isMounted) {
          setReceipt(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load receipt details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [receiptId, getStockReceiptById]);

  if (!loading && !receipt) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Stock Receipt' }} />
        <ThemedView type="backgroundElement" style={styles.emptyCard}>
          <AppText variant="h2">Receipt Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            No stock receipt matching the specified ID was found.
          </AppText>
          <Button title="Back to Stock Receipts" variant="primary" onPress={() => router.replace('/stock-receipts' as any)} />
        </ThemedView>
      </Screen>
    );
  }

  const formattedDate = receipt
    ? new Date(receipt.createdAt).toLocaleString([], {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : '';

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: receipt ? `Receipt ${receipt.id}` : 'Stock Receipt' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {receipt && (
          <>
            <PageHeader
              title={`Stock Receipt ${receipt.id}`}
              subtitle={`Received from ${receipt.supplierName} on ${formattedDate}`}
            />

            {/* Receipt Summary Card */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.infoRowBetween}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Supplier Name
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800', color: '#2563EB' }}>
                  🏢 {receipt.supplierName}
                </AppText>
              </View>

              <View style={styles.infoRowBetween}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Receipt Date
                </AppText>
                <AppText variant="body" style={{ fontWeight: '600' }}>
                  {formattedDate}
                </AppText>
              </View>

              <View style={styles.infoRowBetween}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Total Items Received
                </AppText>
                <AppText variant="body" style={{ fontWeight: '700' }}>
                  {receipt.totalUnitsReceived} units ({receipt.totalProductsCount} products)
                </AppText>
              </View>

              {receipt.notes && (
                <View style={{ backgroundColor: '#9CA3AF11', padding: Spacing.three, borderRadius: 12 }}>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                    Notes: {receipt.notes}
                  </AppText>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.infoRowBetween}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Total Purchase Value
                </AppText>
                <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                  {receipt.totalPurchaseValue !== undefined ? `₹${receipt.totalPurchaseValue.toLocaleString('en-IN')}` : 'Cost N/A'}
                </AppText>
              </View>

              {receipt.hasUnknownCosts && (
                <AppText variant="caption" style={{ color: '#D97706', fontWeight: '700', textAlign: 'right' }}>
                  ℹ️ Some item purchase costs were omitted upon receipt.
                </AppText>
              )}
            </ThemedView>

            {/* Received Items & Inventory Impact Breakdown */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Received Products & Inventory Impact
              </AppText>

              {receipt.items.map((item) => {
                const unitLabel = getStockUnitLabel('', item.variant, '');

                return (
                  <View key={item.shopInventoryItemId} style={styles.itemRow}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {item.productName}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {item.brand} • {item.variant}
                      </AppText>

                      {/* Stock Transition Badge */}
                      <View style={styles.transitionBadge}>
                        <AppText variant="caption" style={{ color: '#10B981', fontWeight: '800', fontSize: 11 }}>
                          + {item.quantityReceived} units received ({item.previousQuantity} → {item.newQuantity} {unitLabel})
                        </AppText>
                      </View>

                      {item.purchaseCost !== undefined && item.purchaseCost > 0 && (
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Purchase Cost: ₹{item.purchaseCost} / unit
                        </AppText>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800', color: item.totalItemValue ? '#10B981' : theme.textSecondary }}>
                        {item.totalItemValue ? `₹${item.totalItemValue}` : 'Cost N/A'}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </ThemedView>
          </>
        )}
      </ScrollView>
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
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    borderWidth: 1,
  },
  infoRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#9CA3AF22',
  },
  itemRow: {
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF22',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transitionBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
