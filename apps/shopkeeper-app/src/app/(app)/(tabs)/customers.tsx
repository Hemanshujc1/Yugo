import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, PageHeader, ThemedView, AppText, SearchBar, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { customerService } from '@/services/customer-service';
import type { Customer } from '@/types/customer';
import { formatCurrencyINR } from '@/utils';

type SortOption = 'recent' | 'orders' | 'spending';

export default function CustomersScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    let isMounted = true;
    customerService
      .getCustomers(sortBy, searchQuery)
      .then((res) => {
        if (isMounted) {
          setCustomers(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load customers:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sortBy, searchQuery]);

  const sortChips: { key: SortOption; label: string }[] = [
    { key: 'recent', label: 'Recent Activity' },
    { key: 'orders', label: 'Most Orders' },
    { key: 'spending', label: 'Highest Spending' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Customers"
          subtitle="View customer directory, spending history, and active orders."
        />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by customer name, phone, or address..."
        />

        {/* Sort Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
          {sortChips.map((chip) => {
            const active = sortBy === chip.key;
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
                onPress={() => setSortBy(chip.key)}
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

        {/* Customers Directory List */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: Spacing.four }} />
        ) : customers.length > 0 ? (
          <View style={{ gap: Spacing.three }}>
            {customers.map((cust) => {
              const formattedDate = new Date(cust.lastOrderAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <Pressable
                  key={cust.id}
                  onPress={() =>
                    router.push({
                      pathname: '/customer-details' as any,
                      params: { phone: cust.phone },
                    })
                  }
                >
                  <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          {cust.name}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                          📞 {cust.phone}
                        </AppText>
                      </View>

                      {cust.activeOrderId && <StatusBadge status="ACTIVE ORDER" size="sm" />}
                    </View>

                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }} numberOfLines={1}>
                      📍 {cust.address}, {cust.city}
                    </AppText>

                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>Total Orders</AppText>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>{cust.totalOrders}</AppText>
                      </View>
                      <View style={styles.metricItem}>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>Total Spent</AppText>
                        <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>{formatCurrencyINR(cust.totalSpent)}</AppText>
                      </View>
                      <View style={styles.metricItem}>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>Last Activity</AppText>
                        <AppText variant="caption" style={{ fontWeight: '700' }}>{formattedDate}</AppText>
                      </View>
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              No Customers Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No customers matched "${searchQuery}".`
                : 'Customer profiles will appear as orders are processed.'}
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
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.two,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
    marginTop: 2,
  },
  metricItem: {
    gap: 2,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
