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
import { Stack } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders, useShopSettings } from '@/hooks';
import type { DeliveryIssueType } from '@/types/order';
import type { DeliveryStaffMember } from '@/types/shop-settings';

export default function DeliveryOperationsScreen() {
  const theme = useTheme();
  const {
    orders,
    setSelfDelivery,
    reassignShopStaffDelivery,
    reportDeliveryIssue,
    verifyCustomerPickupOtp,
    simulateDeliveryCompletion,
    markCodCashCollected,
  } = useOrders();
  const { deliveryStaff } = useShopSettings();

  const activeStaffList = deliveryStaff.filter((s: DeliveryStaffMember) => s.isActive);

  // Modals state
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);
  const [reassigningOrderId, setReassigningOrderId] = useState<string | null>(null);

  const [issueOrderId, setIssueOrderId] = useState<string | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<DeliveryIssueType>('customer_unavailable');
  const [issueNote, setIssueNote] = useState('');

  const [pickupOrderId, setPickupOrderId] = useState<string | null>(null);
  const [pickupOtpInput, setPickupOtpInput] = useState('');
  const [pickupErrorMsg, setPickupErrorMsg] = useState<string | null>(null);

  // Dynamic Aggregations
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready_for_pickup');
  const outForDeliveryOrders = orders.filter((o) => o.orderStatus === 'out_for_delivery');
  const customerPickupOrders = orders.filter((o) => o.orderStatus === 'ready_for_pickup' && o.deliveryType === 'Pickup');
  const deliveryIssuesOrders = orders.filter((o) => Boolean(o.deliveryDetails?.issueReport));
  const completedTodayOrders = orders.filter((o) => o.orderStatus === 'delivered');

  const handleAssignStaff = async (staffMember: DeliveryStaffMember) => {
    if (!assigningOrderId) return;
    try {
      await setSelfDelivery(assigningOrderId);
      setAssigningOrderId(null);
    } catch (err: any) {
      Alert.alert('Failed to Assign Delivery Staff', err.message);
    }
  };

  const handleReassignStaff = async (staffMember: DeliveryStaffMember) => {
    if (!reassigningOrderId) return;
    try {
      await reassignShopStaffDelivery(reassigningOrderId, staffMember.id, staffMember.name, staffMember.phone);
      setReassigningOrderId(null);
    } catch (err: any) {
      Alert.alert('Failed to Reassign Delivery Staff', err.message);
    }
  };

  const handleReportIssue = async () => {
    if (!issueOrderId) return;
    try {
      await reportDeliveryIssue(issueOrderId, selectedIssueType, issueNote);
      setIssueOrderId(null);
      setIssueNote('');
    } catch (err: any) {
      Alert.alert('Failed to Report Issue', err.message);
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
      <Stack.Screen options={{ title: 'Delivery Operations' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title="Delivery Operations"
          subtitle="Manage today's pickups, staff assignments, and active dispatches."
        />

        {/* SUMMARY CARDS GRID (2x2 Grid) */}
        <View style={styles.summaryGrid}>
          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <AppText variant="h2" style={{ fontWeight: '800', color: '#0284C7' }}>
              {readyOrders.length}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700', textAlign: 'center' }}>
              Ready for Pickup
            </AppText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <AppText variant="h2" style={{ fontWeight: '800', color: '#7E22CE' }}>
              {outForDeliveryOrders.length}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700', textAlign: 'center' }}>
              Out for Delivery
            </AppText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
              {customerPickupOrders.length}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700', textAlign: 'center' }}>
              Customer Pickups
            </AppText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.summaryCard}>
            <AppText variant="h2" style={{ fontWeight: '800', color: '#DC2626' }}>
              {deliveryIssuesOrders.length}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700', textAlign: 'center' }}>
              Delivery Issues
            </AppText>
          </ThemedView>
        </View>

        {/* SECTION A: READY FOR PICKUP */}
        <SectionTitle title={`📦 Ready for Pickup (${readyOrders.length})`} />
        {readyOrders.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {readyOrders.map((order) => (
              <ThemedView key={order.id} type="backgroundElement" style={[styles.card, { borderColor: '#0284C744' }]}>
                <View style={styles.cardMainRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      {order.orderNumber} • ₹{order.total}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Customer: {order.customer.name} ({order.customer.phone})
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      Mode: {order.deliveryType} ({order.deliveryDetails?.fulfillmentMethod || 'Unassigned'})
                    </AppText>
                  </View>

                  <StatusBadge status="READY FOR PICKUP" size="sm" />
                </View>

                {/* Actions based on Delivery Mode */}
                <View style={styles.actionRow}>
                  {order.deliveryType === 'Pickup' ? (
                    <Button
                      title="🔑 Verify Customer Pickup OTP"
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
              </ThemedView>
            ))}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              No orders waiting for pickup right now.
            </AppText>
          </ThemedView>
        )}

        {/* SECTION B: OUT FOR DELIVERY */}
        <SectionTitle title={`🚚 Out for Delivery (${outForDeliveryOrders.length})`} />
        {outForDeliveryOrders.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {outForDeliveryOrders.map((order) => {
              const isCOD = order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid';
              const assignedName = order.deliveryDetails?.assignedStaff?.name || order.deliveryPartner?.name || 'Assigned Rider';

              return (
                <ThemedView key={order.id} type="backgroundElement" style={[styles.card, { borderColor: '#7E22CE44' }]}>
                  <View style={styles.cardMainRow}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {order.orderNumber} • ₹{order.total}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        Assigned: {assignedName} ({order.deliveryType})
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Address: {order.customer.address}
                      </AppText>

                      {isCOD && (
                        <View style={styles.codTag}>
                          <AppText variant="caption" style={{ color: '#D97706', fontWeight: '800', fontSize: 11 }}>
                            💵 Collect Cash: ₹{order.total} ({order.paymentStatus})
                          </AppText>
                        </View>
                      )}
                    </View>

                    <StatusBadge status="OUT FOR DELIVERY" size="sm" />
                  </View>

                  <View style={styles.actionRow}>
                    <Button
                      title="👥 Change Staff"
                      variant="secondary"
                      size="sm"
                      onPress={() => setReassigningOrderId(order.id)}
                    />
                    <Button
                      title="⚠️ Report Issue"
                      variant="secondary"
                      size="sm"
                      onPress={() => setIssueOrderId(order.id)}
                    />
                    <Button
                      title="✓ Complete (Mock)"
                      variant="primary"
                      size="sm"
                      onPress={() => simulateDeliveryCompletion(order.id, 'shop_staff')}
                    />
                  </View>
                </ThemedView>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              No active out-for-delivery orders.
            </AppText>
          </ThemedView>
        )}

        {/* SECTION C: RECENTLY COMPLETED TODAY */}
        <SectionTitle title={`✓ Completed Today (${completedTodayOrders.length})`} />
        {completedTodayOrders.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {completedTodayOrders.slice(0, 5).map((order) => {
              const isCodPending = order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid';
              return (
                <ThemedView key={order.id} type="backgroundElement" style={[styles.card, { borderColor: isCodPending ? '#F59E0B66' : '#10B98133' }]}>
                  <View style={styles.cardMainRow}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {order.orderNumber} • ₹{order.total}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {order.customer.name} • {order.deliveryType} • {order.paymentMethod} ({order.paymentStatus})
                      </AppText>
                    </View>
                    <StatusBadge status="DELIVERED" size="sm" />
                  </View>

                  {isCodPending && (
                    <View style={styles.actionRow}>
                      <Button
                        title={`💵 Mark Cash Collected (₹${order.total})`}
                        variant="primary"
                        size="sm"
                        onPress={() => markCodCashCollected(order.id, order.total)}
                      />
                    </View>
                  )}
                </ThemedView>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              No completed deliveries today yet.
            </AppText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Assign Staff Modal */}
      <Modal visible={Boolean(assigningOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Assign Shop Delivery Staff
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.two }}>
              {activeStaffList.map((staff) => (
                <Pressable key={staff.id} style={styles.staffCard} onPress={() => handleAssignStaff(staff)}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>{staff.name}</AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>Phone: {staff.phone}</AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>Assign →</AppText>
                </Pressable>
              ))}
            </ScrollView>

            <Button title="Cancel" variant="secondary" onPress={() => setAssigningOrderId(null)} />
          </ThemedView>
        </View>
      </Modal>

      {/* Reassign Staff Modal */}
      <Modal visible={Boolean(reassigningOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Change Delivery Staff
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.two }}>
              {activeStaffList.map((staff) => (
                <Pressable key={staff.id} style={styles.staffCard} onPress={() => handleReassignStaff(staff)}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>{staff.name}</AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>Phone: {staff.phone}</AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>Reassign →</AppText>
                </Pressable>
              ))}
            </ScrollView>

            <Button title="Cancel" variant="secondary" onPress={() => setReassigningOrderId(null)} />
          </ThemedView>
        </View>
      </Modal>

      {/* Report Delivery Issue Modal */}
      <Modal visible={Boolean(issueOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={[styles.modalContent, { maxHeight: '85%' }]}>
            <AppText variant="h3" style={{ fontWeight: '800', color: '#DC2626' }}>
              Report Delivery Issue
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Select the issue type encountered during dispatch or delivery:
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.two, paddingVertical: Spacing.one }} showsVerticalScrollIndicator={false}>
              {[
                { type: 'customer_unavailable', label: 'Customer Unavailable' },
                { type: 'wrong_address', label: 'Wrong Address' },
                { type: 'reschedule_requested', label: 'Reschedule Requested' },
                { type: 'delivery_delayed', label: 'Delivery Delayed' },
                { type: 'payment_issue', label: 'Payment Issue' },
                { type: 'other', label: 'Other' },
              ].map((opt) => {
                const isSelected = selectedIssueType === opt.type;
                return (
                  <Pressable
                    key={opt.type}
                    style={[
                      styles.reasonOption,
                      {
                        backgroundColor: isSelected ? '#FEE2E2' : theme.backgroundElement,
                        borderColor: isSelected ? '#DC2626' : '#9CA3AF44',
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedIssueType(opt.type as DeliveryIssueType)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <AppText variant="subtitle" style={{ fontWeight: isSelected ? '800' : '600', color: isSelected ? '#991B1B' : theme.text }}>
                        {opt.label}
                      </AppText>
                      {isSelected && (
                        <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>✓ Selected</AppText>
                      )}
                    </View>
                  </Pressable>
                );
              })}

              <AppText variant="caption" style={{ fontWeight: '700', marginTop: Spacing.two }}>
                Additional Notes (Optional):
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="Details about delay, customer contact, etc..."
                placeholderTextColor={theme.textSecondary}
                value={issueNote}
                onChangeText={setIssueNote}
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setIssueOrderId(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Submit Issue" variant="primary" onPress={handleReportIssue} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Verify Customer Pickup OTP Modal */}
      <Modal visible={Boolean(pickupOrderId)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Verify Customer Pickup OTP
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Enter customer 6-digit pickup OTP (Default mock: 123456):
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

function SectionTitle({ title }: { title: string }) {
  return (
    <AppText variant="subtitle" style={{ fontWeight: '800', marginTop: Spacing.two }}>
      {title}
    </AppText>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  summaryCard: {
    width: '48%',
    flexGrow: 1,
    padding: Spacing.three,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: '#9CA3AF22',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.three,
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  codTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF22',
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
  staffCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reasonOption: {
    padding: Spacing.three,
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
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
