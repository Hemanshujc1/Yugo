import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader, Button } from '@/components';
import { OrderCard } from '@/components/dashboard/order-card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks';
import type { Order, OrderStatus } from '@/types/order';

type FilterTab = 'all' | OrderStatus;

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    orders,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    updateDeliveryStatus,
    markDeliveryPickedUp,
    simulateRiderAcceptance,
  } = useOrders();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);

  // Live count badges
  const newCount = orders.filter((o) => o.orderStatus === 'new').length;
  const preparingCount = orders.filter((o) => o.orderStatus === 'preparing').length;
  const readyCount = orders.filter((o) => o.orderStatus === 'ready_for_pickup').length;
  const outCount = orders.filter((o) => o.orderStatus === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'cancelled').length;

  const tabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'new', label: 'New', count: newCount },
    { key: 'preparing', label: 'Preparing', count: preparingCount },
    { key: 'ready_for_pickup', label: 'Ready for Pickup', count: readyCount },
    { key: 'out_for_delivery', label: 'Out for Delivery', count: outCount },
    { key: 'delivered', label: 'Completed', count: deliveredCount },
    { key: 'cancelled', label: 'Cancelled', count: cancelledCount },
  ];

  // Filter orders by active queue tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.orderStatus === activeTab;
  });

  // Sort orders per queue rules
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (activeTab === 'preparing' || activeTab === 'ready_for_pickup' || activeTab === 'out_for_delivery') {
      return timeA - timeB; // Oldest first for active operational queues
    }
    return timeB - timeA; // Newest first for New, Completed, Cancelled, and All
  });

  const handleConfirmReject = () => {
    if (rejectModalOrder) {
      rejectOrder(rejectModalOrder.id);
      setRejectModalOrder(null);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Header */}
        <PageHeader
          title="Orders Queue"
          subtitle="Manage operational order flow and fulfillment."
        />

        {/* Filter Tabs Horizontal Scroll Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? '#2563EB' : theme.backgroundElement,
                    borderColor: active ? '#2563EB' : '#9CA3AF44',
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: active ? '#FFFFFF' : theme.text,
                    fontWeight: active ? '700' : '500',
                  }}
                >
                  {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Orders Queue List */}
        {sortedOrders.length > 0 ? (
          <View style={styles.orderList}>
            {sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() =>
                  router.push({ pathname: '/order-details', params: { orderId: order.id } })
                }
                onAccept={() => acceptOrder(order.id)}
                onReject={() => setRejectModalOrder(order)}
                onMarkReady={() => markOrderReady(order.id)}
                onStartDelivery={() => updateDeliveryStatus(order.id, 'out_for_delivery')}
                onMarkPickedUp={() => markDeliveryPickedUp(order.id)}
                onSimulateRider={() => simulateRiderAcceptance(order.id)}
                onMarkDelivered={() => updateDeliveryStatus(order.id, 'delivered')}
              />
            ))}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="h3" style={{ fontWeight: '700' }}>
              No Orders Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {activeTab === 'new'
                ? 'There are no new incoming orders requiring acceptance.'
                : activeTab === 'preparing'
                  ? 'There are currently no orders being prepared.'
                  : activeTab === 'ready_for_pickup'
                    ? 'No orders are currently waiting for pickup or delivery dispatch.'
                    : activeTab === 'out_for_delivery'
                      ? 'No orders are currently out for delivery.'
                      : activeTab === 'delivered'
                        ? 'No completed orders in history.'
                        : activeTab === 'cancelled'
                          ? 'No cancelled orders.'
                          : 'No orders match the selected queue filter.'}
            </AppText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Confirmation Modal for Order Rejection */}
      <Modal
        visible={Boolean(rejectModalOrder)}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalCard}>
            <AppText variant="h3" style={{ fontWeight: '800', color: '#DC2626' }}>
              Reject Order?
            </AppText>
            <AppText variant="body" style={{ color: theme.textSecondary }}>
              {`Are you sure you want to reject Order ${rejectModalOrder?.orderNumber}? This action cannot be undone and will notify the customer.`}
            </AppText>
            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setRejectModalOrder(null)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Reject" variant="danger" onPress={handleConfirmReject} />
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
  filterScroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
  },
  orderList: {
    gap: Spacing.three,
  },
  emptyCard: {
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    borderRadius: 20,
    padding: Spacing.five,
    width: '100%',
    maxWidth: 400,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
