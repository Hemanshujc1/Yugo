import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { supplierService } from '@/services/supplier-service';
import { Supplier } from '@/types/supplier';
import { StockReceipt } from '@/types/inventory';

export default function SupplierDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getStockReceipts } = useProducts();

  const supplierId =
    typeof params.supplierId === 'string'
      ? params.supplierId
      : Array.isArray(params.supplierId)
        ? params.supplierId[0]
        : '';

  const [supplier, setSupplier] = useState<Supplier | undefined>(undefined);
  const [receipts, setReceipts] = useState<StockReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!supplierId) return;

    Promise.all([
      supplierService.getSupplierById(supplierId),
      getStockReceipts('all', ''),
    ])
      .then(([supRes, allReceipts]) => {
        if (isMounted) {
          setSupplier(supRes);
          const filtered = allReceipts.filter((r) => r.supplierId === supplierId);
          setReceipts(filtered);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load supplier details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [supplierId, getStockReceipts]);

  if (!loading && !supplier) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Supplier Details' }} />
        <ThemedView type="backgroundElement" style={styles.emptyCard}>
          <AppText variant="h2">Supplier Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            No supplier matching the requested ID was found.
          </AppText>
          <Button title="Back to Suppliers Directory" variant="primary" onPress={() => router.replace('/suppliers' as any)} />
        </ThemedView>
      </Screen>
    );
  }

  const lastDateStr = supplier?.lastReceivedAt
    ? new Date(supplier.lastReceivedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'No receipts yet';

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: supplier ? supplier.name : 'Supplier Details' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title={supplier ? supplier.name : 'Supplier Profile'}
          subtitle={supplier ? `City: ${supplier.city}` : ''}
        />

        {supplier && (
          <>
            {/* Supplier Info Header Card */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <AppText variant="h2" style={{ fontWeight: '800' }}>
                    {supplier.name}
                  </AppText>
                  <AppText variant="subtitle" style={{ color: '#2563EB', fontWeight: '600', marginTop: 2 }}>
                    📞 {supplier.phone || 'No phone recorded'}
                  </AppText>
                  {supplier.email && (
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      ✉️ {supplier.email}
                    </AppText>
                  )}
                </View>
              </View>

              <View style={styles.addressBox}>
                <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                  Supplier Location & Address
                </AppText>
                <AppText variant="body" style={{ fontWeight: '600', marginTop: 2 }}>
                  {supplier.address || 'Local wholesale market'}, {supplier.city}
                </AppText>
              </View>

              {supplier.notes && (
                <View style={{ backgroundColor: '#9CA3AF11', padding: Spacing.three, borderRadius: 12 }}>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                    {supplier.notes}
                  </AppText>
                </View>
              )}

              {/* Primary Action Button */}
              <View style={{ marginTop: Spacing.two }}>
                <Button
                  title="📦 Record Stock Received"
                  variant="primary"
                  onPress={() =>
                    router.push({
                      pathname: '/receive-stock' as any,
                      params: { supplierId: supplier.id },
                    })
                  }
                />
              </View>
            </ThemedView>

            {/* Lifetime Procurement Summary */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Procurement Summary
              </AppText>

              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Stock Receipts
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', marginTop: 2 }}>
                    {supplier.receiptCount}
                  </AppText>
                </View>

                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Total Purchase Value
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981', marginTop: 2 }}>
                    ₹{supplier.totalPurchaseValue.toLocaleString('en-IN')}
                  </AppText>
                </View>

                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Last Received
                  </AppText>
                  <AppText variant="subtitle" style={{ fontWeight: '800', marginTop: 4 }}>
                    {lastDateStr}
                  </AppText>
                </View>
              </View>
            </ThemedView>

            {/* Recent Stock Receipts List */}
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              <PageHeader
                title="Recent Stock Receipts"
                subtitle="Historical procurement receipts logged for this vendor."
              />

              {receipts.length > 0 ? (
                <View style={{ gap: Spacing.two }}>
                  {receipts.map((rec) => {
                    const formattedDate = new Date(rec.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <Pressable
                        key={rec.id}
                        onPress={() =>
                          router.push({
                            pathname: '/stock-receipt-details' as any,
                            params: { receiptId: rec.id },
                          })
                        }
                      >
                        <ThemedView type="backgroundElement" style={[styles.receiptCard, { borderColor: '#9CA3AF22' }]}>
                          <View style={{ flex: 1, gap: 2 }}>
                            <View style={styles.receiptHeaderRow}>
                              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                                Receipt {rec.id}
                              </AppText>
                              <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                                View Details →
                              </AppText>
                            </View>

                            <AppText variant="caption" style={{ color: theme.textSecondary }}>
                              {rec.totalProductsCount} products • {rec.totalUnitsReceived} sellable units
                            </AppText>
                            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                              Received on {formattedDate}
                            </AppText>
                          </View>

                          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                            <AppText variant="h3" style={{ fontWeight: '800', color: '#10B981' }}>
                              {rec.totalPurchaseValue !== undefined ? `₹${rec.totalPurchaseValue}` : 'Cost N/A'}
                            </AppText>
                            {rec.hasUnknownCosts && (
                              <AppText variant="caption" style={{ color: '#D97706', fontSize: 10, marginTop: 2 }}>
                                (Some costs omitted)
                              </AppText>
                            )}
                          </View>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <ThemedView type="backgroundElement" style={styles.emptyCard}>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    No Stock Receipts Recorded
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    No stock receipts have been recorded for this supplier yet.
                  </AppText>
                </ThemedView>
              )}
            </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressBox: {
    backgroundColor: '#9CA3AF11',
    padding: Spacing.three,
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#9CA3AF11',
    padding: Spacing.three,
    borderRadius: 12,
  },
  receiptCard: {
    padding: Spacing.four,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  receiptHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
