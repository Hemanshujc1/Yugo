import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { AppText, Screen, ThemedView, Button, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks';

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = typeof params.orderId === 'string' ? params.orderId : Array.isArray(params.orderId) ? params.orderId[0] : '';

  const {
    getOrderById,
    acceptOrder,
    startPreparingOrder,
    cancelOrder,
    markOrderReady,
    verifyCustomerPickupOtp,
    simulateDeliveryCompletion,
    markCodCashCollected,
  } = useOrders();

  const order = getOrderById(orderId);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // COD Cash Collection Modal State
  const [isCodModalOpen, setIsCodModalOpen] = useState(false);
  const [codAmountInput, setCodAmountInput] = useState('');

  if (!order) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background, padding: Spacing.four }]}>
        <Stack.Screen options={{ title: 'Order Details' }} />
        <PageHeader title="Order Details" subtitle="Fulfillment Lifecycle" />
        <ThemedView
          type="backgroundElement"
          style={{
            marginTop: Spacing.four,
            padding: Spacing.six,
            borderRadius: 16,
            alignItems: 'center',
            gap: Spacing.three,
            borderColor: '#9CA3AF22',
            borderWidth: 1,
          }}
        >
          <AppText style={{ fontSize: 40 }}>📦</AppText>
          <AppText variant="subtitle" style={{ fontWeight: '800', textAlign: 'center' }}>
            Order not found
          </AppText>
          <AppText variant="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
            This order could not be found or may have been removed.
          </AppText>
          <Button
            title="Back to Orders"
            variant="primary"
            style={{ marginTop: Spacing.two, minWidth: 180 }}
            onPress={() => (router.canGoBack() ? router.back() : router.push('/orders' as any))}
          />
        </ThemedView>
      </Screen>
    );
  }

  const isNew = order.orderStatus === 'new';
  const isAccepted = order.orderStatus === 'accepted';
  const isPreparing = order.orderStatus === 'preparing';
  const isReady = order.orderStatus === 'ready_for_pickup';
  const isDelivered = order.orderStatus === 'delivered';
  const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'rejected';

  // Compute Platform Fee & Net Earnings
  const platformFee = Math.round(order.total * 0.03); // 3% Yugo platform fee
  const netEarnings = Math.max(0, order.total - platformFee - order.deliveryFee);

  const handleAccept = async () => {
    try {
      await acceptOrder(order.id);
    } catch (err: any) {
      Alert.alert('Unable to Accept Order', err.message || 'Inventory validation failed.');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Please enter a cancellation reason.');
      return;
    }
    try {
      await cancelOrder(order.id, cancelReason.trim(), 'Shopkeeper');
      setIsCancelModalOpen(false);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel order.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpError(null);
    const res = await verifyCustomerPickupOtp(order.id, otpInput);
    if (res.success) {
      setIsOtpModalOpen(false);
      setOtpInput('');
    } else {
      setOtpError(res.message || 'Invalid OTP');
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: order.orderNumber }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* A. ORDER HEADER */}
        <PageHeader
          showBack
          title={`Order ${order.orderNumber}`}
          subtitle={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
          action={<StatusBadge status={order.orderStatus} size="sm" />}
        />

        {/* B. CUSTOMER INFORMATION */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Customer Details
          </AppText>

          <View style={{ gap: 4 }}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              {order.customer.name}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
              📞 Phone: {order.customer.phone}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              📍 Address: {order.customer.address}, {order.customer.city}
            </AppText>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: '#9CA3AF22', paddingTop: Spacing.two, marginTop: 2 }}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/customer-details' as any,
                  params: { phone: order.customer.phone },
                })
              }
            >
              <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                View Customer Profile →
              </AppText>
            </Pressable>
          </View>
        </ThemedView>

        {/* C. ORDERED ITEMS */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Ordered Items ({order.items.length})
          </AppText>

          <View style={{ gap: Spacing.two }}>
            {order.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    {item.productName}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                    Pack Size: {item.packSize || 'Standard'} • Qty: {item.quantity} packets
                  </AppText>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    ₹{item.finalPrice}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                    ₹{item.unitPrice} / packet
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* D. FINANCIAL & PAYMENT BREAKDOWN */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#10B98144' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Financial & Payment Breakdown
          </AppText>

          <View style={styles.financialRows}>
            <View style={styles.finRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Items Subtotal</AppText>
              <AppText variant="caption" style={{ fontWeight: '700' }}>₹{order.subtotal}</AppText>
            </View>

            {order.discount > 0 && (
              <View style={styles.finRow}>
                <AppText variant="caption" style={{ color: '#10B981' }}>Discount Applied</AppText>
                <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>-₹{order.discount}</AppText>
              </View>
            )}

            <View style={styles.finRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Delivery Fee</AppText>
              <AppText variant="caption" style={{ fontWeight: '700' }}>₹{order.deliveryFee}</AppText>
            </View>

            <View style={styles.finRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Tax / GST</AppText>
              <AppText variant="caption" style={{ fontWeight: '700' }}>₹{order.tax}</AppText>
            </View>

            <View style={[styles.finRow, { paddingTop: 6, borderTopWidth: 1, borderTopColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>Customer Gross Total</AppText>
              <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>₹{order.total}</AppText>
            </View>

            <View style={styles.finRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Payment Method / Status</AppText>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                {order.paymentMethod} • {order.paymentStatus}
              </AppText>
            </View>

            <View style={[styles.netEarningsBox, { backgroundColor: '#E6F4EA' }]}>
              <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>
                Net Shopkeeper Earnings
              </AppText>
              <AppText variant="h2" style={{ color: '#10B981', fontWeight: '800' }}>
                ₹{netEarnings}
              </AppText>
              <AppText variant="caption" style={{ color: '#10B981', fontSize: 10 }}>
                Est. platform fee: ₹{platformFee} deducted
              </AppText>
            </View>
          </View>
        </ThemedView>

        {/* E. DELIVERY INFORMATION */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#2563EB44' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Delivery Operations & Dispatch
          </AppText>

          <View style={{ gap: 4 }}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Mode: {order.deliveryType} ({order.deliveryDetails?.fulfillmentMethod || 'Default'})
            </AppText>

            {order.deliveryDetails?.assignedStaff ? (
              <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                Assigned Staff: {order.deliveryDetails.assignedStaff.name} ({order.deliveryDetails.assignedStaff.phone})
              </AppText>
            ) : order.deliveryPartner ? (
              <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                Rider: {order.deliveryPartner.name} ({order.deliveryPartner.phone})
              </AppText>
            ) : (
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Rider / Staff: Pending Assignment
              </AppText>
            )}

            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
              Delivery OTP Responsibility: Entered by delivery partner in Delivery App upon handoff.
            </AppText>
          </View>
        </ThemedView>

        {/* F. ORDER STATUS TIMELINE HISTORY */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Order Event Timeline & History
          </AppText>

          <View style={{ gap: Spacing.two }}>
            {order.statusHistory && order.statusHistory.length > 0 ? (
              order.statusHistory.map((evt) => (
                <View key={evt.id} style={styles.historyRow}>
                  <View style={styles.historyDot} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" style={{ fontWeight: '800' }}>
                      {evt.status.replace('_', ' ').toUpperCase()} • {evt.actorType} ({evt.actorName || 'System'})
                    </AppText>
                    {evt.note && (
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        {evt.note}
                      </AppText>
                    )}
                  </View>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </AppText>
                </View>
              ))
            ) : (
              order.timeline.map((evt, idx) => (
                <View key={idx} style={styles.historyRow}>
                  <View style={[styles.historyDot, { backgroundColor: evt.completed ? '#10B981' : '#9CA3AF' }]} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" style={{ fontWeight: evt.completed ? '800' : '500' }}>
                      {evt.label}
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                    {evt.timestamp}
                  </AppText>
                </View>
              ))
            )}
          </View>
        </ThemedView>

        {/* OPERATIONAL ACTIONS FOOTER */}
        <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
          {isNew && (
            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <View style={{ flex: 1 }}>
                <Button title="Reject Order" variant="secondary" onPress={() => setCancelReason('')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Accept Order" variant="primary" onPress={handleAccept} />
              </View>
            </View>
          )}

          {isAccepted && (
            <Button title="Start Preparing Order" variant="primary" onPress={() => startPreparingOrder(order.id)} />
          )}

          {isPreparing && (
            <Button title="Mark Ready for Pickup" variant="primary" onPress={() => markOrderReady(order.id)} />
          )}

          {isReady && order.deliveryType === 'Pickup' && (
            <Button title="Verify Customer Pickup OTP" variant="primary" onPress={() => setIsOtpModalOpen(true)} />
          )}

          {isReady && order.deliveryType === 'Delivery' && (
            <Button title="Dispatch with Yugo Rider (Mock)" variant="primary" onPress={() => simulateDeliveryCompletion(order.id, 'yugo_rider')} />
          )}

          {order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' && (
            <Button
              title={`💵 Mark COD Cash Collected (₹${order.total})`}
              variant="primary"
              onPress={() => {
                setCodAmountInput(String(order.total));
                setIsCodModalOpen(true);
              }}
            />
          )}

          {!isDelivered && !isCancelled && (
            <Button title="Cancel Order" variant="secondary" onPress={() => setIsCancelModalOpen(true)} />
          )}
        </View>
      </ScrollView>

      {/* Cancellation Modal */}
      <Modal visible={isCancelModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800', color: '#DC2626' }}>
              Cancel Order
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Provide an official cancellation reason:
            </AppText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. Item damaged during packing"
              placeholderTextColor={theme.textSecondary}
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            {cancelError && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {cancelError}
              </AppText>
            )}

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Close" variant="secondary" onPress={() => setIsCancelModalOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Cancel" variant="primary" onPress={handleConfirmCancel} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Fallback OTP Verification Modal */}
      <Modal visible={isOtpModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Customer Pickup OTP
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Enter customer 6-digit pickup confirmation OTP (Mock default: 123456):
            </AppText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, letterSpacing: 4, textAlign: 'center', fontSize: 18 }]}
              placeholder="123456"
              placeholderTextColor={theme.textSecondary}
              value={otpInput}
              onChangeText={setOtpInput}
              keyboardType="numeric"
              maxLength={6}
            />

            {otpError && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {otpError}
              </AppText>
            )}

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setIsOtpModalOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Pickup" variant="primary" onPress={handleVerifyOtp} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* COD Cash Collection Modal */}
      <Modal visible={isCodModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Confirm COD Cash Collection
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Confirm amount received in cash for Order {order.orderNumber}:
            </AppText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, fontWeight: '800', fontSize: 16 }]}
              placeholder={`₹${order.total}`}
              placeholderTextColor={theme.textSecondary}
              value={codAmountInput}
              onChangeText={setCodAmountInput}
              keyboardType="numeric"
            />

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setIsCodModalOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Confirm Received"
                  variant="primary"
                  onPress={async () => {
                    const amt = parseFloat(codAmountInput) || order.total;
                    try {
                      await markCodCashCollected(order.id, amt);
                      setIsCodModalOpen(false);
                    } catch (err: any) {
                      Alert.alert('Collection Error', err.message);
                    }
                  }}
                />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  notFoundContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF15',
  },
  financialRows: {
    gap: Spacing.two,
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  netEarningsBox: {
    padding: Spacing.three,
    borderRadius: 14,
    marginTop: 4,
    gap: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 4,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    borderRadius: 20,
    padding: Spacing.five,
    gap: Spacing.three,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
