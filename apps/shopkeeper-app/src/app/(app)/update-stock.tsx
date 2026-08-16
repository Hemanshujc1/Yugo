import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import type { Product } from '@/types/product';

interface SelectedUpdateItem {
  product: Product;
  quantitySold: number;
  error?: string;
}

export default function UpdateStockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { products, recordOfflineStockUpdate } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedUpdateItem[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Search results
  const matchingProducts = products.filter((p) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.trim().toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  });

  const handleSelectProduct = (product: Product) => {
    const existingIndex = selectedItems.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      // If already added, increment by 1 if within available stock
      const current = selectedItems[existingIndex];
      const maxAvailable = product.stockQuantity;
      if (current.quantitySold < maxAvailable) {
        const updated = [...selectedItems];
        updated[existingIndex] = {
          ...current,
          quantitySold: current.quantitySold + 1,
          error: undefined,
        };
        setSelectedItems(updated);
      }
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          product,
          quantitySold: 1,
          error: product.stockQuantity < 1 ? 'Product is currently out of stock.' : undefined,
        },
      ]);
    }
    setSearchQuery('');
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const maxAvailable = item.product.stockQuantity;
        const nextQty = item.quantitySold + delta;
        if (nextQty > maxAvailable) {
          return {
            ...item,
            error: `Only ${maxAvailable} unit${maxAvailable === 1 ? '' : 's'} available in stock.`,
          };
        }
        if (nextQty < 1) return item;
        return {
          ...item,
          quantitySold: nextQty,
          error: undefined,
        };
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Summary counts
  const productsUpdatedCount = selectedItems.length;
  const totalItemsSold = selectedItems.reduce((sum, item) => sum + item.quantitySold, 0);
  const hasErrors = selectedItems.some((item) => Boolean(item.error));

  const handleSave = async () => {
    if (selectedItems.length === 0 || hasErrors) return;

    const payload = selectedItems.map((item) => ({
      productId: item.product.id,
      quantitySold: item.quantitySold,
    }));

    await recordOfflineStockUpdate(payload);
    setFeedbackMsg(`Stock Updated! ${totalItemsSold} item${totalItemsSold === 1 ? '' : 's'} removed from inventory.`);

    setTimeout(() => {
      router.replace('/inventory');
    }, 1200);
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Update Stock' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Header */}
        <PageHeader
          title="Update Stock"
          subtitle="Record products sold offline to keep customer-facing stock accurate."
        />

        {/* Success Feedback Banner */}
        {feedbackMsg && (
          <View style={styles.successBanner}>
            <AppText variant="subtitle" style={{ fontWeight: '700', color: '#10B981' }}>
              ✓ {feedbackMsg}
            </AppText>
          </View>
        )}

        {/* Search Input Box */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '700' }}>
            What did you sell offline?
          </AppText>

          <TextInput
            style={[
              styles.searchInput,
              { color: theme.text, borderColor: theme.textSecondary, backgroundColor: theme.background },
            ]}
            placeholder="Search product name, category, SKU..."
            placeholderTextColor={theme.textSecondary}
            numberOfLines={1}
            multiline={false}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Search Dropdown Results */}
          {matchingProducts.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {matchingProducts.map((prod) => (
                <Pressable
                  key={prod.id}
                  style={styles.searchResultRow}
                  onPress={() => handleSelectProduct(prod)}
                >
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                      {prod.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {prod.category} • Available: {prod.stockQuantity}
                    </AppText>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                    + Add
                  </AppText>
                </Pressable>
              ))}
            </View>
          )}
        </ThemedView>

        {/* Selected Products List */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Selected Offline Sales ({selectedItems.length})
          </AppText>

          {selectedItems.length > 0 ? (
            <View style={styles.itemsList}>
              {selectedItems.map((item) => (
                <View key={item.product.id} style={styles.itemRow}>
                  <View style={styles.itemHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                        {item.product.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        Current Available: {item.product.stockQuantity}
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => handleRemoveItem(item.product.id)}
                      style={styles.removeBtn}
                    >
                      <SymbolView
                        name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' } as any}
                        size={20}
                        tintColor={theme.textSecondary}
                      />
                    </Pressable>
                  </View>

                  {/* Quantity Stepper */}
                  <View style={styles.stepperContainer}>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Sold Offline:
                    </AppText>

                    <View style={styles.stepperRow}>
                      <Pressable
                        style={[styles.stepperBtn, { backgroundColor: theme.background }]}
                        onPress={() => handleUpdateQuantity(item.product.id, -1)}
                      >
                        <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                          −
                        </AppText>
                      </Pressable>
                      <View style={styles.stepperValueBox}>
                        <AppText variant="h3" style={{ fontWeight: '800' }}>
                          {item.quantitySold}
                        </AppText>
                      </View>
                      <Pressable
                        style={[styles.stepperBtn, { backgroundColor: theme.background }]}
                        onPress={() => handleUpdateQuantity(item.product.id, 1)}
                      >
                        <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                          +
                        </AppText>
                      </Pressable>
                    </View>
                  </View>

                  {item.error && (
                    <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '600' }}>
                      ⚠️ {item.error}
                    </AppText>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyStateBox}>
              <AppText variant="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                No products added yet.
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Search for a product above to record offline stock movement.
              </AppText>
            </View>
          )}
        </ThemedView>

        {/* Summary Card & Save Actions (No monetary totals or POS fields!) */}
        {selectedItems.length > 0 && (
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Update Summary
            </AppText>

            <View style={styles.summaryRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Products Updated
              </AppText>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                {productsUpdatedCount}
              </AppText>
            </View>

            <View style={styles.summaryRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Total Items Sold Offline
              </AppText>
              <AppText variant="h3" style={{ fontWeight: '800', color: '#2563EB' }}>
                {totalItemsSold} units
              </AppText>
            </View>

            <View style={styles.actionButtonsRow}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => router.replace('/inventory')}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title="Save Stock Update"
                  variant="primary"
                  onPress={handleSave}
                />
              </View>
            </View>
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
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF44',
    paddingBottom: Spacing.one,
    marginBottom: Spacing.one,
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: 0,
    fontSize: 14,
    textAlignVertical: 'center',
  },
  searchResultsContainer: {
    marginTop: Spacing.two,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF22',
  },
  itemsList: {
    gap: Spacing.three,
  },
  itemRow: {
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: '#9CA3AF12',
    gap: Spacing.two,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  removeBtn: {
    padding: Spacing.one,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9CA3AF44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueBox: {
    width: 48,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563EB55',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateBox: {
    padding: Spacing.four,
    gap: Spacing.one,
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  successBanner: {
    backgroundColor: '#E6F4EA',
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B98144',
    alignItems: 'center',
  },
});
