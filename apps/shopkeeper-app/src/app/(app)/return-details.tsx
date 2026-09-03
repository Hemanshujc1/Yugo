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
import { CustomerReturn } from '@/types/return';

export default function ReturnDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getReturnById } = useProducts();

  const returnId =
    typeof params.returnId === 'string'
      ? params.returnId
      : Array.isArray(params.returnId)
        ? params.returnId[0]
        : '';

  const [returnRecord, setReturnRecord] = useState<CustomerReturn | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!returnId) return;

    getReturnById(returnId)
      .then((res) => {
        if (isMounted) {
          setReturnRecord(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load return details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [returnId, getReturnById]);

  if (!loading && !returnRecord) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Return Details' }} />
        <ThemedView type="backgroundElement" style={styles.emptyCard}>
          <AppText variant="h2">Return Record Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            No return record matching the specified ID was found.
          </AppText>
          <Button title="Back to Returns & Refunds" variant="primary" onPress={() => router.replace('/returns' as any)} />
        </ThemedView>
      </Screen>
    );
  }

  const formattedDate = returnRecord
    ? new Date(returnRecord.createdAt).toLocaleString([], {
        dateStyle: 'full',
        timeStyle: 'short',
      })
    : '';

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: returnRecord ? `Return ${returnRecord.id}` : 'Return Details' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {returnRecord && (
          <>
            <PageHeader
              showBack
              title={`Return ${returnRecord.id}`}
              subtitle={`Associated Order: ${returnRecord.orderNumber} • ${formattedDate}`}
            />

            {/* Overview Summary Card */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.infoRowBetween}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Customer
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  {returnRecord.customerName} ({returnRecord.customerPhone})
                </AppText>
              </View>

              <View style={styles.infoRowBetween}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Return Reason
                </AppText>
                <View style={styles.reasonBadge}>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    {returnRecord.reason}
                  </AppText>
                </View>
              </View>

              <View style={styles.infoRowBetween}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Refund Status
                </AppText>
                <View style={[styles.statusBadge, { backgroundColor: returnRecord.refundStatus === 'Refunded' ? '#E6F4EA' : '#FEF3C7' }]}>
                  <AppText
                    variant="caption"
                    style={{
                      color: returnRecord.refundStatus === 'Refunded' ? '#10B981' : '#D97706',
                      fontWeight: '800',
                    }}
                  >
                    ✓ {returnRecord.refundStatus} ({returnRecord.paymentMethod})
                  </AppText>
                </View>
              </View>

              {returnRecord.notes && (
                <View style={{ backgroundColor: '#9CA3AF11', padding: Spacing.three, borderRadius: 12 }}>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontStyle: 'italic' }}>
                    Notes: {returnRecord.notes}
                  </AppText>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.infoRowBetween}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Total Amount Refunded
                </AppText>
                <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                  ₹{returnRecord.refundAmount}
                </AppText>
              </View>
            </ThemedView>

            {/* Returned Items & Inventory Disposition */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Returned Items & Stock Disposition
              </AppText>

              {returnRecord.items.map((item) => (
                <View key={item.productId} style={styles.itemRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      {item.productName}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {item.quantityReturning} unit(s) returned @ ₹{item.refundAmountPerUnit} / unit
                    </AppText>

                    <View style={styles.dispBadge}>
                      <AppText variant="caption" style={{ color: '#4B5563', fontWeight: '700', fontSize: 11 }}>
                        Stock Impact: {item.disposition === 'sellable' ? '✓ Added to sellable stock' : item.disposition === 'damaged' ? '⚠️ Logged as damaged' : '🚫 Marked unsellable'}
                      </AppText>
                    </View>
                  </View>

                  <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                    ₹{item.totalItemRefund}
                  </AppText>
                </View>
              ))}
            </ThemedView>

            <Button
              title="View Associated Order Details"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/order-details' as any,
                  params: { orderId: returnRecord.orderId },
                })
              }
            />
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
  reasonBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#9CA3AF22',
  },
  itemRow: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF22',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dispBadge: {
    backgroundColor: '#9CA3AF11',
    paddingHorizontal: 6,
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
