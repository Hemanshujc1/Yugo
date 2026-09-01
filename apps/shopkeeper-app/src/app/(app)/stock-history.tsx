import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Stack } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import type { StockMovement } from '@/types/inventory';

type FilterType = 'all' | 'sales' | 'received' | 'adjustments' | 'damaged' | 'returns';

export default function StockHistoryScreen() {
  const theme = useTheme();
  const { getStockMovements } = useProducts();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    let isMounted = true;
    getStockMovements(filter, searchQuery)
      .then((data) => {
        if (isMounted) setMovements(data);
      })
      .catch((err) => console.error('Failed to load stock movements:', err));

    return () => {
      isMounted = false;
    };
  }, [filter, searchQuery, getStockMovements]);

  const filterChips: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'sales', label: 'Sales' },
    { key: 'received', label: 'Stock Received' },
    { key: 'adjustments', label: 'Adjustments' },
    { key: 'damaged', label: 'Damaged' },
    { key: 'returns', label: 'Returns' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Stock Movement History' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <PageHeader
          title="Stock Movement History"
          subtitle="Audit log of inventory stock changes, sales, and supplier receipts."
        />

        {/* STICKY SEARCH & FILTER BAR */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: '#9CA3AF44' }]}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>🔍</AppText>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search stock history by product name or reason..."
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

          {/* Filter Chips Horizontal Scroll */}
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

        {/* Stock Movements List */}
        {movements.length > 0 ? (
          <View style={styles.movementList}>
            {movements.map((item) => {
              const isPositive = item.quantityChange > 0;

              return (
                <ThemedView key={item.id} type="backgroundElement" style={[styles.movementCard, { borderColor: '#9CA3AF22' }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, paddingRight: Spacing.two }}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {item.productName}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {item.brand} • {item.variant}
                      </AppText>
                    </View>

                    <View style={[styles.changeBadge, { backgroundColor: isPositive ? '#E6F4EA' : '#FEE2E2' }]}>
                      <AppText
                        variant="subtitle"
                        style={{
                          fontWeight: '800',
                          color: isPositive ? '#10B981' : '#DC2626',
                        }}
                      >
                        {isPositive ? `+${item.quantityChange}` : item.quantityChange}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.cardDetailRow}>
                    <View>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        Transition: {item.previousQuantity} → <AppText variant="caption" style={{ fontWeight: '800' }}>{item.newQuantity}</AppText>
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Reason: {item.reason} {item.supplierName ? `(Supplier: ${item.supplierName})` : `(${item.source})`}
                      </AppText>
                    </View>

                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </AppText>
                  </View>
                </ThemedView>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyBox}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              No Stock Movements Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No stock records matched "${searchQuery}".`
                : 'No stock movements recorded under the selected filter.'}
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
  movementList: {
    gap: Spacing.three,
  },
  movementCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  changeBadge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
  },
  emptyBox: {
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
});
