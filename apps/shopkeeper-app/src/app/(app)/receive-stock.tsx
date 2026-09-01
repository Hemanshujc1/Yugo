import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { supplierService } from '@/services/supplier-service';
import { Supplier } from '@/types/supplier';
import { ShopInventoryItem } from '@/types/inventory';
import { getStockUnitLabel } from '@/utils/stock-unit';

interface ReceiptBuilderItem {
  item: ShopInventoryItem;
  quantityReceived: number;
  purchaseCostInput: string; // Keep as string for editable form input
}

export default function ReceiveStockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { shopInventory, recordStockReceipt } = useProducts();

  const paramSupplierId =
    typeof params.supplierId === 'string'
      ? params.supplierId
      : Array.isArray(params.supplierId)
        ? params.supplierId[0]
        : '';

  // Form & Wizard States
  const [step, setStep] = useState<'builder' | 'review'>('builder');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(paramSupplierId);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ReceiptBuilderItem[]>([]);
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supplierService.getSuppliers().then((res) => {
      setSuppliers(res);
      if (!selectedSupplierId && res.length > 0) {
        setSelectedSupplierId(res[0].id);
      }
    });
  }, [selectedSupplierId]);

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Searchable inventory items
  const searchableInventory = shopInventory.filter((inv) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false;
    return (
      inv.catalogProduct.name.toLowerCase().includes(q) ||
      inv.catalogProduct.brand.toLowerCase().includes(q) ||
      inv.catalogProduct.variant.toLowerCase().includes(q) ||
      (inv.catalogProduct.barcode && inv.catalogProduct.barcode.includes(q))
    );
  });

  const handleAddProduct = (inv: ShopInventoryItem) => {
    const existingIdx = items.findIndex((i) => i.item.id === inv.id);
    if (existingIdx !== -1) {
      const updated = [...items];
      updated[existingIdx].quantityReceived += 1;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          item: inv,
          quantityReceived: 10,
          purchaseCostInput: inv.latestPurchaseCost ? String(inv.latestPurchaseCost) : '',
        },
      ]);
    }
    setSearchQuery('');
  };

  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setItems(items.filter((i) => i.item.id !== itemId));
    } else {
      setItems(
        items.map((i) => (i.item.id === itemId ? { ...i, quantityReceived: newQty } : i))
      );
    }
  };

  const handleUpdateCost = (itemId: string, costStr: string) => {
    setItems(
      items.map((i) => (i.item.id === itemId ? { ...i, purchaseCostInput: costStr } : i))
    );
  };

  // Calculations
  const totalProductsCount = items.length;
  const totalUnitsReceived = items.reduce((acc, i) => acc + i.quantityReceived, 0);

  let totalPurchaseValue = 0;
  let hasUnknownCosts = false;

  for (const i of items) {
    const cost = parseFloat(i.purchaseCostInput);
    if (!isNaN(cost) && cost > 0) {
      totalPurchaseValue += cost * i.quantityReceived;
    } else {
      hasUnknownCosts = true;
    }
  }

  const handleProceedToReview = () => {
    setErrorMsg(null);
    if (!selectedSupplierId) {
      setErrorMsg('Please select a supplier.');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Please add at least one product to receive stock.');
      return;
    }
    setStep('review');
  };

  const handleExecuteReceipt = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const recordItems = items.map((i) => {
        const cost = parseFloat(i.purchaseCostInput);
        return {
          shopInventoryItemId: i.item.id,
          quantityReceived: i.quantityReceived,
          purchaseCost: !isNaN(cost) && cost > 0 ? cost : undefined,
        };
      });

      const receipt = await recordStockReceipt({
        supplierId: selectedSupplierId,
        items: recordItems,
        notes,
      });

      router.replace({
        pathname: '/stock-receipt-details' as any,
        params: { receiptId: receipt.id },
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record stock receipt.');
      setIsSubmitting(false);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Receive Stock' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {step === 'builder' && (
          <>
            <PageHeader
              title="Record Incoming Stock"
              subtitle="Select supplier, add received products, enter sellable unit quantities and purchase costs."
            />

            {/* Supplier Picker Block */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.cardHeaderRow}>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  1. Select Supplier *
                </AppText>
                <Pressable onPress={() => router.push('/suppliers' as any)}>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    + Add Supplier
                  </AppText>
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two, paddingVertical: 4 }}>
                {suppliers.map((sup) => {
                  const active = selectedSupplierId === sup.id;
                  return (
                    <Pressable
                      key={sup.id}
                      style={[
                        styles.supplierChip,
                        {
                          backgroundColor: active ? '#2563EB' : theme.background,
                          borderColor: active ? '#2563EB' : '#9CA3AF44',
                        },
                      ]}
                      onPress={() => setSelectedSupplierId(sup.id)}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: active ? '#FFFFFF' : theme.text,
                          fontWeight: active ? '800' : '600',
                        }}
                      >
                        🏢 {sup.name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </ThemedView>

            {/* Add Products Block */}
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                2. Add Received Products
              </AppText>

              <View style={styles.searchRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[
                      styles.searchInput,
                      { color: theme.text, borderColor: theme.textSecondary, backgroundColor: theme.background },
                    ]}
                    placeholder="Search name, barcode..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <Pressable
                  style={[styles.scanBtn, { backgroundColor: '#2563EB' }]}
                  onPress={() => router.push('/scanner' as any)}
                >
                  <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                    📷 Scan
                  </AppText>
                </Pressable>
              </View>

              {/* Search Results Dropdown */}
              {searchQuery.trim().length > 0 && (
                <ThemedView type="backgroundElement" style={styles.searchResultsBox}>
                  {searchableInventory.length > 0 ? (
                    searchableInventory.map((inv) => (
                      <Pressable
                        key={inv.id}
                        style={[styles.resultItem, { borderBottomColor: '#9CA3AF22' }]}
                        onPress={() => handleAddProduct(inv)}
                      >
                        <View style={{ flex: 1 }}>
                          <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                            {inv.catalogProduct.name}
                          </AppText>
                          <AppText variant="caption" style={{ color: theme.textSecondary }}>
                            {inv.catalogProduct.brand} • {inv.catalogProduct.variant} • Current: {inv.stockQuantity}
                          </AppText>
                        </View>
                        <AppText variant="caption" style={{ fontWeight: '800', color: '#2563EB' }}>
                          + Receive
                        </AppText>
                      </Pressable>
                    ))
                  ) : (
                    <AppText variant="caption" style={{ color: theme.textSecondary, padding: Spacing.three, textAlign: 'center' }}>
                      No matching inventory items found.
                    </AppText>
                  )}
                </ThemedView>
              )}
            </ThemedView>

            {/* Added Received Items List */}
            <View style={{ gap: Spacing.three }}>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                Received Items ({items.length})
              </AppText>

              {items.length > 0 ? (
                items.map(({ item: inv, quantityReceived, purchaseCostInput }) => {
                  const unitLabel = getStockUnitLabel(inv.catalogProduct.category, inv.catalogProduct.variant, inv.catalogProduct.unit);
                  const parsedCost = parseFloat(purchaseCostInput);
                  const hasValidCost = !isNaN(parsedCost) && parsedCost > 0;
                  const itemTotalVal = hasValidCost ? parsedCost * quantityReceived : 0;

                  return (
                    <ThemedView key={inv.id} type="backgroundElement" style={[styles.itemCard, { borderColor: '#9CA3AF22' }]}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flex: 1 }}>
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                            {inv.catalogProduct.name}
                          </AppText>
                          <AppText variant="caption" style={{ color: theme.textSecondary }}>
                            {inv.catalogProduct.brand} • {inv.catalogProduct.variant}
                          </AppText>
                        </View>
                        <Pressable onPress={() => handleUpdateQty(inv.id, 0)}>
                          <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                            ✕ Remove
                          </AppText>
                        </Pressable>
                      </View>

                      {/* Pricing Distinction Banner */}
                      <View style={styles.priceDistinctionBadge}>
                        <AppText variant="caption" style={{ color: '#4B5563', fontSize: 11, fontWeight: '600' }}>
                          MRP ₹{inv.catalogProduct.mrp} • Selling Price ₹{inv.sellingPrice}
                        </AppText>
                      </View>

                      {/* Quantity & Purchase Cost Controls */}
                      <View style={styles.controlsRow}>
                        <View style={{ flex: 1, gap: 4 }}>
                          <AppText variant="caption" style={{ fontWeight: '700' }}>
                            Quantity Received ({unitLabel})
                          </AppText>
                          <View style={styles.qtyStepper}>
                            <Pressable style={styles.stepBtn} onPress={() => handleUpdateQty(inv.id, quantityReceived - 1)}>
                              <AppText variant="subtitle" style={{ fontWeight: '800' }}>-</AppText>
                            </Pressable>
                            <AppText variant="subtitle" style={{ fontWeight: '800', width: 40, textAlign: 'center' }}>
                              {quantityReceived}
                            </AppText>
                            <Pressable style={styles.stepBtn} onPress={() => handleUpdateQty(inv.id, quantityReceived + 1)}>
                              <AppText variant="subtitle" style={{ fontWeight: '800' }}>+</AppText>
                            </Pressable>
                          </View>
                        </View>

                        <View style={{ flex: 1, gap: 4 }}>
                          <AppText variant="caption" style={{ fontWeight: '700' }}>
                            Purchase Cost (₹/unit)
                          </AppText>
                          <TextInput
                            style={[styles.costInput, { color: theme.text, borderColor: theme.textSecondary }]}
                            placeholder="Optional (e.g. 210)"
                            placeholderTextColor={theme.textSecondary}
                            value={purchaseCostInput}
                            onChangeText={(val) => handleUpdateCost(inv.id, val)}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={styles.itemTotalRow}>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          Item Stock Impact: {inv.stockQuantity} → {inv.stockQuantity + quantityReceived} {unitLabel}
                        </AppText>
                        <AppText variant="subtitle" style={{ fontWeight: '800', color: hasValidCost ? '#10B981' : theme.textSecondary }}>
                          {hasValidCost ? `₹${itemTotalVal}` : 'Cost N/A'}
                        </AppText>
                      </View>
                    </ThemedView>
                  );
                })
              ) : (
                <ThemedView type="backgroundElement" style={styles.emptyCard}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    No products added yet. Search above or scan a barcode to add incoming stock.
                  </AppText>
                </ThemedView>
              )}
            </View>

            {/* Summary & Review Action */}
            {items.length > 0 && (
              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <View style={styles.summaryRow}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Total Units Received:
                  </AppText>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    {totalUnitsReceived} units ({totalProductsCount} products)
                  </AppText>
                </View>

                <View style={styles.summaryRow}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Total Purchase Value:
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                    {hasUnknownCosts && totalPurchaseValue === 0 ? 'Cost N/A' : `₹${totalPurchaseValue.toLocaleString('en-IN')}`}
                  </AppText>
                </View>

                {errorMsg && (
                  <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                    ⚠️ {errorMsg}
                  </AppText>
                )}

                <Button
                  title="Review Stock Receipt"
                  variant="primary"
                  onPress={handleProceedToReview}
                />
              </ThemedView>
            )}
          </>
        )}

        {/* STEP 2: REVIEW STOCK RECEIPT */}
        {step === 'review' && selectedSupplier && (
          <>
            <PageHeader
              title="Review Stock Receipt"
              subtitle="Confirm supplier, received quantities, purchase values, and stock transitions."
            />

            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.reviewHeaderRow}>
                <AppText variant="subtitle" style={{ color: theme.textSecondary }}>
                  Supplier:
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  🏢 {selectedSupplier.name} ({selectedSupplier.city})
                </AppText>
              </View>

              <View style={styles.divider} />

              {items.map(({ item: inv, quantityReceived, purchaseCostInput }) => {
                const parsedCost = parseFloat(purchaseCostInput);
                const hasCost = !isNaN(parsedCost) && parsedCost > 0;
                const totalItemVal = hasCost ? parsedCost * quantityReceived : 0;

                return (
                  <View key={inv.id} style={[styles.reviewRow, { borderBottomColor: '#9CA3AF22' }]}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                        {inv.catalogProduct.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        + {quantityReceived} units received ({inv.stockQuantity} → {inv.stockQuantity + quantityReceived})
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Cost: {hasCost ? `₹${parsedCost} / unit` : 'Not specified'}
                      </AppText>
                    </View>

                    <AppText variant="subtitle" style={{ fontWeight: '800', color: hasCost ? '#10B981' : theme.textSecondary }}>
                      {hasCost ? `₹${totalItemVal}` : 'Cost N/A'}
                    </AppText>
                  </View>
                );
              })}

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Total Purchase Value:
                </AppText>
                <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                  {hasUnknownCosts && totalPurchaseValue === 0 ? 'Cost N/A' : `₹${totalPurchaseValue.toLocaleString('en-IN')}`}
                </AppText>
              </View>

              <View style={{ marginTop: Spacing.two }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Receipt Notes (Optional)
                </AppText>
                <TextInput
                  style={[styles.searchInput, { color: theme.text, borderColor: theme.textSecondary, backgroundColor: theme.background, marginTop: 4 }]}
                  placeholder="e.g. Regular weekly stock shipment"
                  placeholderTextColor={theme.textSecondary}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {errorMsg && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {errorMsg}
                </AppText>
              )}

              <View style={styles.btnRow}>
                <View style={{ flex: 1 }}>
                  <Button title="Edit Receipt" variant="secondary" onPress={() => setStep('builder')} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={isSubmitting ? 'Receiving...' : 'Receive Stock'}
                    variant="primary"
                    onPress={handleExecuteReceipt}
                  />
                </View>
              </View>
            </ThemedView>
          </>
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
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supplierChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  scanBtn: {
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultsBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#9CA3AF44',
    maxHeight: 200,
  },
  resultItem: {
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  itemCard: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.two,
  },
  priceDistinctionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    marginTop: 4,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF44',
    borderRadius: 10,
    height: 40,
  },
  stepBtn: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costInput: {
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    paddingHorizontal: Spacing.two,
    fontSize: 14,
  },
  itemTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.one,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#9CA3AF22',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
