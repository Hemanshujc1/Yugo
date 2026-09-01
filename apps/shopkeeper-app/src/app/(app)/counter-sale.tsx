import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { getStockUnitLabel } from '@/utils/stock-unit';
import type { ShopInventoryItem } from '@/types/inventory';

interface CartItem {
  item: ShopInventoryItem;
  quantity: number;
}

type Step = 'builder' | 'review' | 'success';

export default function CounterSaleScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { shopInventory, recordCounterSale } = useProducts();

  const [step, setStep] = useState<Step>('builder');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available shop inventory items matching search
  const searchableInventory = shopInventory.filter((inv) => {
    if (!inv.isAvailable) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return false; // Show search results when typed or browsing
    const cat = inv.catalogProduct;
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.brand.toLowerCase().includes(q) ||
      (cat.barcode && cat.barcode.includes(q))
    );
  });

  const handleAddToCart = (invItem: ShopInventoryItem) => {
    setErrorMsg(null);
    if (invItem.stockQuantity <= 0) {
      setErrorMsg(`Cannot add ${invItem.catalogProduct.name}. Out of stock.`);
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === invItem.id);
      if (idx !== -1) {
        const currentQty = prev[idx].quantity;
        if (currentQty >= invItem.stockQuantity) {
          setErrorMsg(`Insufficient stock for ${invItem.catalogProduct.name}. Only ${invItem.stockQuantity} available.`);
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...prev[idx], quantity: currentQty + 1 };
        return updated;
      }
      return [...prev, { item: invItem, quantity: 1 }];
    });
    setSearchQuery('');
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setErrorMsg(null);
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            if (newQty > c.item.stockQuantity) {
              setErrorMsg(`Insufficient stock. Only ${c.item.stockQuantity} available.`);
              return c;
            }
            return { ...c, quantity: newQty };
          }
          return c;
        })
        .filter((c) => c.quantity > 0);
    });
  };

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');

  const totalProductsCount = cart.length;
  const totalUnitsCount = cart.reduce((acc, c) => acc + c.quantity, 0);
  const totalAmount = cart.reduce((acc, c) => acc + c.item.sellingPrice * c.quantity, 0);

  const handleProceedToReview = () => {
    if (cart.length === 0) {
      setErrorMsg('Please add at least one product to record a counter sale.');
      return;
    }
    setErrorMsg(null);
    setStep('review');
  };

  const handleExecuteSale = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const itemsToRecord = cart.map((c) => ({
        shopInventoryItemId: c.item.id,
        quantity: c.quantity,
      }));
      await recordCounterSale(itemsToRecord, paymentMethod);
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record counter sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNewSale = () => {
    setCart([]);
    setSearchQuery('');
    setPaymentMethod('Cash');
    setErrorMsg(null);
    setStep('builder');
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Record Counter Sale' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1: SALE BUILDER */}
        {step === 'builder' && (
          <>
            <PageHeader
              title="Record Counter Sale"
              subtitle="Record products sold directly at your shop to keep inventory accurate."
            />

            {/* Product Search & Scanner Entry Row */}
            <View style={styles.searchRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.text, borderColor: theme.textSecondary, backgroundColor: theme.backgroundElement },
                  ]}
                  placeholder="Search item by Name, Brand, or Barcode..."
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
                  searchableInventory.map((inv) => {
                    const unit = getStockUnitLabel(inv.catalogProduct.category, inv.catalogProduct.variant, inv.catalogProduct.unit);
                    return (
                      <Pressable
                        key={inv.id}
                        style={[styles.resultItem, { borderBottomColor: '#9CA3AF22' }]}
                        onPress={() => handleAddToCart(inv)}
                      >
                        <View style={{ flex: 1 }}>
                          <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                            {inv.catalogProduct.name}
                          </AppText>
                          <AppText variant="caption" style={{ color: theme.textSecondary }}>
                            {inv.catalogProduct.brand} • {inv.catalogProduct.variant} • Selling Price: ₹{inv.sellingPrice}
                          </AppText>
                        </View>
                        <AppText
                          variant="caption"
                          style={{
                            fontWeight: '800',
                            color: inv.stockQuantity > 0 ? '#10B981' : '#DC2626',
                          }}
                        >
                          {inv.stockQuantity > 0 ? `+ Add (${inv.stockQuantity} ${unit})` : 'Out of stock'}
                        </AppText>
                      </Pressable>
                    );
                  })
                ) : (
                  <AppText variant="caption" style={{ color: theme.textSecondary, padding: Spacing.three, textAlign: 'center' }}>
                    No matching inventory items found.
                  </AppText>
                )}
              </ThemedView>
            )}

            {/* Current Sale Cart Items */}
            <View style={styles.cartSection}>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                Items in Sale ({cart.length})
              </AppText>

              {cart.length > 0 ? (
                cart.map(({ item: invItem, quantity }) => {
                  const cat = invItem.catalogProduct;
                  const unit = getStockUnitLabel(cat.category, cat.variant, cat.unit);
                  const subtotal = invItem.sellingPrice * quantity;

                  return (
                    <ThemedView key={invItem.id} type="backgroundElement" style={[styles.cartCard, { borderColor: '#9CA3AF22' }]}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                          {cat.name}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          ₹{invItem.sellingPrice} × {quantity} = <AppText variant="caption" style={{ fontWeight: '800', color: '#10B981' }}>₹{subtotal}</AppText>
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                          Available in shop: {invItem.stockQuantity} {unit}
                        </AppText>
                      </View>

                      {/* Quantity Stepper */}
                      <View style={styles.stepperRow}>
                        <Pressable
                          style={[styles.stepBtn, { backgroundColor: theme.background }]}
                          onPress={() => handleUpdateCartQty(invItem.id, -1)}
                        >
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                            -
                          </AppText>
                        </Pressable>

                        <AppText variant="subtitle" style={{ fontWeight: '800', minWidth: 24, textAlign: 'center' }}>
                          {quantity}
                        </AppText>

                        <Pressable
                          style={[styles.stepBtn, { backgroundColor: theme.background }]}
                          onPress={() => handleUpdateCartQty(invItem.id, 1)}
                        >
                          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                            +
                          </AppText>
                        </Pressable>
                      </View>
                    </ThemedView>
                  );
                })
              ) : (
                <ThemedView type="backgroundElement" style={styles.emptyCartBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                    No products added to sale yet. Search product or scan barcode above to add items.
                  </AppText>
                </ThemedView>
              )}
            </View>

            {/* Error Message */}
            {errorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {errorMsg}
              </AppText>
            )}

            {/* Running Summary Card */}
            {cart.length > 0 && (
              <ThemedView type="backgroundElement" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Total Products:
                  </AppText>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    {totalProductsCount} items ({totalUnitsCount} units)
                  </AppText>
                </View>

                {/* Payment Method Selector */}
                <View style={{ gap: 6, marginVertical: Spacing.one }}>
                  <AppText variant="caption" style={{ fontWeight: '700' }}>
                    Customer Payment Method
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                    {(['Cash', 'UPI', 'Card'] as const).map((method) => {
                      const active = paymentMethod === method;
                      return (
                        <Pressable
                          key={method}
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            borderRadius: 10,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: active ? '#2563EB' : '#9CA3AF44',
                            backgroundColor: active ? '#2563EB' : theme.background,
                          }}
                          onPress={() => setPaymentMethod(method)}
                        >
                          <AppText
                            variant="caption"
                            style={{
                              color: active ? '#FFFFFF' : theme.text,
                              fontWeight: active ? '800' : '600',
                            }}
                          >
                            {method === 'Cash' ? '💵 Cash' : method === 'UPI' ? '📱 UPI' : '💳 Card'}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Total Counter Sale Amount:
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                    ₹{totalAmount}
                  </AppText>
                </View>

                <Button
                  title="Review Sale"
                  variant="primary"
                  onPress={handleProceedToReview}
                />
              </ThemedView>
            )}
          </>
        )}

        {/* STEP 2: REVIEW SALE */}
        {step === 'review' && (
          <>
            <PageHeader
              title="Review Counter Sale"
              subtitle="Confirm items, payment method, and total amount before committing."
            />

            <ThemedView type="backgroundElement" style={styles.reviewCard}>
              {cart.map(({ item: invItem, quantity }) => {
                const subtotal = invItem.sellingPrice * quantity;
                return (
                  <View key={invItem.id} style={[styles.reviewRow, { borderBottomColor: '#9CA3AF22' }]}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                        {invItem.catalogProduct.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {quantity} packets × ₹{invItem.sellingPrice}
                      </AppText>
                    </View>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                      ₹{subtotal}
                    </AppText>
                  </View>
                );
              })}

              <View style={[styles.reviewRow, { borderBottomColor: '#9CA3AF22' }]}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Payment Method
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800', color: '#2563EB' }}>
                  {paymentMethod === 'Cash' ? '💵 Cash' : paymentMethod === 'UPI' ? '📱 UPI' : '💳 Card'}
                </AppText>
              </View>

              <View style={styles.reviewTotalRow}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Total Sale:
                </AppText>
                <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                  ₹{totalAmount}
                </AppText>
              </View>
            </ThemedView>

            {errorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {errorMsg}
              </AppText>
            )}

            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Edit Sale" variant="secondary" onPress={() => setStep('builder')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={isSubmitting ? 'Recording...' : 'Record Sale'}
                  variant="primary"
                  onPress={handleExecuteSale}
                />
              </View>
            </View>
          </>
        )}

        {/* STEP 3: SALE RECORDED SUCCESS */}
        {step === 'success' && (
          <View style={styles.successContainer}>
            <AppText variant="h1" style={{ fontSize: 56, color: '#10B981', textAlign: 'center' }}>
              ✓
            </AppText>
            <AppText variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>
              Counter Sale Recorded!
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              Inventory has been updated immediately across your shop database.
            </AppText>

            <View style={styles.successSummaryBox}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Total Recorded: ₹{totalAmount}
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                {totalProductsCount} products • {totalUnitsCount} sellable units deducted
              </AppText>
            </View>

            <View style={{ width: '100%', gap: Spacing.two, marginTop: Spacing.two }}>
              <Button title="Record Another Sale" variant="primary" onPress={handleResetForNewSale} />
              <Button
                title="Back to Inventory"
                variant="secondary"
                onPress={() => router.replace('/inventory')}
              />
            </View>
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
    gap: Spacing.four,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  searchInput: {
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
  },
  scanBtn: {
    paddingHorizontal: Spacing.three,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
    maxHeight: 220,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderBottomWidth: 1,
  },
  cartSection: {
    gap: Spacing.two,
  },
  cartCard: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCartBox: {
    padding: Spacing.five,
    borderRadius: 16,
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  summaryCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewCard: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.two,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  successContainer: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  successSummaryBox: {
    backgroundColor: '#9CA3AF15',
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
});
