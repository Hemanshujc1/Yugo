import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { customerService } from '@/services/customer-service';
import { Customer } from '@/types/customer';

type SortOption = 'recent' | 'orders' | 'spending';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function CustomersScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

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
    { key: 'recent', label: 'Recent Order' },
    { key: 'orders', label: 'Most Orders' },
    { key: 'spending', label: 'Highest Spent' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Customers' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <PageHeader
          title="Shop Customers"
          subtitle="Directory of customers ordering from your shop and their order history."
        />

        {/* STICKY SEARCH & SORT BAR */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: '#9CA3AF44' }]}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>🔍</AppText>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search customers by name or phone..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              keyboardType="default"
            />
            {Boolean(searchQuery) && (
              <Pressable onPress={() => setSearchQuery('')}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>✕</AppText>
              </Pressable>
            )}
          </View>

          {/* Sorting Pills */}
          <View style={styles.sortRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
              Sort:
            </AppText>
            <View style={{ flexDirection: 'row', gap: Spacing.one, flex: 1 }}>
              {sortChips.map((chip) => {
                const active = sortBy === chip.key;
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
                    onPress={() => setSortBy(chip.key)}
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
            </View>
          </View>
        </ThemedView>

        {/* Customers Directory List */}
        {!loading && customers.length > 0 ? (
          <View style={{ gap: Spacing.three }}>
            {customers.map((cust) => {
              const initials = getInitials(cust.name);
              const avatarColor = getAvatarColor(cust.name);
              const lastDateStr = new Date(cust.lastOrderAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <Pressable
                  key={cust.id}
                  onPress={() =>
                    router.push({
                      pathname: '/customer-details' as any,
                      params: { phone: cust.phone, customerId: cust.id },
                    })
                  }
                >
                  <ThemedView type="backgroundElement" style={[styles.customerCard, { borderColor: '#9CA3AF22' }]}>
                    {/* Customer Initials Avatar */}
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                      <AppText variant="subtitle" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                        {initials}
                      </AppText>
                    </View>

                    {/* Main Details */}
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.cardHeaderRow}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          {cust.name}
                        </AppText>
                        {cust.activeOrderId && (
                          <View style={styles.activeBadge}>
                            <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800', fontSize: 10 }}>
                              ⚡ Active Order
                            </AppText>
                          </View>
                        )}
                      </View>

                      <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }}>
                        📞 {cust.phone}
                      </AppText>

                      <View style={styles.metricsRow}>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'} •{' '}
                          <AppText variant="caption" style={{ fontWeight: '800', color: '#10B981' }}>
                            ₹{cust.totalSpent.toLocaleString('en-IN')} spent
                          </AppText>
                        </AppText>
                      </View>
                    </View>

                    {/* Last Order Time Indicator */}
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Last order
                      </AppText>
                      <AppText variant="caption" style={{ fontWeight: '700', marginTop: 2 }}>
                        {lastDateStr}
                      </AppText>
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        ) : !loading ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              No Customers Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No customers match "${searchQuery}". Try another name or phone number.`
                : 'Customers who place orders from your shop will appear here.'}
            </AppText>
          </ThemedView>
        ) : null}
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  customerCard: {
    padding: Spacing.four,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metricsRow: {
    marginTop: 2,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
