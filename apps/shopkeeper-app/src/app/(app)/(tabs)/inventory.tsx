import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  AppText,
  Button,
  Screen,
  ThemedView,
  StatCard,
  SearchBar,
  StockStatusBadge,
} from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { formatRelativeUpdateTime, isStockStale } from '@/services/product-service';
import { getStockUnitLabel } from '@/utils/stock-unit';

import { ExcelImportModal } from '@/components/inventory/excel-import-modal';
import { StockAdjustmentModal } from '@/components/inventory/stock-adjustment-modal';
import type { ShopInventoryItem } from '@/types/inventory';

type InventoryFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'active_catalog' | 'unavailable';

export default function InventoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { shopInventory, lastStockUpdateTimestamp } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<InventoryFilter>('all');

  // Modals state
  const [addMenuVisible, setAddMenuVisible] = useState(false);
  const [excelModalVisible, setExcelModalVisible] = useState(false);
  const [selectedEditItem, setSelectedEditItem] = useState<ShopInventoryItem | null>(null);

  // Derived Summary Metrics
  const totalItemsCount = shopInventory.length;
  const lowStockItems = shopInventory.filter(
    (item) => item.isAvailable && item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold
  );
  const outOfStockItems = shopInventory.filter((item) => item.isAvailable && item.stockQuantity === 0);
  const activeCatalogItems = shopInventory.filter((item) => item.isAvailable);
  const totalStockCount = shopInventory.reduce((acc, item) => acc + item.stockQuantity, 0);

  const filterChips: { key: InventoryFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: totalItemsCount },
    { key: 'in_stock', label: 'In Stock', count: shopInventory.filter((i) => i.isAvailable && i.stockQuantity > i.lowStockThreshold).length },
    { key: 'low_stock', label: 'Low Stock', count: lowStockItems.length },
    { key: 'out_of_stock', label: 'Out of Stock', count: outOfStockItems.length },
    { key: 'active_catalog', label: 'Active Catalog', count: activeCatalogItems.length },
    { key: 'unavailable', label: 'Unavailable', count: shopInventory.filter((i) => !i.isAvailable).length },
  ];

  const filteredInventory = shopInventory.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    const cat = item.catalogProduct;
    const matchesQuery =
      !q ||
      cat.name.toLowerCase().includes(q) ||
      cat.brand.toLowerCase().includes(q) ||
      cat.variant.toLowerCase().includes(q) ||
      (cat.barcode && cat.barcode.includes(q));

    if (!matchesQuery) return false;

    if (filter === 'in_stock') return item.isAvailable && item.stockQuantity > item.lowStockThreshold;
    if (filter === 'low_stock') return item.isAvailable && item.stockQuantity > 0 && item.stockQuantity <= item.lowStockThreshold;
    if (filter === 'out_of_stock') return item.isAvailable && item.stockQuantity === 0;
    if (filter === 'active_catalog') return item.isAvailable;
    if (filter === 'unavailable') return !item.isAvailable;
    return true;
  });

  const isStale = isStockStale(lastStockUpdateTimestamp);

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        stickyHeaderIndices={[4]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Index 0: Header Section (Unstacked buttons so Inventory NEVER wraps) */}
        <View style={styles.headerContainer}>
          <AppText variant="h1" style={styles.headerTitle}>
            Inventory
          </AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
            Manage your stock, pricing, and catalog.
          </AppText>

          <View style={styles.headerBtnRow}>
            <Pressable
              style={[styles.historyIconBtn, { flex: 1, backgroundColor: theme.backgroundElement }]}
              onPress={() => router.push('/stock-history' as any)}
            >
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                📜 History
              </AppText>
            </Pressable>
            <Pressable
              style={[styles.historyIconBtn, { flex: 1, backgroundColor: '#E0F2FE', borderColor: '#2563EB' }]}
              onPress={() => router.push('/receive-stock' as any)}
            >
              <AppText variant="caption" style={{ fontWeight: '800', color: '#2563EB' }}>
                📦 Receive Stock
              </AppText>
            </Pressable>
          </View>

          <View style={{ marginTop: Spacing.two, width: '100%' }}>
            <Button
              title="+ Add Products to Inventory"
              variant="primary"
              size="md"
              onPress={() => setAddMenuVisible(true)}
            />
          </View>
        </View>

        {/* Index 1: Stock Audit Alert Container Banner (Navigates to /stock-audit) */}
        <Pressable onPress={() => router.push('/stock-audit' as any)}>
          <ThemedView
            type="backgroundElement"
            style={[
              styles.freshnessCard,
              {
                backgroundColor: isStale ? '#FEF2F2' : '#F0FDF4',
                borderColor: isStale ? '#FCA5A5' : '#86EFAC',
              },
            ]}
          >
            <View style={styles.freshnessRow}>
              <View style={{ flex: 1, paddingRight: Spacing.two }}>
                <AppText
                  variant="caption"
                  style={{
                    fontWeight: '700',
                    color: isStale ? '#991B1B' : '#166534',
                  }}
                >
                  {isStale ? '⚠️ Stock audit recommended' : '✓ Stock Freshness'}
                </AppText>
                <AppText
                  variant="caption"
                  style={{
                    color: isStale ? '#991B1B' : '#166534',
                    marginTop: 2,
                  }}
                >
                  {formatRelativeUpdateTime(lastStockUpdateTimestamp)}
                </AppText>
              </View>
              <AppText variant="subtitle" style={{ color: isStale ? '#991B1B' : '#166534', fontWeight: '700' }}>
                →
              </AppText>
            </View>
          </ThemedView>
        </Pressable>

        {/* Index 2: Offline Counter Sales Entry Banner */}
        <Pressable style={styles.updateStockBanner} onPress={() => router.push('/counter-sale' as any)}>
          <View style={{ flex: 1 }}>
            <AppText variant="subtitle" style={{ fontWeight: '800', color: '#FFFFFF' }}>
              ⚡ Record Offline Counter Sales
            </AppText>
            <AppText variant="caption" style={{ color: '#E0E7FF', marginTop: 2 }}>
              Deduct items sold physically at shop to keep stock accurate.
            </AppText>
          </View>
          <AppText variant="h3" style={{ color: '#FFFFFF', fontWeight: '800' }}>
            →
          </AppText>
        </Pressable>

        {/* Index 3: 2-Column Derived Metric Grid */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Total Stock Units"
            value={totalStockCount}
            subtitle={`${totalItemsCount} catalog items`}
            style={styles.metricCardItem}
            accentColor="#2563EB"
            onPress={() => setFilter('all')}
            selected={filter === 'all'}
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.length}
            subtitle="Restock soon"
            style={styles.metricCardItem}
            accentColor="#F59E0B"
            onPress={() => setFilter('low_stock')}
            selected={filter === 'low_stock'}
          />
          <StatCard
            title="Out of Stock"
            value={outOfStockItems.length}
            subtitle="Customer hidden"
            style={styles.metricCardItem}
            accentColor="#DC2626"
            onPress={() => setFilter('out_of_stock')}
            selected={filter === 'out_of_stock'}
          />
          <StatCard
            title="Active Catalog"
            value={activeCatalogItems.length}
            subtitle="Visible to buyers"
            style={styles.metricCardItem}
            accentColor="#10B981"
            onPress={() => setFilter('active_catalog')}
            selected={filter === 'active_catalog'}
          />
        </View>

        {/* Index 4: Sticky Search Bar Container */}
        <View style={[styles.stickySearchContainer, { backgroundColor: theme.background, borderBottomWidth: 1, borderColor: '#9CA3AF33' }]}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products, brands, or barcodes..."
          />
        </View>

        {/* Index 5: Filter Chips Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filterChips.map((chip) => {
            const active = filter === chip.key;
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
                onPress={() => setFilter(chip.key)}
              >
                <AppText
                  variant="caption"
                  style={{
                    color: active ? '#FFFFFF' : theme.text,
                    fontWeight: active ? '700' : '500',
                  }}
                >
                  {chip.label} {chip.count !== undefined ? `(${chip.count})` : ''}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Index 6: Inventory Items List */}
        {filteredInventory.length > 0 ? (
          <View style={styles.inventoryList}>
            {filteredInventory.map((item) => {
              const cat = item.catalogProduct;
              const unit = getStockUnitLabel(cat.category, cat.variant, cat.unit);

              const status: 'In stock' | 'Low stock' | 'Out of stock' | 'Unavailable' =
                !item.isAvailable
                  ? 'Unavailable'
                  : item.stockQuantity === 0
                    ? 'Out of stock'
                    : item.stockQuantity <= item.lowStockThreshold
                      ? 'Low stock'
                      : 'In stock';

              return (
                <Pressable key={item.id} onPress={() => router.push(`/inventory-detail/${item.id}` as any)}>
                  <ThemedView type="backgroundElement" style={[styles.itemCard, { borderColor: '#9CA3AF22' }]}>
                    <View style={styles.itemMetaRow}>
                      <View style={{ flex: 1, paddingRight: Spacing.two }}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }} numberOfLines={2}>
                          {cat.name}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                          {cat.brand} • Pack size: {cat.variant} • MRP: ₹{cat.mrp}
                        </AppText>
                      </View>
                      <StockStatusBadge status={status} />
                    </View>

                    <View style={styles.itemDetailRow}>
                      <View>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          Selling Price
                        </AppText>
                        <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                          ₹{item.sellingPrice}
                        </AppText>
                      </View>

                      <View>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          Stock Quantity
                        </AppText>
                        <AppText variant="subtitle" style={{ fontWeight: '800', color: status === 'Low stock' ? '#F59E0B' : status === 'Out of stock' ? '#DC2626' : theme.text }}>
                          {item.stockQuantity} {unit}
                        </AppText>
                      </View>

                      <Button
                        title="Edit Stock"
                        variant="secondary"
                        size="sm"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => setSelectedEditItem(item)}
                      />
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="h3" style={{ fontWeight: '700' }}>
              No Inventory Items Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No inventory items matched "${searchQuery}".`
                : 'No items match the selected inventory status filter.'}
            </AppText>
          </ThemedView>
        )}
      </ScrollView>

      {/* + Add Products Options Sheet */}
      <Modal visible={addMenuVisible} transparent animationType="fade" onRequestClose={() => setAddMenuVisible(false)}>
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.menuCard}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Add Products to Shop Inventory
            </AppText>

            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Choose how you would like to onboard products into your inventory:
            </AppText>

            <View style={styles.menuOptionsList}>
              {/* Option 1: Import Excel */}
              <Pressable
                style={styles.optionCard}
                onPress={() => {
                  setAddMenuVisible(false);
                  setExcelModalVisible(true);
                }}
              >
                <AppText variant="h3" style={{ fontSize: 24 }}>
                  📊
                </AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Import Excel / CSV
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Add or update many products at once from a spreadsheet file.
                  </AppText>
                </View>
              </Pressable>

              {/* Option 2: Search Yugo Catalog */}
              <Pressable
                style={styles.optionCard}
                onPress={() => {
                  setAddMenuVisible(false);
                  router.push('/catalog');
                }}
              >
                <AppText variant="h3" style={{ fontSize: 24 }}>
                  🔍
                </AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Search Yugo Product Catalog
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Browse 100+ master catalog products on a full page.
                  </AppText>
                </View>
              </Pressable>

              {/* Option 3: Scan Barcode */}
              <Pressable
                style={styles.optionCard}
                onPress={() => {
                  setAddMenuVisible(false);
                  router.push('/scanner' as any);
                }}
              >
                <AppText variant="h3" style={{ fontSize: 24 }}>
                  📷
                </AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Scan Barcode
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Use phone camera to scan product barcode.
                  </AppText>
                </View>
              </Pressable>

              {/* Option 4: Add Manually */}
              <Pressable
                style={styles.optionCard}
                onPress={() => {
                  setAddMenuVisible(false);
                  router.push('/products/add');
                }}
              >
                <AppText variant="h3" style={{ fontSize: 24 }}>
                  ✍️
                </AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Add Manually
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Create a custom product that is not in the global catalog.
                  </AppText>
                </View>
              </Pressable>
            </View>

            <Button title="Close" variant="secondary" onPress={() => setAddMenuVisible(false)} />
          </ThemedView>
        </View>
      </Modal>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        visible={Boolean(selectedEditItem)}
        item={selectedEditItem}
        onClose={() => setSelectedEditItem(null)}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal visible={excelModalVisible} onClose={() => setExcelModalVisible(false)} />
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
  headerContainer: {
    width: '100%',
    gap: Spacing.one,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
  },
  headerBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
    width: '100%',
  },
  historyIconBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freshnessCard: {
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderWidth: 1,
    width: '100%',
  },
  freshnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateStockBanner: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  metricCardItem: {
    width: '48%',
    minWidth: 150,
  },
  stickySearchContainer: {
    paddingVertical: Spacing.two,
    zIndex: 10,
  },
  searchInput: {
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
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
  inventoryList: {
    gap: Spacing.three,
  },
  itemCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
  },
  emptyCard: {
    borderRadius: 20,
    padding: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  menuCard: {
    borderRadius: 20,
    padding: Spacing.five,
    width: '100%',
    maxWidth: 420,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  menuOptionsList: {
    gap: Spacing.two,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: '#9CA3AF15',
  },
});
