import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { orderService } from '@/services/order-service';
import { returnService } from '@/services/return-service';
import { Order } from '@/types/order';
import { InventoryDisposition, ReturnReason } from '@/types/return';

interface ItemReturnState {
  productId: string;
  productName: string;
  quantityOrdered: number;
  quantityPreviouslyReturned: number;
  maxReturnable: number;
  quantityReturning: number;
  unitPrice: number;
  refundPerUnit: number;
  totalItemRefund: number;
  disposition: InventoryDisposition;
}

export default function CreateReturnScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recordCustomerReturn } = useProducts();

  const orderId =
    typeof params.orderId === 'string'
      ? params.orderId
      : Array.isArray(params.orderId)
        ? params.orderId[0]
        : '';

  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [step, setStep] = useState<'builder' | 'review'>('builder');
  const [itemsState, setItemsState] = useState<ItemReturnState[]>([]);
  const [selectedReason, setSelectedReason] = useState<ReturnReason>('Damaged');
  const [otherReason, setOtherReason] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!orderId) return;

    orderService
      .getOrderById(orderId)
      .then((ord) => {
        if (isMounted && ord) {
          setOrder(ord);
          const returnedMap = ord.returnedItemQuantities || {};

          const initStates: ItemReturnState[] = ord.items.map((item) => {
            const prevReturned = returnedMap[item.productId] || 0;
            const maxAllowed = Math.max(0, item.quantity - prevReturned);
            const { refundAmountPerUnit, totalItemRefund } = returnService.calculateItemRefund(
              ord,
              item.productId,
              maxAllowed > 0 ? 1 : 0
            );

            return {
              productId: item.productId,
              productName: item.productName,
              quantityOrdered: item.quantity,
              quantityPreviouslyReturned: prevReturned,
              maxReturnable: maxAllowed,
              quantityReturning: maxAllowed > 0 ? 1 : 0,
              unitPrice: item.unitPrice,
              refundPerUnit: refundAmountPerUnit,
              totalItemRefund: maxAllowed > 0 ? totalItemRefund : 0,
              disposition: 'sellable',
            };
          });

          setItemsState(initStates);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load order for return:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!loading && !order) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Return / Refund' }} />
        <ThemedView type="backgroundElement" style={styles.emptyCard}>
          <AppText variant="h2">Order Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            No order matching the specified ID was found.
          </AppText>
          <Button title="Back to Orders" variant="primary" onPress={() => router.replace('/(tabs)/orders' as any)} />
        </ThemedView>
      </Screen>
    );
  }

  const handleUpdateQty = (productId: string, newQty: number) => {
    if (!order) return;
    setItemsState((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const boundedQty = Math.max(0, Math.min(newQty, item.maxReturnable));
          const { totalItemRefund } = returnService.calculateItemRefund(order, productId, boundedQty);
          return {
            ...item,
            quantityReturning: boundedQty,
            totalItemRefund,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateItemDisposition = (productId: string, disp: InventoryDisposition) => {
    setItemsState((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, disposition: disp } : item))
    );
  };

  const activeReturningItems = itemsState.filter((i) => i.quantityReturning > 0);
  const totalRefundAmount = activeReturningItems.reduce((sum, i) => sum + i.totalItemRefund, 0);

  const handleProceedToReview = () => {
    setErrorMsg(null);
    if (activeReturningItems.length === 0) {
      setErrorMsg('Please select at least one item and quantity to return.');
      return;
    }
    setStep('review');
  };

  const handleConfirmReturn = async () => {
    if (!order) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const finalReason = selectedReason === 'Other' ? otherReason.trim() || 'Other' : selectedReason;
      const itemsToReturn = activeReturningItems.map((i) => ({
        productId: i.productId,
        quantityReturning: i.quantityReturning,
        disposition: i.disposition || 'sellable',
      }));

      const res = await recordCustomerReturn({
        orderId: order.id,
        itemsToReturn,
        reason: finalReason,
        notes,
      });

      router.replace({
        pathname: '/return-details' as any,
        params: { returnId: res.id },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process return.');
      setIsSubmitting(false);
    }
  };

  const reasonsList: ReturnReason[] = [
    'Damaged',
    'Wrong item',
    'Quality issue',
    'Customer changed mind',
    'Expired',
    'Missing item',
    'Other',
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Process Return / Refund' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 32, BottomTabInset + Spacing.six) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {order && step === 'builder' && (
          <>
            <PageHeader
              title={`Return Items (${order.orderNumber})`}
              subtitle={`Customer: ${order.customer.name} (${order.customer.phone})`}
            />

            {/* Item Selection Block */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                1. Select Items & Quantities to Return
              </AppText>

              {itemsState.map((item) => (
                <View key={item.productId} style={[styles.itemCard, { borderColor: '#9CA3AF22' }]}>
                  <View style={styles.itemHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {item.productName}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        Ordered: {item.quantityOrdered} unit(s) • Previously returned: {item.quantityPreviouslyReturned}
                      </AppText>
                      <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700', marginTop: 2 }}>
                        Unit Price: ₹{item.unitPrice} • Refund/unit: ₹{item.refundPerUnit}
                      </AppText>
                    </View>
                  </View>

                  {item.maxReturnable > 0 ? (
                    <View style={styles.qtyRow}>
                      <AppText variant="caption" style={{ fontWeight: '700' }}>
                        Return Quantity (Max {item.maxReturnable}):
                      </AppText>
                      <View style={styles.stepper}>
                        <Pressable
                          style={styles.stepBtn}
                          onPress={() => handleUpdateQty(item.productId, item.quantityReturning - 1)}
                        >
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>-</AppText>
                        </Pressable>
                        <AppText variant="subtitle" style={{ fontWeight: '800', width: 36, textAlign: 'center' }}>
                          {item.quantityReturning}
                        </AppText>
                        <Pressable
                          style={styles.stepBtn}
                          onPress={() => handleUpdateQty(item.productId, item.quantityReturning + 1)}
                        >
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>+</AppText>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.fullyReturnedBadge}>
                      <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>
                        ✓ Fully returned previously
                      </AppText>
                    </View>
                  )}

                  {item.quantityReturning > 0 && (
                    <View style={styles.itemDispositionBox}>
                      <AppText variant="caption" style={{ fontWeight: '700', marginBottom: 4 }}>
                        Physical Stock Disposition for this item:
                      </AppText>
                      <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                        {(['sellable', 'damaged', 'unsellable'] as InventoryDisposition[]).map((disp) => {
                          const active = item.disposition === disp;
                          return (
                            <Pressable
                              key={disp}
                              style={[
                                styles.dispChip,
                                {
                                  backgroundColor: active ? '#2563EB' : theme.background,
                                  borderColor: active ? '#2563EB' : '#9CA3AF44',
                                },
                              ]}
                              onPress={() => handleUpdateItemDisposition(item.productId, disp)}
                            >
                              <AppText
                                variant="caption"
                                style={{
                                  color: active ? '#FFFFFF' : theme.text,
                                  fontWeight: active ? '700' : '500',
                                  fontSize: 11,
                                }}
                              >
                                {disp === 'sellable' ? '✓ Sellable (+stock)' : disp === 'damaged' ? '⚠️ Damaged' : '🚫 Unsellable'}
                              </AppText>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  <View style={styles.itemRefundRow}>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Calculated Item Refund:
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                      ₹{item.totalItemRefund}
                    </AppText>
                  </View>
                </View>
              ))}
            </ThemedView>

            {/* Reason Selection */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                2. Select Return Reason *
              </AppText>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two, paddingVertical: 4 }}>
                {reasonsList.map((reason) => {
                  const active = selectedReason === reason;
                  return (
                    <Pressable
                      key={reason}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? '#2563EB' : theme.background,
                          borderColor: active ? '#2563EB' : '#9CA3AF44',
                        },
                      ]}
                      onPress={() => setSelectedReason(reason)}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: active ? '#FFFFFF' : theme.text,
                          fontWeight: active ? '700' : '500',
                        }}
                      >
                        {reason}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {selectedReason === 'Other' && (
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="Enter specific return reason..."
                  placeholderTextColor={theme.textSecondary}
                  value={otherReason}
                  onChangeText={setOtherReason}
                />
              )}
            </ThemedView>

            {/* Notes & Summary Action */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.summaryRow}>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  Total Items Returning:
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  {activeReturningItems.reduce((acc, i) => acc + i.quantityReturning, 0)} units
                </AppText>
              </View>

              <View style={styles.summaryRow}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Total Refund Amount:
                </AppText>
                <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                  ₹{totalRefundAmount}
                </AppText>
              </View>

              {errorMsg && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {errorMsg}
                </AppText>
              )}

              <Button title="Review Return & Refund" variant="primary" onPress={handleProceedToReview} />
            </ThemedView>
          </>
        )}

        {/* STEP 2: REVIEW RETURN */}
        {order && step === 'review' && (
          <>
            <PageHeader
              title="Review Return & Refund"
              subtitle={`Confirm return for ${order.orderNumber} (${order.customer.name})`}
            />

            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.reviewHeaderRow}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Order Number
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  {order.orderNumber}
                </AppText>
              </View>

              <View style={styles.reviewHeaderRow}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Customer
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  {order.customer.name} ({order.customer.phone})
                </AppText>
              </View>

              <View style={styles.reviewHeaderRow}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Original Payment Method
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '700', color: '#2563EB' }}>
                  {order.paymentMethod === 'COD' ? 'Cash on Delivery (Manual Refund)' : order.paymentMethod}
                </AppText>
              </View>

              <View style={styles.reviewHeaderRow}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Return Reason
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  {selectedReason === 'Other' ? otherReason || 'Other' : selectedReason}
                </AppText>
              </View>

              <View style={styles.divider} />

              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Items to Return:
              </AppText>

              {activeReturningItems.map((i) => (
                <View key={i.productId} style={styles.reviewItemRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                      {i.productName}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {i.quantityReturning} unit(s) • Disposition: {i.disposition}
                    </AppText>
                  </View>
                  <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                    ₹{i.totalItemRefund}
                  </AppText>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Total Refund Amount:
                </AppText>
                <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                  ₹{totalRefundAmount}
                </AppText>
              </View>

              <View style={{ marginTop: Spacing.two }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Notes (Optional)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, marginTop: 4 }]}
                  placeholder="e.g. Verified return condition"
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {errorMsg && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {errorMsg}
                </AppText>
              )}

              <View style={styles.btnRow}>
                <View style={{ flex: 1 }}>
                  <Button title="Edit Return" variant="secondary" onPress={() => setStep('builder')} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={isSubmitting ? 'Processing...' : 'Confirm Return'}
                    variant="primary"
                    onPress={handleConfirmReturn}
                  />
                </View>
              </View>
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
  itemCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing.two,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF44',
    borderRadius: 10,
    height: 36,
  },
  stepBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullyReturnedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  itemDispositionBox: {
    backgroundColor: '#9CA3AF11',
    padding: Spacing.two,
    borderRadius: 10,
    marginTop: 4,
  },
  dispChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemRefundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#9CA3AF22',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
