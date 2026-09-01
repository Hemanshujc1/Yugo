import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import type { CatalogProduct } from '@/types/inventory';

export default function YugoCatalogScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { catalogProducts, shopInventory, addCatalogProductToShop } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Quick Add to Inventory modal state
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogProduct | null>(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    'All',
    'Grocery',
    'Beverages',
    'Snacks',
    'Dairy',
    'Bakery',
    'Personal Care',
    'Household',
    'Packaged Food',
    'Other',
  ];

  const filteredCatalog = catalogProducts.filter((cat) => {
    if (cat.isActive === false) return false;
    const matchesCategory =
      selectedCategory === 'All' || cat.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      cat.name.toLowerCase().includes(q) ||
      cat.brand.toLowerCase().includes(q) ||
      cat.variant.toLowerCase().includes(q) ||
      (cat.packSize && cat.packSize.toLowerCase().includes(q)) ||
      (cat.barcode && cat.barcode.includes(q));
    return matchesCategory && matchesQuery;
  });

  const handleStartAdd = (item: CatalogProduct) => {
    setSelectedCatalogItem(item);
    setSellingPrice(item.mrp.toString());
    setStockQuantity('20');
    setLowStockThreshold('5');
    setErrorMsg(null);
  };

  const handleConfirmAdd = async () => {
    if (!selectedCatalogItem) return;
    const priceNum = parseFloat(sellingPrice);
    const stockNum = parseInt(stockQuantity, 10);
    const threshNum = parseInt(lowStockThreshold, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid selling price in ₹.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setErrorMsg('Please enter a valid initial stock quantity.');
      return;
    }

    try {
      await addCatalogProductToShop(
        selectedCatalogItem.id,
        priceNum,
        stockNum,
        isNaN(threshNum) ? 5 : threshNum
      );
      setSelectedCatalogItem(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add product to inventory.');
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Product Catalog' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* HEADER & TOP ACTIONS */}
        <View style={{ gap: Spacing.two }}>
          <PageHeader
            title="Product Catalog"
            subtitle="Master product directory. Browse, onboard, or add products to shop inventory."
          />

          <View style={styles.topActionsRow}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
              onPress={() => router.push('/products/add' as any)}
            >
              <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                + Add Product
              </AppText>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.backgroundElement, borderColor: '#9CA3AF44', borderWidth: 1 }]}
              onPress={() => router.push('/import-products' as any)}
            >
              <AppText variant="caption" style={{ fontWeight: '800' }}>
                📁 Import Products
              </AppText>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, { backgroundColor: theme.backgroundElement, borderColor: '#9CA3AF44', borderWidth: 1 }]}
              onPress={() => router.push('/scanner' as any)}
            >
              <AppText variant="caption" style={{ fontWeight: '800' }}>
                📷 Scan Barcode
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* STICKY SEARCH & CATEGORY BAR */}
        <ThemedView type="backgroundElement" style={[styles.stickySearchBar, { borderColor: '#9CA3AF33' }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.background, borderColor: '#9CA3AF44' }]}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>🔍</AppText>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by product name, brand, or barcode..."
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

          {/* Category Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one, marginTop: 6 }}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: active ? '#2563EB' : theme.background,
                      borderColor: active ? '#2563EB' : '#9CA3AF44',
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: active ? '#FFFFFF' : theme.text,
                      fontWeight: active ? '800' : '500',
                      fontSize: 11,
                    }}
                  >
                    {cat}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {/* PRODUCT CATALOG LIST */}
        <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
          {filteredCatalog.length > 0 ? (
            filteredCatalog.map((item) => {
              const existingShopItem = shopInventory.find(
                (inv) => inv.catalogProductId === item.id || inv.catalogProduct?.id === item.id
              );
              const inInventory = Boolean(existingShopItem);

              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: '/products/[id]' as any, params: { id: item.id } })}
                >
                  <ThemedView type="backgroundElement" style={[styles.productCard, { borderColor: '#9CA3AF22' }]}>
                    <View style={styles.cardMainRow}>
                      <View style={{ flex: 1, gap: 2 }}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          {item.name}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          Brand: {item.brand} • Category: {item.category}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Pack Size: {item.packSize || item.variant || 'Standard'} • MRP: ₹{item.mrp}
                        </AppText>
                        {item.barcode && (
                          <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                            Barcode: {item.barcode}
                          </AppText>
                        )}
                      </View>

                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <StatusBadge
                          status={inInventory ? 'IN STOCK' : 'Not in Shop'}
                          size="sm"
                        />

                        {!inInventory ? (
                          <Pressable
                            style={styles.quickAddBtn}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleStartAdd(item);
                            }}
                          >
                            <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11 }}>
                              + Add to Shop
                            </AppText>
                          </Pressable>
                        ) : (
                          <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700', fontSize: 11 }}>
                            Selling: ₹{existingShopItem?.sellingPrice}
                          </AppText>
                        )}
                      </View>
                    </View>
                  </ThemedView>
                </Pressable>
              );
            })
          ) : (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                No products found
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                Try adjusting your search query or category filter.
              </AppText>

              <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three }}>
                <Button
                  title="+ Add New Product"
                  variant="primary"
                  size="sm"
                  onPress={() => router.push('/products/add' as any)}
                />
                <Button
                  title="📷 Scan Barcode"
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push('/scanner' as any)}
                />
              </View>
            </ThemedView>
          )}
        </View>
      </ScrollView>

      {/* Quick Add to Inventory Modal */}
      <Modal visible={Boolean(selectedCatalogItem)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Add to Shop Inventory
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {selectedCatalogItem?.name} ({selectedCatalogItem?.variant}) • MRP: ₹{selectedCatalogItem?.mrp}
            </AppText>

            <View style={{ gap: Spacing.three, paddingVertical: Spacing.two }}>
              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Shop Selling Price (₹) *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="numeric"
                />
                <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>
                  Price customers will pay at your shop (Default: MRP ₹{selectedCatalogItem?.mrp})
                </AppText>
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Initial Stock Quantity (Units / Packets) *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Low Stock Threshold
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={lowStockThreshold}
                  onChangeText={setLowStockThreshold}
                  keyboardType="numeric"
                />
              </View>

              {errorMsg && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {errorMsg}
                </AppText>
              )}
            </View>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setSelectedCatalogItem(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Add" variant="primary" onPress={handleConfirmAdd} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  topActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickySearchBar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginHorizontal: -Spacing.four,
    borderBottomWidth: 1,
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
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  productCard: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  quickAddBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    borderRadius: 20,
    padding: Spacing.five,
    maxHeight: '80%',
    gap: Spacing.two,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    marginTop: 4,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
