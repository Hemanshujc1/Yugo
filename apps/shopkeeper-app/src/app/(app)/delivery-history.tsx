import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks';

type HistoryFilter = 'all' | 'yugo' | 'staff' | 'pickup' | 'delivered' | 'issues';

export default function DeliveryHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { orders } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('all');

  const completedOrders = orders.filter(
    (o) => o.orderStatus === 'delivered' || o.orderStatus === 'cancelled' || o.deliveryDetails?.issueReport
  );

  const filterChips: { key: HistoryFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: completedOrders.length },
    { key: 'yugo', label: 'Yugo Delivery', count: completedOrders.filter((o) => o.deliveryDetails?.fulfillmentMethod === 'yugo_partner').length },
    { key: 'staff', label: 'Shop Staff', count: completedOrders.filter((o) => o.deliveryDetails?.fulfillmentMethod === 'self_delivery').length },
    { key: 'pickup', label: 'Customer Pickup', count: completedOrders.filter((o) => o.deliveryType === 'Pickup').length },
    { key: 'delivered', label: 'Delivered', count: completedOrders.filter((o) => o.orderStatus === 'delivered').length },
    { key: 'issues', label: 'Issues', count: completedOrders.filter((o) => Boolean(o.deliveryDetails?.issueReport)).length },
  ];

  const filteredHistory = completedOrders.filter((o) => {
    const q = searchQuery.trim().toLowerCase();
    const staffName = o.deliveryDetails?.assignedStaff?.name || o.deliveryPartner?.name || '';
    const matchesQuery =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      staffName.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (activeFilter === 'yugo') return o.deliveryDetails?.fulfillmentMethod === 'yugo_partner';
    if (activeFilter === 'staff') return o.deliveryDetails?.fulfillmentMethod === 'self_delivery';
    if (activeFilter === 'pickup') return o.deliveryType === 'Pickup';
    if (activeFilter === 'delivered') return o.orderStatus === 'delivered';
    if (activeFilter === 'issues') return Boolean(o.deliveryDetails?.issueReport);
    return true;
  });

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Delivery History' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <PageHeader
          title="Delivery History"
          subtitle="Archive of completed deliveries, pickups, and reported issues."
        />

        {/* STICKY SEARCH & FILTER BAR */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: '#9CA3AF44' }]}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>🔍</AppText>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by order #, customer, or delivery staff..."
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

        {/* HISTORY LIST */}
        <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((order) => {
              const assignedName = order.deliveryDetails?.assignedStaff?.name || order.deliveryPartner?.name || 'Assigned Staff';
              const hasIssue = Boolean(order.deliveryDetails?.issueReport);

              return (
                <Pressable
                  key={order.id}
                  onPress={() => router.push({ pathname: '/order-details' as any, params: { orderId: order.id } })}
                >
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.card, { borderColor: hasIssue ? '#DC262644' : '#9CA3AF22' }]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          {order.orderNumber} • ₹{order.total}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          Customer: {order.customer.name} ({order.customer.phone})
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Mode: {order.deliveryType} • Staff: {assignedName}
                        </AppText>
                        {hasIssue && (
                          <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700', fontSize: 11, marginTop: 2 }}>
                            ⚠️ Issue: {order.deliveryDetails?.issueReport?.issueType.replace('_', ' ')}
                          </AppText>
                        )}
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <StatusBadge status={order.orderStatus} size="sm" />
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </AppText>
                      </View>
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })
          ) : (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                No delivery history records found
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                Try adjusting your search query or selecting a different filter.
              </AppText>
            </ThemedView>
          )}
        </View>
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
  },
});
