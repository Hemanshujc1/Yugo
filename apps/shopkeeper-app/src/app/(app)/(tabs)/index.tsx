import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen, AppText, Button, ThemedView } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  useProducts,
  useOrders,
  useShopSettings,
  useNotifications,
} from '@/hooks';
import {
  DashboardHeader,
  OrderCard,
  SectionHeader,
} from '@/components/dashboard';
import { financialService, CounterSaleRecord } from '@/services/financial-service';
import { returnService } from '@/services/return-service';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { products, getCounterSaleRecords } = useProducts();
  const { orders, acceptOrder, rejectOrder, markOrderReady } = useOrders();
  const { profile, availability, toggleAvailability } = useShopSettings();
  const { unreadCount } = useNotifications();

  const [counterSales, setCounterSales] = useState<CounterSaleRecord[]>([]);
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getCounterSaleRecords(), returnService.getReturns('pending')])
      .then(([csRecords, retRecords]) => {
        if (isMounted) {
          setCounterSales(csRecords);
          setPendingReturnsCount(retRecords.length);
        }
      })
      .catch((err) => console.error('Failed to load dashboard extras:', err));

    return () => {
      isMounted = false;
    };
  }, [getCounterSaleRecords]);

  // Operational State Aggregations
  const newOrders = orders.filter((o) => o.orderStatus === 'new');
  const readyForPickupOrders = orders.filter((o) => o.orderStatus === 'ready_for_pickup');
  const outForDeliveryOrders = orders.filter((o) => o.orderStatus === 'out_for_delivery');
  const activeDeliveryOrdersCount = readyForPickupOrders.length + outForDeliveryOrders.length;

  const lowStockProducts = products.filter(
    (p) => p.isAvailable && p.stockQuantity <= (p.lowStockThreshold ?? 10) && p.stockQuantity > 0
  );
  const outOfStockProducts = products.filter(
    (p) => p.isAvailable && p.stockQuantity === 0
  );

  // COD Pending Aggregations
  const codPendingOrders = orders.filter(
    (o) => o.paymentMethod === 'COD' && o.paymentStatus !== 'Paid' && o.orderStatus !== 'cancelled'
  );
  const pendingCODTotalAmount = codPendingOrders.reduce((sum, o) => sum + o.total, 0);

  // Today Financial Summary
  const todaySummary = financialService.calculateEarnings(orders, counterSales, 'today');

  const hasUrgentAttention =
    newOrders.length > 0 ||
    pendingCODTotalAmount > 0 ||
    outOfStockProducts.length > 0 ||
    lowStockProducts.length > 0 ||
    pendingReturnsCount > 0;

  const recentOrders = orders.slice(0, 3);

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER SECTION */}
        <View style={styles.headerRowWrapper}>
          <View style={{ flex: 1 }}>
            <DashboardHeader
              shopName={profile?.shopName || 'Yugo Fresh Mart'}
              greeting={`${getGreeting()}, ${(profile?.shopkeeperName || 'Shopkeeper').split(' ')[0]}`}
              date={new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            />
          </View>

          <View style={styles.headerRightActions}>
            {/* Notification Bell Icon */}
            <Pressable style={styles.bellBtn} onPress={() => router.push('/notifications' as any)}>
              <AppText variant="h3">🔔</AppText>
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <AppText variant="caption" style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </AppText>
                </View>
              )}
            </Pressable>

            {/* Shop Availability Status Pill */}
            <Pressable
              style={[
                styles.statusPill,
                {
                  backgroundColor: availability.isOpen ? '#E6F4EA' : '#FEE2E2',
                  borderColor: availability.isOpen ? '#10B981' : '#EF4444',
                },
              ]}
              onPress={() => router.push('/shop-settings' as any)}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: availability.isOpen ? '#10B981' : '#EF4444' },
                ]}
              />
              <AppText
                variant="caption"
                style={{
                  color: availability.isOpen ? '#10B981' : '#DC2626',
                  fontWeight: '800',
                  fontSize: 11,
                }}
              >
                {availability.isOpen ? 'Open' : 'Closed'}
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* 2. SHOP CLOSED BANNER */}
        {!availability.isOpen && (
          <ThemedView type="backgroundElement" style={styles.shopClosedBanner}>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="subtitle" style={{ fontWeight: '800', color: '#991B1B' }}>
                🔴 SHOP CLOSED
              </AppText>
              <AppText variant="caption" style={{ color: '#991B1B', fontSize: 11 }}>
                New customer orders are temporarily disabled. Active orders will continue normally.
              </AppText>
            </View>
            <Button
              title="Open Shop"
              variant="primary"
              size="sm"
              onPress={() => toggleAvailability(true)}
            />
          </ThemedView>
        )}

        {/* 3. URGENT ACTIONS / NEEDS ATTENTION SECTION */}
        <SectionHeader
          title="Needs Attention"
          subtitle="Operational tasks requiring shopkeeper action."
        />

        {hasUrgentAttention ? (
          <View style={{ gap: Spacing.two }}>
            {/* New Orders Action Card */}
            {newOrders.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/orders' as any)}>
                <ThemedView type="backgroundElement" style={[styles.attentionCardRow, { borderColor: '#DC2626' }]}>
                  <View style={styles.iconCircleRed}>
                    <AppText variant="subtitle">🔴</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#DC2626' }}>
                      {newOrders.length} New Order(s) Received
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Customer orders waiting for store confirmation
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    View Orders →
                  </AppText>
                </ThemedView>
              </Pressable>
            )}

            {/* Pending COD Collection Action Card */}
            {pendingCODTotalAmount > 0 && (
              <Pressable onPress={() => router.push('/payment-history' as any)}>
                <ThemedView type="backgroundElement" style={[styles.attentionCardRow, { borderColor: '#F59E0B' }]}>
                  <View style={styles.iconCircleYellow}>
                    <AppText variant="subtitle">💵</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      COD Cash Collection
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      ₹{pendingCODTotalAmount.toLocaleString('en-IN')} pending ({codPendingOrders.length} COD orders)
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    View Payments →
                  </AppText>
                </ThemedView>
              </Pressable>
            )}

            {/* Out of Stock Alert Card */}
            {outOfStockProducts.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
                <ThemedView type="backgroundElement" style={[styles.attentionCardRow, { borderColor: '#DC2626' }]}>
                  <View style={styles.iconCircleRed}>
                    <AppText variant="subtitle">⚠️</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#DC2626' }}>
                      {outOfStockProducts.length} Product(s) Out of Stock
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Stock depleted — customers cannot purchase these items
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    Restock →
                  </AppText>
                </ThemedView>
              </Pressable>
            )}

            {/* Low Stock Alert Card */}
            {lowStockProducts.length > 0 && (
              <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
                <ThemedView type="backgroundElement" style={[styles.attentionCardRow, { borderColor: '#F59E0B' }]}>
                  <View style={styles.iconCircleYellow}>
                    <AppText variant="subtitle">📦</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      {lowStockProducts.length} Low Stock Item(s)
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Stock quantity below threshold limit
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    View Stock →
                  </AppText>
                </ThemedView>
              </Pressable>
            )}

            {/* Pending Returns Action Card */}
            {pendingReturnsCount > 0 && (
              <Pressable onPress={() => router.push('/returns' as any)}>
                <ThemedView type="backgroundElement" style={[styles.attentionCardRow, { borderColor: '#2563EB' }]}>
                  <View style={styles.iconCircleBlue}>
                    <AppText variant="subtitle">↺</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      {pendingReturnsCount} Pending Customer Return(s)
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Customer return requests requiring audit verification
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    View Returns →
                  </AppText>
                </ThemedView>
              </Pressable>
            )}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.caughtUpCard}>
            <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
              ✓ You are all caught up!
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
              No urgent store actions or pending stock issues right now.
            </AppText>
          </ThemedView>
        )}

        {/* 4. TODAY'S OPERATIONS (ACTIVE DELIVERIES) */}
        {activeDeliveryOrdersCount > 0 && (
          <View style={{ gap: Spacing.two }}>
            <SectionHeader
              title="Active Delivery Operations"
              subtitle="Orders currently in preparation or out for dispatch."
            />

            <Pressable onPress={() => router.push('/delivery-operations' as any)}>
              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#2563EB44' }]}>
                <View style={styles.deliveryOpsRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      🚚 {activeDeliveryOrdersCount} Active Delivery Order(s)
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {readyForPickupOrders.length} Ready for Pickup • {outForDeliveryOrders.length} Out for Delivery
                    </AppText>
                  </View>

                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    Track Deliveries →
                  </AppText>
                </View>
              </ThemedView>
            </Pressable>
          </View>
        )}

        {/* 5. TODAY'S BUSINESS SNAPSHOT */}
        <SectionHeader
          title="Today's Business"
          subtitle="Operational sales snapshot for today."
        />

        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#10B98144' }]}>
          <View style={styles.businessHeaderRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption" style={{ color: theme.textSecondary, textTransform: 'uppercase', fontWeight: '800' }}>
                Today Gross Revenue
              </AppText>
              <AppText variant="h1" style={{ fontWeight: '800', color: '#10B981', marginTop: 2 }}>
                ₹{todaySummary.grossSales.toLocaleString('en-IN')}
              </AppText>
            </View>

            <Button
              title="View Reports →"
              variant="secondary"
              size="sm"
              onPress={() => router.push('/analytics' as any)}
            />
          </View>

          <View style={styles.businessStatsGrid}>
            <View style={styles.bizStatBox}>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                {todaySummary.totalOrdersCount}
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                Total Orders
              </AppText>
            </View>

            <View style={styles.bizStatBox}>
              <AppText variant="h3" style={{ fontWeight: '800', color: '#2563EB' }}>
                ₹{todaySummary.counterSales.toLocaleString('en-IN')}
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                Counter Sales
              </AppText>
            </View>

            <View style={styles.bizStatBox}>
              <AppText variant="h3" style={{ fontWeight: '800', color: '#10B981' }}>
                ₹{todaySummary.netEarnings.toLocaleString('en-IN')}
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                Net Earnings
              </AppText>
            </View>
          </View>
        </ThemedView>

        {/* 6. QUICK ACTIONS SECTION */}
        <SectionHeader
          title="Quick Actions"
          subtitle="Primary shop management workflows."
        />

        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard} onPress={() => router.push('/counter-sale' as any)}>
            <AppText variant="h2">⚡</AppText>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Counter Sale
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
              Record shop sale
            </AppText>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => router.push('/receive-stock' as any)}>
            <AppText variant="h2">📦</AppText>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Receive Stock
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
              Log inventory intake
            </AppText>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => router.push('/add-product' as any)}>
            <AppText variant="h2">➕</AppText>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Add Product
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
              Add to catalog
            </AppText>
          </Pressable>

          <Pressable style={styles.quickCard} onPress={() => router.push('/analytics' as any)}>
            <AppText variant="h2">📊</AppText>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Reports
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
              Business insights
            </AppText>
          </Pressable>
        </View>

        {/* 7. RECENT ORDERS LIST */}
        <SectionHeader
          title="Recent Orders"
          subtitle="Monitor latest customer order status."
        />

        <View style={styles.cardColumn}>
          {recentOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                router.push({ pathname: '/order-details', params: { orderId: order.id } })
              }
              onAccept={() => acceptOrder(order.id)}
              onReject={() => rejectOrder(order.id)}
              onMarkReady={() => markOrderReady(order.id)}
            />
          ))}
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
    gap: Spacing.four,
  },
  headerRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  bellBtn: {
    position: 'relative',
    padding: 6,
  },
  notifBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shopClosedBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 16,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  attentionCardRow: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircleRed: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleYellow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBlue: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caughtUpCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B98144',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.three,
  },
  deliveryOpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
  },
  bizStatBox: {
    alignItems: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  quickCard: {
    width: '48%',
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: '#9CA3AF15',
    alignItems: 'center',
    gap: 4,
  },
  cardColumn: {
    gap: Spacing.two,
  },
});
