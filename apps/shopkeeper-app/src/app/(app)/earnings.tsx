import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, StatCard, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders, useProducts } from '@/hooks';
import { financialService, CounterSaleRecord } from '@/services/financial-service';
import { formatCurrencyINR } from '@/utils';

type DateRange = 'today' | 'yesterday' | 'week' | 'month';
type StatusFilter = 'all' | 'paid' | 'pending' | 'refunded';

export default function EarningsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { orders } = useOrders();
  const { getCounterSaleRecords } = useProducts();

  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [counterSales, setCounterSales] = useState<CounterSaleRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    getCounterSaleRecords()
      .then((records) => {
        if (isMounted) setCounterSales(records);
      })
      .catch((err) => console.error('Failed to load counter sales:', err));

    return () => {
      isMounted = false;
    };
  }, [getCounterSaleRecords]);

  const summary = financialService.calculateEarnings(orders, counterSales, dateRange);

  const pendingOrders = orders.filter(
    (o) => (o.paymentStatus === 'Pending' || o.paymentMethod === 'COD') && o.orderStatus !== 'cancelled'
  );

  // Combine Order Payments and Counter Sales for recent activity list
  interface ActivityItem {
    id: string;
    type: 'ORDER' | 'COUNTER_SALE';
    title: string;
    subtitle: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    dateISO: string;
    entityId?: string;
  }

  const activities: ActivityItem[] = [
    ...orders.map((o) => {
      const fin = financialService.calculateOrderFinancials(o);
      return {
        id: `act-ord-${o.id}`,
        type: 'ORDER' as const,
        title: `Order ${o.orderNumber}`,
        subtitle: `${o.items.length} items • ${o.customer.name}`,
        amount: fin.grossTotal,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        dateISO: o.createdAt,
        entityId: o.id,
      };
    }),
    ...counterSales.map((cs) => ({
      id: `act-cs-${cs.id}`,
      type: 'COUNTER_SALE' as const,
      title: 'Counter Sale',
      subtitle: `${cs.items.length} product(s) sold at shop`,
      amount: cs.totalAmount,
      paymentMethod: cs.paymentMethod,
      paymentStatus: 'Paid',
      dateISO: cs.createdAt,
    })),
  ].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

  const filteredActivities = activities.filter((act) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return act.paymentStatus.toLowerCase() === 'paid';
    if (statusFilter === 'pending') return act.paymentStatus.toLowerCase().includes('pending');
    if (statusFilter === 'refunded') return act.paymentStatus.toLowerCase() === 'refunded';
    return true;
  });

  const rangeChips: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const filterChips: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All Activity' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'refunded', label: 'Refunded' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Shop Earnings' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title="Earnings & Revenue"
          subtitle="Track your gross sales, counter revenue, platform fees, and net shopkeeper earnings."
        />

        {/* Date Range Selector Pills */}
        <View style={styles.rangeRow}>
          {rangeChips.map((chip) => {
            const active = dateRange === chip.key;
            return (
              <Pressable
                key={chip.key}
                style={[
                  styles.rangeBtn,
                  {
                    backgroundColor: active ? '#2563EB' : theme.backgroundElement,
                    borderColor: active ? '#2563EB' : '#9CA3AF44',
                  },
                ]}
                onPress={() => setDateRange(chip.key)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: active ? '#FFFFFF' : theme.text,
                    fontWeight: active ? '800' : '600',
                  }}
                >
                  {chip.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Primary Hero Card: Net Shopkeeper Earnings */}
        <ThemedView type="backgroundElement" style={styles.heroCard}>
          <AppText variant="caption" style={{ color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700' }}>
            {summary.dateRangeLabel} Net Shopkeeper Earnings
          </AppText>
          <AppText variant="h1" style={{ fontSize: 34, fontWeight: '900', color: '#10B981', marginVertical: 4 }}>
            {formatCurrencyINR(summary.netEarnings)}
          </AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            Net earnings after deducting refunds ({formatCurrencyINR(summary.refundsTotal)}) & platform fee ({formatCurrencyINR(summary.platformDeductions)})
          </AppText>
        </ThemedView>

        {/* Key Metrics Overview Grid */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Gross Revenue"
            value={formatCurrencyINR(summary.grossSales)}
            subtitle={`${summary.totalOrdersCount} total sales`}
            style={styles.metricItem}
            accentColor="#2563EB"
          />
          <StatCard
            title="Counter Sales"
            value={formatCurrencyINR(summary.counterSales)}
            subtitle={`${summary.counterSalesCount} offline sales`}
            style={styles.metricItem}
            accentColor="#10B981"
          />
          <StatCard
            title="Yugo Orders"
            value={formatCurrencyINR(summary.yugoOrdersSales)}
            subtitle={`${summary.yugoOrdersCount} online orders`}
            style={styles.metricItem}
            accentColor="#8B5CF6"
          />
          <StatCard
            title="Pending Collection"
            value={formatCurrencyINR(summary.pendingPaymentsTotal)}
            subtitle={`${summary.pendingOrdersCount} COD orders`}
            style={styles.metricItem}
            accentColor="#F59E0B"
          />
        </View>

        {/* Financial Calculation Breakdown Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            Financial Breakdown ({summary.dateRangeLabel})
          </AppText>

          <View style={styles.breakdownRow}>
            <AppText variant="subtitle" style={{ fontWeight: '600' }}>
              Yugo Online Orders
            </AppText>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              {formatCurrencyINR(summary.yugoOrdersSales)}
            </AppText>
          </View>

          <View style={styles.breakdownRow}>
            <AppText variant="subtitle" style={{ fontWeight: '600' }}>
              Counter Shop Sales
            </AppText>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              {formatCurrencyINR(summary.counterSales)}
            </AppText>
          </View>

          {summary.refundsTotal > 0 && (
            <View style={styles.breakdownRow}>
              <AppText variant="subtitle" style={{ fontWeight: '600', color: '#DC2626' }}>
                Refunds
              </AppText>
              <AppText variant="subtitle" style={{ fontWeight: '700', color: '#DC2626' }}>
                {formatCurrencyINR(-summary.refundsTotal)}
              </AppText>
            </View>
          )}

          <View style={styles.breakdownRow}>
            <AppText variant="subtitle" style={{ fontWeight: '600', color: theme.textSecondary }}>
              Yugo Platform Fee (5%)
            </AppText>
            <AppText variant="subtitle" style={{ fontWeight: '700', color: theme.textSecondary }}>
              {formatCurrencyINR(-summary.platformDeductions)}
            </AppText>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: '#9CA3AF33', paddingTop: Spacing.three, marginTop: Spacing.two }}>
            <View style={{ gap: 2 }}>
              <AppText variant="caption" style={{ fontWeight: '800', textTransform: 'uppercase', color: theme.textSecondary, letterSpacing: 0.5 }}>
                Net Shop Earnings
              </AppText>
              <AppText variant="h1" style={{ fontWeight: '900', color: '#10B981', fontSize: 28, lineHeight: 34 }}>
                {formatCurrencyINR(summary.netEarnings)}
              </AppText>
            </View>
          </View>
        </ThemedView>

        {/* Pending Cash / COD Collection Section */}
        {pendingOrders.length > 0 && (
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#F59E0B66', backgroundColor: '#FFFBEB' }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" style={{ fontWeight: '800', color: '#92400E' }}>
                  💵 Cash Collection Pending ({pendingOrders.length})
                </AppText>
                <AppText variant="caption" style={{ color: '#B45309' }}>
                  COD orders waiting for customer payment collection upon delivery.
                </AppText>
              </View>
              <AppText variant="h3" style={{ fontWeight: '800', color: '#D97706' }}>
                ₹{summary.pendingPaymentsTotal}
              </AppText>
            </View>

            <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
              {pendingOrders.map((po) => (
                <Pressable
                  key={po.id}
                  style={styles.pendingOrderRow}
                  onPress={() => router.push({ pathname: '/order-details', params: { orderId: po.id } })}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                      {po.orderNumber} • {po.customer.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Payment: {po.paymentMethod} • Status: {po.paymentStatus}
                    </AppText>
                  </View>
                  <AppText variant="subtitle" style={{ fontWeight: '800', color: '#D97706' }}>
                    ₹{po.total} →
                  </AppText>
                </Pressable>
              ))}
            </View>
          </ThemedView>
        )}

        {/* Recent Financial Activity Section */}
        <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            Recent Financial Activity
          </AppText>

          {/* Status Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterChips.map((chip) => {
              const active = statusFilter === chip.key;
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
                  onPress={() => setStatusFilter(chip.key)}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: active ? '#FFFFFF' : theme.text,
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {chip.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Activity Items List */}
          {filteredActivities.length > 0 ? (
            <View style={{ gap: Spacing.two }}>
              {filteredActivities.map((item) => {
                const badge = financialService.getPaymentBadgeConfig(item.paymentStatus);

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      if (item.entityId) {
                        router.push({ pathname: '/order-details', params: { orderId: item.entityId } });
                      }
                    }}
                  >
                    <ThemedView type="backgroundElement" style={[styles.activityCard, { borderColor: '#9CA3AF22' }]}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.activityHeader}>
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                            {item.title}
                          </AppText>
                          <View style={[styles.badgePill, { backgroundColor: badge.bgColor }]}>
                            <AppText variant="caption" style={{ color: badge.textColor, fontWeight: '800', fontSize: 10 }}>
                              {badge.label}
                            </AppText>
                          </View>
                        </View>

                        <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                          {item.subtitle} • Method: {item.paymentMethod}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                          {new Date(item.dateISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </AppText>
                      </View>

                      <AppText variant="h3" style={{ fontWeight: '800', color: item.paymentStatus === 'Refunded' ? '#DC2626' : '#10B981' }}>
                        {item.paymentStatus === 'Refunded' ? `-₹${item.amount}` : `₹${item.amount}`}
                      </AppText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                No Financial Activity Found
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                No payment transactions match the selected status filter.
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
    gap: Spacing.four,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  heroCard: {
    padding: Spacing.five,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10B98144',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  metricItem: {
    width: '48%',
    minWidth: 150,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netRow: {
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  pendingOrderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.two,
    backgroundColor: '#FFFFFF88',
    borderRadius: 12,
  },
  filterScroll: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
  },
  activityCard: {
    padding: Spacing.four,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
