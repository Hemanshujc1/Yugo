import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders, useShopSettings } from '@/hooks';
import type { OrderStatus } from '@/types/order';
import type { DeliveryStaffMember } from '@/types/shop-settings';

type FilterTab = 'all' | 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    orders,
    acceptOrder,
    startPreparingOrder,
    rejectOrder,
    markOrderReady,
    setSelfDelivery,
    verifyCustomerPickupOtp,
    simulateDeliveryCompletion,
  } = useOrders();
  const { deliveryStaff } = useShopSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Rejection Modal State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState('Out of stock');
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Staff Assignment Modal State
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  // Customer Pickup OTP Modal State
  const [pickupOrderId, setPickupOrderId] = useState<string | null>(null);
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [pickupErrorMsg, setPickupErrorMsg] = useState<string | null>(null);

  const activeStaffList = deliveryStaff.filter((s: DeliveryStaffMember) => s.isActive);

  // Dynamic Header Metrics
  const newCount = orders.filter((o) => o.orderStatus === 'new').length;
  const activeCount = orders.filter((o) => o.orderStatus === 'accepted' || o.orderStatus === 'preparing').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'ready_for_pickup').length;

  const filterChips: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'new', label: 'New', count: newCount },
    { key: 'preparing', label: 'Preparing', count: activeCount },
    { key: 'ready', label: 'Ready', count: readyCount },
    { key: 'out_for_delivery', label: 'Out for Delivery', count: orders.filter((o) => o.orderStatus === 'out_for_delivery').length },
    { key: 'delivered', label: 'Delivered', count: orders.filter((o) => o.orderStatus === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.orderStatus === 'cancelled' || o.orderStatus === 'rejected').length },
  ];

  // Filtering & Operational Priority Sorting
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q);

    if (!matchesQuery) return false;

    if (activeFilter === 'new') return o.orderStatus === 'new';
    if (activeFilter === 'preparing') return o.orderStatus === 'accepted' || o.orderStatus === 'preparing';
    if (activeFilter === 'ready') return o.orderStatus === 'ready_for_pickup';
    if (activeFilter === 'out_for_delivery') return o.orderStatus === 'out_for_delivery';
    if (activeFilter === 'delivered') return o.orderStatus === 'delivered';
    if (activeFilter === 'cancelled') return o.orderStatus === 'cancelled' || o.orderStatus === 'rejected';
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const priority = (s: OrderStatus) => {
      if (s === 'new') return 1;
      if (s === 'accepted') return 2;
      if (s === 'preparing') return 3;
      if (s === 'ready_for_pickup') return 4;
      if (s === 'out_for_delivery') return 5;
      if (s === 'delivered') return 6;
      return 7;
    };
    return priority(a.orderStatus) - priority(b.orderStatus);
  });

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
    } catch (err: any) {
      Alert.alert('Unable to Accept Order', err.message || 'Inventory validation failed.');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingOrderId) return;
    const finalReason = selectedRejectReason === 'Other' ? (customRejectReason.trim() || 'Other reason') : selectedRejectReason;
    try {
      await rejectOrder(rejectingOrderId, finalReason);
      setRejectingOrderId(null);
    } catch (err: any) {
      Alert.alert('Failed to Reject Order', err.message);
    }
  };

  const handleAssignStaff = async (staffMember: DeliveryStaffMember) => {
    if (!assigningOrderId) return;
    try {
      await setSelfDelivery(assigningOrderId);
      setAssigningOrderId(null);
    } catch (err: any) {
      Alert.alert('Failed to Assign Delivery Staff', err.message);
    }
  };

  const handleVerifyCustomerPickup = async () => {
    if (!pickupOrderId) return;
    setPickupErrorMsg(null);

    const res = await verifyCustomerPickupOtp(pickupOrderId, pickupOtpInput);
    if (res.success) {
      setPickupOrderId(null);
      setPickupOtpInput('');
    } else {
      setPickupErrorMsg(res.message || 'Invalid OTP');
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* HEADER SECTION */}
        <PageHeader
          title="Orders"
          subtitle={`${newCount} new • ${activeCount} active • ${readyCount} ready for pickup today`}
        />

        {/* STICKY SEARCH BAR & FILTER CHIPS */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: '#9CA3AF44' }]}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>🔍</AppText>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by order #, customer name, or phone..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {Boolean(searchQuery) && (
              <Pressable onPress={() => setSearchQuery('')}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>✕</AppText>
              </Pressable>
            )}
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one, marginTop: 6 }}>
            {filterChips.map((chip) => {
              const active = activeFilter === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? '#2563EB' : theme.background,
                      borderColor: active ? '#2563EB' : '#9CA3AF44',
                    },
                  ]}
                  onPress={() => setActiveFilter(chip.key)}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: active ? '#FFFFFF' : theme.text,
                      fontWeight: active ? '800' : '500',
                      fontSize: 11,
                    }}
                  >
                    {chip.label} ({chip.count})
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {/* ORDERS LIST */}
        <View style={{ gap: Spacing.three, marginTop: Spacing.two }}>
          {sortedOrders.length > 0 ? (
            sortedOrders.map((order) => {
              const isNew = order.orderStatus === 'new';
              const isAccepted = order.orderStatus === 'accepted';
              const isPreparing = order.orderStatus === 'preparing';
              const isReady = order.orderStatus === 'ready_for_pickup';
              const isOut = order.orderStatus === 'out_for_delivery';
              const isDelivered = order.orderStatus === 'delivered';
              const isCancelled = order.orderStatus === 'cancelled' || order.orderStatus === 'rejected';

              return (
                <ThemedView
                  key={order.id}
                  type="backgroundElement"
                  style={[
                    styles.orderCard,
                    {
                      borderColor: isNew ? '#DC2626' : isReady ? '#0284C7' : '#9CA3AF22',
                      borderWidth: isNew || isReady ? 2 : 1,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      router.push({ pathname: '/order-details' as any, params: { orderId: order.id } })
                    }
                  >
                    {/* Header Row */}
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                            {order.orderNumber}
                          </AppText>

                          <StatusBadge status={order.orderStatus} size="sm" />
                        </View>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Customer: {order.customer.name} ({order.customer.phone})
                        </AppText>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <AppText variant="h3" style={{ fontWeight: '800', color: '#10B981' }}>
                          ₹{order.total}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                          {order.paymentMethod} • {order.paymentStatus}
                        </AppText>
                      </View>
                    </View>

                    {/* Order Summary Line */}
                    <View style={styles.summaryRow}>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        📦 {order.items.length} items • {order.deliveryType}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Received {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </AppText>
                    </View>

                    {/* Rejection / Cancellation Note */}
                    {(order.rejectionReason || order.cancellationReason) && (
                      <View style={styles.reasonBox}>
                        <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700', fontSize: 11 }}>
                          Reason: {order.rejectionReason || order.cancellationReason}
                        </AppText>
                      </View>
                    )}
                  </Pressable>

                  {/* OPERATIONAL ACTION BUTTONS */}
                  <View style={styles.actionRow}>
                    {isNew && (
                      <>
                        <View style={{ flex: 1 }}>
                          <Button
                            title="✕ Reject"
                            variant="secondary"
                            size="sm"
                            onPress={() => setRejectingOrderId(order.id)}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Button
                            title="✓ Accept Order"
                            variant="primary"
                            size="sm"
                            onPress={() => handleAcceptOrder(order.id)}
                          />
                        </View>
                      </>
                    )}

                    {isAccepted && (
                      <View style={{ flex: 1 }}>
                        <Button
                          title="⚡ Start Preparing"
                          variant="primary"
                          size="sm"
                          onPress={() => startPreparingOrder(order.id)}
                        />
                      </View>
                    )}

                    {isPreparing && (
                      <View style={{ flex: 1 }}>
                        <Button
                          title="📦 Mark Ready for Pickup"
                          variant="primary"
                          size="sm"
                          onPress={() => markOrderReady(order.id)}
                        />
                      </View>
                    )}

                    {isReady && (
                      <View style={{ flexDirection: 'row', gap: Spacing.two, flex: 1 }}>
                        {order.deliveryType === 'Pickup' ? (
                          <Button
                            title="🔑 Confirm Customer Pickup"
                            variant="primary"
                            size="sm"
                            onPress={() => setPickupOrderId(order.id)}
                          />
                        ) : (
                          <>
                            <Button
                              title="🛵 Assign Shop Staff"
                              variant="secondary"
                              size="sm"
                              onPress={() => setAssigningOrderId(order.id)}
                            />
                            <Button
                              title="🚀 Yugo Rider Dispatch"
                              variant="primary"
                              size="sm"
                              onPress={() => simulateDeliveryCompletion(order.id, 'yugo_rider')}
                            />
                          </>
                        )}
                      </View>
                    )}

                    {isOut && (
                      <Button
                        title="✓ Complete Delivery (Mock)"
                        variant="secondary"
                        size="sm"
                        onPress={() => simulateDeliveryCompletion(order.id, 'shop_staff')}
                      />
                    )}

                    {(isDelivered || isCancelled) && (
                      <Pressable onPress={() => router.push({ pathname: '/order-details' as any, params: { orderId: order.id } })}>
                        <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                          View Order Details →
                        </AppText>
                      </Pressable>
                    )}
                  </View>
                </ThemedView>
              );
            })
          ) : (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                No orders match your filter
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                Try selecting another filter chip or clearing your search.
              </AppText>
            </ThemedView>
          )}
        </View>
      </ScrollView>

      {/* Reject Order Reason Modal */}
      <Modal visible={Boolean(rejectingOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800', color: '#DC2626' }}>
              Reject Order
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Select a reason for rejecting this customer order:
            </AppText>

            <View style={{ gap: Spacing.two, paddingVertical: Spacing.two }}>
              {['Out of stock', 'Shop too busy', 'Item unavailable', 'Delivery unavailable', 'Shop closing soon', 'Other'].map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.reasonOption,
                    {
                      backgroundColor: selectedRejectReason === r ? '#FEE2E2' : theme.background,
                      borderColor: selectedRejectReason === r ? '#DC2626' : '#9CA3AF44',
                    },
                  ]}
                  onPress={() => setSelectedRejectReason(r)}
                >
                  <AppText variant="caption" style={{ fontWeight: selectedRejectReason === r ? '800' : '500' }}>
                    {r}
                  </AppText>
                </Pressable>
              ))}

              {selectedRejectReason === 'Other' && (
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="Specify reason..."
                  placeholderTextColor={theme.textSecondary}
                  value={customRejectReason}
                  onChangeText={setCustomRejectReason}
                />
              )}
            </View>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setRejectingOrderId(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Reject" variant="primary" onPress={handleConfirmReject} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Assign Delivery Staff Modal */}
      <Modal visible={Boolean(assigningOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Assign Shop Delivery Staff
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.two }}>
              {activeStaffList.length > 0 ? (
                activeStaffList.map((staff) => (
                  <Pressable
                    key={staff.id}
                    style={styles.staffCard}
                    onPress={() => handleAssignStaff(staff)}
                  >
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {staff.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        Phone: {staff.phone} • Status: Active
                      </AppText>
                    </View>
                    <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                      Assign →
                    </AppText>
                  </Pressable>
                ))
              ) : (
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  No active shop delivery staff found. Add staff in Shop Settings → Delivery Staff.
                </AppText>
              )}
            </ScrollView>

            <Button title="Close" variant="secondary" onPress={() => setAssigningOrderId(null)} />
          </ThemedView>
        </View>
      </Modal>

      {/* Verify Customer Pickup OTP Modal */}
      <Modal visible={Boolean(pickupOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Verify Customer Pickup
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Ask customer for 6-digit Pickup OTP (Default mock: 123456):
            </AppText>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, letterSpacing: 4, textAlign: 'center', fontSize: 18 }]}
              placeholder="123456"
              placeholderTextColor={theme.textSecondary}
              value={pickupOtpInput}
              onChangeText={setPickupOtpInput}
              keyboardType="numeric"
              maxLength={6}
            />

            {pickupErrorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {pickupErrorMsg}
              </AppText>
            )}

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setPickupOrderId(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Pickup" variant="primary" onPress={handleVerifyCustomerPickup} />
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
    gap: Spacing.three,
  },
  stickySearchBar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginHorizontal: -Spacing.four,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 0,
  },
  orderCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
  },
  reasonBox: {
    padding: Spacing.two,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 2,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
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
    maxHeight: '80%',
    gap: Spacing.three,
  },
  reasonOption: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  staffCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    marginTop: 4,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
