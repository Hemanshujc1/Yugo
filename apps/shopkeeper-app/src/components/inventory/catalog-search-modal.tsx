import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';

import { AppText, Button, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import type { CatalogProduct } from '@/types/inventory';

export interface CatalogSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectProductDetails?: (product: CatalogProduct) => void;
}

export function CatalogSearchModal({ visible, onClose }: CatalogSearchModalProps) {
  const theme = useTheme();
  const { catalogProducts, shopInventory, addCatalogProductToShop } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form state for adding selected catalog product
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<CatalogProduct | null>(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ['All', 'Staples', 'Snacks', 'Beverages', 'Dairy', 'Personal Care', 'Cleaning', 'Packaged Food', 'Bakery', 'Spices'];

  const filteredCatalog = catalogProducts.filter((cat) => {
    const matchesCategory = selectedCategory === 'All' || cat.category.toLowerCase() === selectedCategory.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      cat.name.toLowerCase().includes(q) ||
      cat.brand.toLowerCase().includes(q) ||
      cat.variant.toLowerCase().includes(q) ||
      (cat.barcode && cat.barcode.includes(q));
    return matchesCategory && matchesQuery;
  });

  const handleStartAdd = (item: CatalogProduct) => {
    setSelectedCatalogItem(item);
    setSellingPrice(item.mrp.toString());
    setStockQuantity('10');
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
      await addCatalogProductToShop(selectedCatalogItem.id, priceNum, stockNum, isNaN(threshNum) ? 5 : threshNum);
      setSelectedCatalogItem(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add product to inventory.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ThemedView type="backgroundElement" style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                Search Yugo Product Catalog
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Browse over 100+ master catalog products and add to your shop
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppText variant="subtitle" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                ✕
              </AppText>
            </Pressable>
          </View>

          {/* Search Input */}
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.text, borderColor: theme.textSecondary, backgroundColor: theme.background },
            ]}
            placeholder="Search by Product Name, Brand (e.g. Tata, Maggi) or Barcode..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Category Filter Pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? '#2563EB' : theme.background,
                      borderColor: active ? '#2563EB' : '#9CA3AF44',
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <AppText
                    variant="caption"
                    style={{ color: active ? '#FFFFFF' : theme.text, fontWeight: active ? '700' : '500' }}
                  >
                    {cat}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Catalog Results List */}
          <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
            {filteredCatalog.map((item) => {
              const isAlreadyInShop = shopInventory.some((inv) => inv.catalogProductId === item.id);

              return (
                <View key={item.id} style={[styles.catalogItemRow, { borderColor: '#9CA3AF22' }]}>
                  <View style={{ flex: 1, paddingRight: Spacing.two }}>
                    <AppText variant="subtitle" style={{ fontWeight: '700' }} numberOfLines={1}>
                      {item.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {item.brand} • {item.variant} • MRP: ₹{item.mrp}
                    </AppText>
                    {Boolean(item.barcode) && (
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Barcode: {item.barcode}
                      </AppText>
                    )}
                  </View>

                  {isAlreadyInShop ? (
                    <View style={styles.alreadyBadge}>
                      <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>
                        ✓ In Inventory
                      </AppText>
                    </View>
                  ) : (
                    <Button
                      title="+ Add"
                      variant="primary"
                      size="sm"
                      onPress={() => handleStartAdd(item)}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>

          <Button title="Close Catalog Search" variant="secondary" onPress={onClose} />
        </ThemedView>
      </View>

      {/* Form Dialog for Stocking Selected Catalog Product */}
      <Modal visible={Boolean(selectedCatalogItem)} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.formCard}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Add to Shop Inventory
            </AppText>
            <AppText variant="subtitle" style={{ fontWeight: '700', color: '#2563EB' }}>
              {selectedCatalogItem?.name} ({selectedCatalogItem?.variant})
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Brand: {selectedCatalogItem?.brand} • Catalog MRP: ₹{selectedCatalogItem?.mrp}
            </AppText>

            <View style={styles.inputGroup}>
              <AppText variant="caption" style={{ fontWeight: '600' }}>
                Selling Price (₹)
              </AppText>
              <TextInput
                style={[styles.formInput, { color: theme.text, borderColor: theme.textSecondary }]}
                keyboardType="numeric"
                value={sellingPrice}
                onChangeText={setSellingPrice}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText variant="caption" style={{ fontWeight: '600' }}>
                Initial Stock Quantity
              </AppText>
              <TextInput
                style={[styles.formInput, { color: theme.text, borderColor: theme.textSecondary }]}
                keyboardType="numeric"
                value={stockQuantity}
                onChangeText={setStockQuantity}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppText variant="caption" style={{ fontWeight: '600' }}>
                Low Stock Threshold
              </AppText>
              <TextInput
                style={[styles.formInput, { color: theme.text, borderColor: theme.textSecondary }]}
                keyboardType="numeric"
                value={lowStockThreshold}
                onChangeText={setLowStockThreshold}
              />
            </View>

            {errorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {errorMsg}
              </AppText>
            )}

            <View style={styles.formBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setSelectedCatalogItem(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save to Shop" variant="primary" onPress={handleConfirmAdd} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    borderRadius: 20,
    padding: Spacing.four,
    width: '100%',
    maxWidth: 480,
    height: '85%',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  categoryScroll: {
    gap: Spacing.two,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  resultsList: {
    flex: 1,
  },
  catalogItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  alreadyBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formCard: {
    borderRadius: 20,
    padding: Spacing.five,
    width: '100%',
    maxWidth: 400,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  inputGroup: {
    gap: 4,
  },
  formInput: {
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
