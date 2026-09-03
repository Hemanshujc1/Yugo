import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, StockStatusBadge, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { customerService } from '@/services/customer-service';
import { financialService } from '@/services/financial-service';
import { Customer } from '@/types/customer';
import { Order } from '@/types/order';
import { formatCurrencyINR } from '@/utils';

type HistoryFilter = 'all' | 'delivered' | 'active' | 'cancelled';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function CustomerDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const phoneOrId =
    typeof params.phone === 'string'
      ? params.phone
      : typeof params.customerId === 'string'
        ? params.customerId
        : Array.isArray(params.phone)
          ? params.phone[0]
          : '';

  const [customer, setCustomer] = useState<Customer | undefined>(undefined);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!phoneOrId) return;

    Promise.all([
      customerService.getCustomerById(phoneOrId),
      customerService.getCustomerOrders(phoneOrId, filter),
    ])
      .then(([custRes, ordersRes]) => {
        if (isMounted) {
          setCustomer(custRes);
          setHistoryOrders(ordersRes);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load customer details:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [phoneOrId, filter]);

  if (!loading && !customer) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Customer Details' }} />
        <ThemedView type="backgroundElement" style={styles.emptyCard}>
          <AppText variant="h2">Customer Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            No customer matching the selected query was found in the directory.
          </AppText>
          <Button title="Back to Directory" variant="primary" onPress={() => router.back()} />
        </ThemedView>
      </Screen>
    );
  }

  const activeOrder = historyOrders.find(
    (o) =>
      o.orderStatus === 'new' ||
      o.orderStatus === 'preparing' ||
      o.orderStatus === 'ready_for_pickup' ||
      o.orderStatus === 'out_for_delivery'
  );

  const filterChips: { key: HistoryFilter; label: string }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'active', label: 'Active' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleCall = () => {
    if (!customer) return;
    const cleanNum = customer.phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanNum}`).catch(() => {
      Alert.alert('Call Action', `Calling ${customer.name} at ${customer.phone}`);
    });
  };

  const handleMessage = () => {
    if (!customer) return;
    const cleanNum = customer.phone.replace(/[^\d+]/g, '');
    Linking.openURL(`sms:${cleanNum}`).catch(() => {
      Alert.alert('Message Action', `Opening SMS chat with ${customer.name} at ${customer.phone}`);
    });
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: customer ? customer.name : 'Customer Details' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title={customer ? customer.name : 'Customer Profile'}
          subtitle={customer ? `Phone: ${customer.phone}` : ''}
        />

        {customer && (
          <>
            {/* Profile Header Card */}
            <ThemedView type="backgroundElement" style={[styles.profileCard, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.profileHeaderRow}>
                <View style={styles.avatar}>
                  <AppText variant="h2" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                    {getInitials(customer.name)}
                  </AppText>
                </View>

                <View style={{ flex: 1 }}>
                  <AppText variant="h2" style={{ fontWeight: '800' }}>
                    {customer.name}
                  </AppText>
                  <AppText variant="subtitle" style={{ color: '#2563EB', fontWeight: '600', marginTop: 2 }}>
                    📞 {customer.phone}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    ✉️ {customer.email}
                  </AppText>
                </View>
              </View>

              {/* Delivery Address Block */}
              <View style={styles.addressBlock}>
                <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                  Saved Delivery Address
                </AppText>
                <AppText variant="body" style={{ fontWeight: '600', marginTop: 2 }}>
                  {customer.address}, {customer.city}
                </AppText>
              </View>

              {/* Contact Actions */}
              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}>
                  <Button title="📞 Call Customer" variant="secondary" size="sm" onPress={handleCall} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button title="💬 Send Message" variant="secondary" size="sm" onPress={handleMessage} />
                </View>
              </View>
            </ThemedView>

            {/* Aggregated Customer Financial Summary */}
            <ThemedView type="backgroundElement" style={[styles.summaryCard, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Customer Lifetime Summary
              </AppText>

              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Total Orders
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', marginTop: 2 }}>
                    {customer.totalOrders}
                  </AppText>
                </View>

                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Total Spent
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981', marginTop: 2 }}>
                    {formatCurrencyINR(customer.totalSpent)}
                  </AppText>
                </View>

                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Avg Order Value
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', marginTop: 2 }}>
                    {formatCurrencyINR(customer.averageOrderValue)}
                  </AppText>
                </View>

                <View style={styles.metricBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Last Order
                  </AppText>
                  <AppText variant="subtitle" style={{ fontWeight: '800', marginTop: 4 }}>
                    {new Date(customer.lastOrderAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </AppText>
                </View>
              </View>
            </ThemedView>

            {/* Active Order Highlight Card */}
            {activeOrder && (
              <ThemedView type="backgroundElement" style={[styles.activeCard, { borderColor: '#2563EB66', backgroundColor: '#EFF6FF' }]}>
                <View style={styles.activeHeader}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" style={{ color: '#1E40AF', fontWeight: '800', textTransform: 'uppercase' }}>
                      ⚡ Active Order in Progress
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800', marginTop: 2 }}>
                      {activeOrder.orderNumber} • ₹{activeOrder.total}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {activeOrder.items.length} items • Delivery Mode: {activeOrder.deliveryType}
                    </AppText>
                  </View>
                  <StockStatusBadge status={activeOrder.orderStatus} />
                </View>

                <Button
                  title="View Active Order Details →"
                  variant="primary"
                  size="sm"
                  onPress={() =>
                    router.push({
                      pathname: '/order-details',
                      params: { orderId: activeOrder.id },
                    })
                  }
                />
              </ThemedView>
            )}

            {/* Customer Order History List */}
            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              <PageHeader
                title="Order History"
                subtitle="Complete timeline of previous orders placed by this customer."
              />

              {/* Status Filter Pills */}
              <View style={styles.filterRow}>
                {filterChips.map((chip) => {
                  const active = filter === chip.key;
                  return (
                    <Pressable
                      key={chip.key}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? '#2563EB' : theme.backgroundElement,
                          borderColor: active ? '#2563EB' : '#9CA3AF44',
                        },
                      ]}
                      onPress={() => setFilter(chip.key)}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: active ? '#FFFFFF' : theme.text,
                          fontWeight: active ? '700' : '500',
                          fontSize: 12,
                        }}
                      >
                        {chip.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              {/* Order History Cards */}
              {historyOrders.length > 0 ? (
                <View style={{ gap: Spacing.two }}>
                  {historyOrders.map((ord) => {
                    const fin = financialService.calculateOrderFinancials(ord);
                    const formattedDate = new Date(ord.createdAt).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <Pressable
                        key={ord.id}
                        onPress={() =>
                          router.push({
                            pathname: '/order-details',
                            params: { orderId: ord.id },
                          })
                        }
                      >
                        <ThemedView type="backgroundElement" style={[styles.orderCard, { borderColor: '#9CA3AF22' }]}>
                          <View style={{ flex: 1, gap: 4 }}>
                            <View style={styles.orderHeaderRow}>
                              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                                {ord.orderNumber}
                              </AppText>
                              <StockStatusBadge status={ord.orderStatus} />
                            </View>

                            <AppText variant="caption" style={{ color: theme.textSecondary }}>
                              {ord.items.length} items • Method: {ord.paymentMethod}
                            </AppText>
                            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                              Placed on {formattedDate}
                            </AppText>
                          </View>

                          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                            <AppText variant="h3" style={{ fontWeight: '800', color: ord.orderStatus === 'cancelled' ? '#DC2626' : '#10B981' }}>
                              ₹{fin.grossTotal}
                            </AppText>
                            <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700', fontSize: 11, marginTop: 4 }}>
                              View Order →
                            </AppText>
                          </View>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <ThemedView type="backgroundElement" style={styles.emptyCard}>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    No Orders Found
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    No orders match the selected filter.
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
  profileCard: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    borderWidth: 1,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressBlock: {
    backgroundColor: '#9CA3AF11',
    padding: Spacing.three,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  summaryCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    borderWidth: 1,
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
  activeCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    borderWidth: 1,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  orderCard: {
    padding: Spacing.four,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
