import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { AppText, Screen, Button, PageHeader } from '@/components';
import { ProductCard } from '@/components/dashboard';
import { useProducts } from '@/hooks';
import { mapProductToItem } from '@/services/product-service';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FilterType = 'all' | 'available' | 'unavailable' | 'low_stock' | 'out_of_stock';
type SortType = 'name' | 'price' | 'stock';
type SortDirection = 'asc' | 'desc';

export default function ProductsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const { products } = useProducts();

  const [localCategory, setLocalCategory] = useState<string | undefined>(undefined);
  const activeCategory = params.category || localCategory;

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [sortOrder, setSortOrder] = useState<SortDirection>('asc');

  const handleSortPress = (key: SortType) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const handleClearCategory = () => {
    setLocalCategory(undefined);
    if (params.category) {
      router.setParams({ category: undefined });
    }
  };

  // Filter products by Category + Search + Availability
  const filteredProducts = products.filter((p) => {
    // 1. Category Filter
    if (activeCategory && p.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }

    // 2. Text Search
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.sku && p.sku.toLowerCase().includes(query)) ||
      (p.barcode && p.barcode.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // 3. Availability / Stock Filter
    switch (filter) {
      case 'available':
        return p.isAvailable;
      case 'unavailable':
        return !p.isAvailable;
      case 'low_stock':
        return p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold ?? 10);
      case 'out_of_stock':
        return p.stockQuantity === 0;
      default:
        return true;
    }
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let result = 0;
    if (sortBy === 'name') {
      result = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      result = a.price - b.price;
    } else if (sortBy === 'stock') {
      result = a.stockQuantity - b.stockQuantity;
    }
    return sortOrder === 'asc' ? result : -result;
  });

  const productItems = sortedProducts.map(mapProductToItem);

  const handleClearFilters = () => {
    handleClearCategory();
    setSearchQuery('');
    setFilter('all');
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'unavailable', label: 'Unavailable' },
    { key: 'low_stock', label: 'Low Stock' },
    { key: 'out_of_stock', label: 'Out of Stock' },
  ];

  const sortOptions: { key: SortType; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page Title Header */}
        <PageHeader
          title="Products"
          subtitle="Manage your catalog, pricing, and availability."
        />

        {/* Full-width Add Product Action Button */}
        <Button
          title="+ Add Product"
          variant="primary"
          onPress={() => router.push('/products/add' as any)}
        />

        {/* Active Category Filter Chip (shown separately from Search Bar) */}
        {activeCategory && (
          <View style={styles.categoryChipRow}>
            <View style={styles.categoryChip}>
              <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                Category: {activeCategory}
              </AppText>
              <Pressable onPress={handleClearCategory} style={styles.chipCloseBtn}>
                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                  ✕
                </AppText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Search Input (Normal Text Search) */}
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
        <View style={styles.filterContainer}>
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
                  <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.text }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Sort Controls Bar */}
        <View style={styles.sortBar}>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            Sort by:
          </AppText>
          <View style={[styles.sortSegment, { backgroundColor: theme.backgroundElement }]}>
            {sortOptions.map((opt) => {
              const active = sortBy === opt.key;
              const arrow = active ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : '';
              return (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.sortTab,
                    { backgroundColor: active ? '#2563EB' : 'transparent' },
                  ]}
                  onPress={() => handleSortPress(opt.key)}
                >
                  <Text style={[styles.sortTabText, { color: active ? '#FFFFFF' : theme.text }]}>
                    {opt.label}{arrow}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.catalogHeader}>
          <AppText variant="h3">
            Product Catalog ({productItems.length})
          </AppText>
        </View>

        {/* Individual Product Cards List */}
        {productItems.length > 0 ? (
          <View style={styles.productList}>
            {productItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onEdit={() => router.push(`/products/${item.id}` as any)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>No Products Found</AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {activeCategory
                ? `No products found under category "${activeCategory}".`
                : searchQuery
                  ? `No products matching "${searchQuery}".`
                  : 'No items found matching the selected filter.'}
            </AppText>
            <Button title="Clear Category / Search / Filters" variant="outline" size="sm" onPress={handleClearFilters} />
          </View>
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
    gap: Spacing.three,
  },
  categoryChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB15',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2563EB44',
    gap: Spacing.two,
  },
  chipCloseBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
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
  filterContainer: {
    marginVertical: 2,
  },
  filterScroll: {
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortSegment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  sortTab: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 10,
  },
  sortTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  productList: {
    gap: Spacing.three,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
});
