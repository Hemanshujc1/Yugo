import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader, SearchBar } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { StockReceipt } from '@/types/inventory';

type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function StockReceiptsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { getStockReceipts } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRange, setFilterRange] = useState<DateFilter>('all');
  const [receipts, setReceipts] = useState<StockReceipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getStockReceipts(filterRange, searchQuery)
      .then((res) => {
        if (isMounted) {
          setReceipts(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load stock receipts:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filterRange, searchQuery, getStockReceipts]);

  const filterChips: { key: DateFilter; label: string }[] = [
    { key: 'all', label: 'All Receipts' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Stock Receipts' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title="Stock Receipts History"
          subtitle="Audit log of incoming supplier shipments, quantities received, and purchase values."
          action={
            <Button
              title="📦 Receive Stock"
              variant="primary"
              size="sm"
              onPress={() => router.push('/receive-stock' as any)}
            />
          }
        />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by Receipt ID (e.g. REC-1028) or Supplier..."
        />

        {/* Date Filter Pills (Horizontal Scroll) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two, paddingVertical: 2 }}>
          {filterChips.map((chip) => {
            const active = filterRange === chip.key;
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
                onPress={() => setFilterRange(chip.key)}
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

        {/* Receipts List */}
        {!loading && receipts.length > 0 ? (
          <View style={{ gap: Spacing.two }}>
            {receipts.map((rec) => {
              const formattedDate = new Date(rec.createdAt).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <Pressable
                  key={rec.id}
                  onPress={() =>
                    router.push({
                      pathname: '/stock-receipt-details' as any,
                      params: { receiptId: rec.id },
                    })
                  }
                >
                  <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                    <View style={{ flex: 1, gap: 4, paddingRight: Spacing.two }}>
                      <View style={styles.cardHeaderRow}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          Receipt {rec.id}
                        </AppText>
                        <AppText variant="caption" style={{ fontWeight: '800', color: '#2563EB', flexShrink: 1 }} numberOfLines={1}>
                          🏢 {rec.supplierName}
                        </AppText>
                      </View>

                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {rec.totalProductsCount} products • {rec.totalUnitsReceived} sellable units
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Received {formattedDate}
                      </AppText>
                    </View>

                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <AppText variant="h3" style={{ fontWeight: '800', color: rec.totalPurchaseValue !== undefined ? '#10B981' : theme.textSecondary }}>
                        {rec.totalPurchaseValue !== undefined ? `₹${rec.totalPurchaseValue.toLocaleString('en-IN')}` : 'Cost N/A'}
                      </AppText>
                      {rec.hasUnknownCosts && (
                        <AppText variant="caption" style={{ color: '#D97706', fontSize: 10, marginTop: 2 }}>
                          (Some costs omitted)
                        </AppText>
                      )}
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        ) : !loading ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              No Stock Receipts Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No stock receipts match "${searchQuery}".`
                : 'Recorded stock receipts from suppliers will appear here.'}
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
  searchInput: {
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
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
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
});
