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
import { useProducts } from '@/hooks';
import { CustomerReturn } from '@/types/return';

type StatusFilter = 'all' | 'pending' | 'refunded' | 'partial' | 'full';

export default function ReturnsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { getReturns } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [returnsList, setReturnsList] = useState<CustomerReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getReturns(filterStatus, searchQuery)
      .then((res) => {
        if (isMounted) {
          setReturnsList(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load returns list:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filterStatus, searchQuery, getReturns]);

  const filterChips: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All Returns' },
    { key: 'refunded', label: 'Refunded' },
    { key: 'pending', label: 'Pending' },
    { key: 'partial', label: 'Partially Returned' },
    { key: 'full', label: 'Fully Returned' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Returns & Refunds' }} />

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
          title="Customer Returns & Refunds"
          subtitle="Audit log of customer returns, inventory dispositions, and processed refunds."
        />

        {/* STICKY SEARCH & FILTER BAR */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search returns by Return #, Order #, or Customer..."
          />

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one, marginTop: 6 }}>
            {filterChips.map((chip) => {
              const active = filterStatus === chip.key;
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
                  onPress={() => setFilterStatus(chip.key)}
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

        {/* Returns List */}
        {!loading && returnsList.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {returnsList.map((ret) => {
              const formattedDate = new Date(ret.createdAt).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              const isRefunded = ret.refundStatus === 'Refunded';

              return (
                <Pressable
                  key={ret.id}
                  onPress={() =>
                    router.push({
                      pathname: '/return-details' as any,
                      params: { returnId: ret.id },
                    })
                  }
                >
                  <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.cardHeaderRow}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          {ret.id}
                        </AppText>
                        <View style={[styles.badge, { backgroundColor: isRefunded ? '#E6F4EA' : '#FEF3C7' }]}>
                          <AppText
                            variant="caption"
                            style={{
                              color: isRefunded ? '#10B981' : '#D97706',
                              fontWeight: '800',
                              fontSize: 10,
                            }}
                          >
                            {ret.refundStatus}
                          </AppText>
                        </View>
                      </View>

                      <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                        Order: {ret.orderNumber} • Customer: {ret.customerName}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {ret.items.length} product(s) • Reason: {ret.reason}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Processed on {formattedDate}
                      </AppText>
                    </View>

                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <AppText variant="h3" style={{ fontWeight: '800', color: '#10B981' }}>
                        ₹{ret.refundAmount}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>
                        {ret.paymentMethod}
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
              No Returns Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No return records match "${searchQuery}".`
                : 'Customer returns and processed refunds will appear here.'}
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
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
