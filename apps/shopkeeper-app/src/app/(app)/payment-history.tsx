import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader, SearchBar } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders, useProducts } from '@/hooks';
import { financialService, CounterSaleRecord } from '@/services/financial-service';

type StatusFilter = 'all' | 'paid' | 'pending' | 'refunded';

function getDateGroup(isoString: string): 'Today' | 'Yesterday' | 'Earlier' {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return 'Earlier';
}

export default function PaymentHistoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { orders } = useOrders();
  const { getCounterSaleRecords, getReturns } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [counterSales, setCounterSales] = useState<CounterSaleRecord[]>([]);
  const [returnsList, setReturnsList] = useState<import('@/types/return').CustomerReturn[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getCounterSaleRecords(), getReturns()])
      .then(([csRecords, retRecords]) => {
        if (isMounted) {
          setCounterSales(csRecords);
          setReturnsList(retRecords);
        }
      })
      .catch((err) => console.error('Failed to load payment history extras:', err));

    return () => {
      isMounted = false;
    };
  }, [getCounterSaleRecords, getReturns]);

  interface PaymentRecordItem {
    id: string;
    type: 'ORDER' | 'COUNTER_SALE' | 'REFUND';
    title: string;
    subtitle: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    createdAtISO: string;
    entityId?: string;
  }

  const allRecords: PaymentRecordItem[] = [
    ...orders.map((o) => {
      const fin = financialService.calculateOrderFinancials(o);
      return {
        id: `pay-ord-${o.id}`,
        type: 'ORDER' as const,
        title: `Order ${o.orderNumber}`,
        subtitle: `${o.items.length} items • ${o.customer.name}`,
        amount: fin.grossTotal,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAtISO: o.createdAt,
        entityId: o.id,
      };
    }),
    ...counterSales.map((cs) => ({
      id: `pay-cs-${cs.id}`,
      type: 'COUNTER_SALE' as const,
      title: 'Counter Sale',
      subtitle: `${cs.items.length} product(s) sold at shop`,
      amount: cs.totalAmount,
      paymentMethod: cs.paymentMethod,
      paymentStatus: 'Paid',
      createdAtISO: cs.createdAt,
    })),
    ...returnsList.map((ret) => ({
      id: `pay-ret-${ret.id}`,
      type: 'REFUND' as const,
      title: `Refund (${ret.id})`,
      subtitle: `${ret.orderNumber} • ${ret.customerName} (${ret.reason})`,
      amount: ret.refundAmount,
      paymentMethod: ret.paymentMethod,
      paymentStatus: ret.refundStatus,
      createdAtISO: ret.createdAt,
      entityId: ret.id,
    })),
  ].sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());

  const filteredRecords = allRecords.filter((rec) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      rec.title.toLowerCase().includes(q) ||
      rec.subtitle.toLowerCase().includes(q) ||
      rec.paymentMethod.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filter === 'paid') return rec.paymentStatus.toLowerCase() === 'paid';
    if (filter === 'pending') return rec.paymentStatus.toLowerCase().includes('pending');
    if (filter === 'refunded') return rec.paymentStatus.toLowerCase() === 'refunded';
    return true;
  });

  const grouped = {
    Today: filteredRecords.filter((r) => getDateGroup(r.createdAtISO) === 'Today'),
    Yesterday: filteredRecords.filter((r) => getDateGroup(r.createdAtISO) === 'Yesterday'),
    Earlier: filteredRecords.filter((r) => getDateGroup(r.createdAtISO) === 'Earlier'),
  };

  const filterChips: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All Payments' },
    { key: 'paid', label: 'Paid' },
    { key: 'pending', label: 'Pending' },
    { key: 'refunded', label: 'Refunded' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Payment History' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <PageHeader
          showBack
          title="Payment History"
          subtitle="Audit log of all order payments, COD collections, refunds, and counter sales."
        />

        {/* STICKY SEARCH & FILTER BAR */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by Order #, customer, or payment method..."
          />

          {/* Status Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one, marginTop: 6 }}>
            {filterChips.map((chip) => {
              const active = filter === chip.key;
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
                  onPress={() => setFilter(chip.key)}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: active ? '#FFFFFF' : theme.text,
                      fontWeight: active ? '800' : '500',
                      fontSize: 11,
                    }}
                  >
                    {chip.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {/* Grouped Payment Records */}
        {filteredRecords.length > 0 ? (
          (['Today', 'Yesterday', 'Earlier'] as const).map((groupKey) => {
            const list = grouped[groupKey];
            if (list.length === 0) return null;

            return (
              <View key={groupKey} style={styles.groupSection}>
                <AppText variant="caption" style={styles.groupTitle}>
                  {groupKey}
                </AppText>

                <View style={{ gap: Spacing.two }}>
                  {list.map((rec) => {
                    const badge = financialService.getPaymentBadgeConfig(rec.paymentStatus);
                    const formattedTime = new Date(rec.createdAtISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                      <Pressable
                        key={rec.id}
                        onPress={() => {
                          if (rec.type === 'REFUND' && rec.entityId) {
                            router.push({ pathname: '/return-details' as any, params: { returnId: rec.entityId } });
                          } else if (rec.entityId) {
                            router.push({ pathname: '/order-details' as any, params: { orderId: rec.entityId } });
                          }
                        }}
                      >
                        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                          <View style={{ flex: 1, gap: 2, paddingRight: Spacing.two }}>
                            <View style={styles.cardHeader}>
                              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                                {rec.title}
                              </AppText>
                              <View style={[styles.badgePill, { backgroundColor: badge.bgColor }]}>
                                <AppText variant="caption" style={{ color: badge.textColor, fontWeight: '800', fontSize: 10 }}>
                                  {badge.label}
                                </AppText>
                              </View>
                            </View>

                            <AppText variant="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
                              {rec.subtitle}
                            </AppText>
                            <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600' }}>
                              Method: {rec.paymentMethod} • {formattedTime}
                            </AppText>
                          </View>

                          <AppText variant="h3" style={{ fontWeight: '800', color: rec.paymentStatus === 'Refunded' ? '#DC2626' : '#10B981' }}>
                            {rec.paymentStatus === 'Refunded' ? `-₹${rec.amount}` : `₹${rec.amount}`}
                          </AppText>
                        </ThemedView>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              No Payment Records Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No payment transactions matched "${searchQuery}".`
                : 'No payments match the selected filter.'}
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
  stickySearchBar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginHorizontal: -Spacing.four,
    borderBottomWidth: 1,
    gap: Spacing.two,
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
  groupSection: {
    gap: Spacing.two,
  },
  groupTitle: {
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardHeader: {
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
