import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Screen, ThemedView, PageHeader, StockStatusBadge, StatCard, Button } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { formatRelativeUpdateTime, isStockStale } from '@/services/product-service';
import type { Product } from '@/types/product';

type FilterOption = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'unavailable';

export default function InventoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { products, updateStock, lastStockUpdateTimestamp } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');

  // Dynamic calculations from shared product state
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold ?? 10)
  ).length;
  const inStockCount = products.filter(
    (p) => p.stockQuantity > (p.lowStockThreshold ?? 10)
  ).length;

  const freshnessLabel = formatRelativeUpdateTime(lastStockUpdateTimestamp);
  const staleNotice = isStockStale(lastStockUpdateTimestamp);

  // Search & Filter logic
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.barcode && p.barcode.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    const threshold = p.lowStockThreshold ?? 10;
    if (filter === 'in_stock') return p.stockQuantity > threshold;
    if (filter === 'low_stock') return p.stockQuantity > 0 && p.stockQuantity <= threshold;
    if (filter === 'out_of_stock') return p.stockQuantity === 0;
    if (filter === 'unavailable') return !p.isAvailable;
    return true;
  });

  const filterOptions: { key: FilterOption; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: totalProducts },
    { key: 'in_stock', label: 'In Stock', count: inStockCount },
    { key: 'low_stock', label: 'Low Stock', count: lowStockCount },
    { key: 'out_of_stock', label: 'Out of Stock', count: outOfStockCount },
    { key: 'unavailable', label: 'Unavailable' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Uncluttered Page Title Header */}
        <PageHeader
          title="Inventory"
          subtitle="Monitor and adjust your stock levels in real-time."
        />

        {/* Clean Offline Stock Update Action Banner */}
        <ThemedView type="backgroundElement" style={[styles.actionBannerCard, { borderColor: '#9CA3AF33' }]}>
          <View style={styles.actionBannerText}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              Offline Stock Update
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Record physical store sales to keep customer stock accurate.
            </AppText>
          </View>
          <Button
            title="Update Stock"
            variant="primary"
            size="sm"
            onPress={() => router.push('/update-stock' as any)}
          />
        </ThemedView>

        {/* Responsive Stock Freshness Card */}
        <ThemedView type="backgroundElement" style={[styles.freshnessCard, { borderColor: '#9CA3AF33' }]}>
          <View style={styles.freshnessHeaderRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Customer-Facing Stock Freshness
            </AppText>
            {staleNotice && (
              <View style={styles.staleNoticeChip}>
                <AppText variant="caption" style={{ color: '#B06000', fontWeight: '700' }}>
                  ⚠️ Stock may need updating
                </AppText>
              </View>
            )}
          </View>
          <AppText variant="subtitle" style={{ fontWeight: '700', marginTop: 4 }}>
            {freshnessLabel}
          </AppText>
        </ThemedView>

        {/* Responsive Equal 2-Column Summary Metrics */}
        <View style={styles.metricsGrid}>
          <StatCard title="Total Items" value={totalProducts} accentColor="#3B82F6" />
          <StatCard title="In Stock" value={inStockCount} accentColor="#10B981" />
          <StatCard title="Low Stock" value={lowStockCount} accentColor="#F59E0B" />
          <StatCard title="Out of Stock" value={outOfStockCount} accentColor="#EF4444" />
        </View>

        {/* Search Bar */}
        <TextInput
          style={[
            styles.searchInput,
            { color: theme.text, borderColor: theme.textSecondary, backgroundColor: theme.backgroundElement },
          ]}
          placeholder="Search name, category, SKU, barcode..."
          placeholderTextColor={theme.textSecondary}
          numberOfLines={1}
          multiline={false}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Chips Horizontal Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterOptions.map((opt) => {
            const active = filter === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? '#2563EB' : theme.backgroundElement,
                    borderColor: theme.textSecondary,
                  },
                ]}
                onPress={() => setFilter(opt.key)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: active ? '#FFFFFF' : theme.text,
                    fontWeight: active ? '700' : '500',
                  }}
                >
                  {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Inventory Items List */}
        {filteredProducts.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredProducts.map((product) => (
              <InventoryItemCard
                key={product.id}
                product={product}
                onUpdateStock={(newQty) => updateStock(product.id, newQty)}
                onViewDetails={() => router.push(`/products/${product.id}` as any)}
              />
            ))}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>No Products Found</AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No inventory items matched "${searchQuery}".`
                : 'There are no items matching the selected inventory filter.'}
            </AppText>
          </ThemedView>
        )}
      </ScrollView>
    </Screen>
  );
}

function InventoryItemCard({
  product,
  onUpdateStock,
  onViewDetails,
}: {
  product: Product;
  onUpdateStock: (newQty: number) => void;
  onViewDetails: () => void;
}) {
  const theme = useTheme();
  const [inputVal, setInputVal] = useState(product.stockQuantity.toString());

  const threshold = product.lowStockThreshold ?? 10;
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= threshold;
  const isUnavailable = !product.isAvailable;

  let statusLabel = 'In Stock';
  if (isUnavailable) statusLabel = 'Unavailable';
  else if (isOutOfStock) statusLabel = 'Out of stock';
  else if (isLowStock) statusLabel = 'Low stock';

  const handleAdjust = (delta: number) => {
    const nextQty = Math.max(0, product.stockQuantity + delta);
    setInputVal(nextQty.toString());
    onUpdateStock(nextQty);
  };

  const handleBlur = () => {
    const parsed = parseInt(inputVal, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateStock(parsed);
    } else {
      setInputVal(product.stockQuantity.toString());
    }
  };

  return (
    <ThemedView type="backgroundElement" style={[styles.itemCard, { borderColor: '#9CA3AF33' }]}>
      {/* Header Info */}
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleWrapper}>
          <AppText variant="subtitle" style={{ fontWeight: '700' }} numberOfLines={1}>
            {product.name}
          </AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {product.category} {product.sku ? `| SKU: ${product.sku}` : ''}
          </AppText>
        </View>
        <StockStatusBadge status={statusLabel} />
      </View>

      {/* Stock Metadata */}
      <View style={styles.stockInfoRow}>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          Threshold: <AppText variant="caption" style={{ fontWeight: '600' }}>{threshold}</AppText>
        </AppText>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          Listing: <AppText variant="caption" style={{ fontWeight: '600', color: product.isAvailable ? '#10B981' : '#9CA3AF' }}>{product.isAvailable ? 'Available' : 'Hidden'}</AppText>
        </AppText>
      </View>

      {/* Responsive Stock Control Row */}
      <View style={styles.stockControlRow}>
        <View style={styles.padControls}>
          <Pressable
            style={[styles.padBtn, { backgroundColor: theme.background }]}
            onPress={() => handleAdjust(-1)}
          >
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>−</AppText>
          </Pressable>
          <TextInput
            style={[styles.padInput, { color: theme.text, borderColor: theme.textSecondary }]}
            keyboardType="number-pad"
            value={inputVal}
            onChangeText={setInputVal}
            onBlur={handleBlur}
          />
          <Pressable
            style={[styles.padBtn, { backgroundColor: theme.background }]}
            onPress={() => handleAdjust(1)}
          >
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>+</AppText>
          </Pressable>
        </View>

        <Button
          title="Details"
          variant="secondary"
          size="sm"
          onPress={onViewDetails}
        />
      </View>
    </ThemedView>
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
  actionBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
  },
  actionBannerText: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  freshnessCard: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.one,
  },
  freshnessHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  staleNoticeChip: {
    backgroundColor: '#FEF7E0',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  searchInput: {
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: 0,
    fontSize: 15,
    textAlignVertical: 'center',
  },
  filterScroll: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
  },
  listContainer: {
    gap: Spacing.three,
  },
  emptyCard: {
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  itemTitleWrapper: {
    flex: 1,
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
    width: '100%',
  },
  padControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  padBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF44',
  },
  padInput: {
    width: 48,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 14,
    fontWeight: '700',
  },
});
