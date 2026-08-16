import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader } from '@/components';
import { OrderCard } from '@/components/dashboard/order-card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks';
import type { OrderStatus } from '@/types/order';

type FilterTab = 'all' | OrderStatus;

export default function OrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { orders, acceptOrder, rejectOrder, markOrderReady } = useOrders();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  // Badge counts
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

  // Filter orders by tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    return o.orderStatus === activeTab;
  });

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
          title="Orders"
          subtitle="Manage incoming and active orders."
        />

        {/* Filter Tabs Horizontal Scroll Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? '#2563EB' : theme.backgroundElement,
                    borderColor: theme.textSecondary,
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
        {filteredOrders.length > 0 ? (
          <View style={styles.orderList}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push({ pathname: '/order-details', params: { orderId: order.id } })}
                onAccept={() => acceptOrder(order.id)}
                onReject={() => rejectOrder(order.id)}
                onMarkReady={() => markOrderReady(order.id)}
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
                    ? 'No orders are currently waiting for pickup.'
                    : activeTab === 'out_for_delivery'
                      ? 'No orders are currently out for delivery.'
                      : activeTab === 'delivered'
                        ? 'No completed orders in history.'
                        : 'No orders match the selected queue filter.'}
            </AppText>
          </ThemedView>
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
});
