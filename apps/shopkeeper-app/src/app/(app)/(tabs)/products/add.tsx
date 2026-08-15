import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Alert, Switch, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';

import { AppText, Screen, ThemedView } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { calculateFinalPrice } from '@/services/product-service';

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
  discount?: string;
  stockQuantity?: string;
  lowStockThreshold?: string;
  expiryDate?: string;
}

export default function AddProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { addProduct } = useProducts();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  // Live price calculation
  const currentPrice = parseFloat(price) || 0;
  const currentDiscount = discount ? parseFloat(discount) : 0;
  const finalPrice = calculateFinalPrice(currentPrice, currentDiscount);

  // Dynamic Validation
  const errors: FormErrors = {};

  if (!name.trim()) {
    errors.name = 'Product name is required';
  }

  if (!category.trim()) {
    errors.category = 'Category is required';
  }

  if (!price.trim()) {
    errors.price = 'Price is required';
  } else {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) {
      errors.price = 'Price must be a number greater than 0';
    }
  }

  if (discount.trim()) {
    const d = parseFloat(discount);
    if (isNaN(d) || d < 0 || d > 100) {
      errors.discount = 'Discount must be between 0 and 100';
    }
  }

  if (!stockQuantity.trim()) {
    errors.stockQuantity = 'Stock quantity is required';
  } else {
    const s = parseInt(stockQuantity, 10);
    if (isNaN(s) || s < 0) {
      errors.stockQuantity = 'Stock must be 0 or greater';
    }
  }

  if (!lowStockThreshold.trim()) {
    errors.lowStockThreshold = 'Low stock threshold is required';
  } else {
    const l = parseInt(lowStockThreshold, 10);
    if (isNaN(l) || l < 0) {
      errors.lowStockThreshold = 'Threshold must be 0 or greater';
    }
  }

  if (purchaseDate.trim() && expiryDate.trim()) {
    const pDate = new Date(purchaseDate);
    const eDate = new Date(expiryDate);
    if (!isNaN(pDate.getTime()) && !isNaN(eDate.getTime()) && eDate < pDate) {
      errors.expiryDate = 'Expiry date cannot be before purchase date';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  const handleSave = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      const parsedPrice = parseFloat(price) || 0;
      const parsedDiscount = discount ? parseFloat(discount) : undefined;
      const parsedStock = parseInt(stockQuantity, 10) || 0;
      const parsedThreshold = parseInt(lowStockThreshold, 10) || 0;

      await addProduct({
        name: name.trim(),
        category: category.trim(),
        images: [],
        price: parsedPrice,
        discountPercentage: parsedDiscount,
        stockQuantity: parsedStock,
        lowStockThreshold: parsedThreshold,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
        description: description.trim() || undefined,
        isAvailable,
        availability: isAvailable,
      });

      router.replace('/products');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Add Product' }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]} keyboardShouldPersistTaps="handled">
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h2">Add Product</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
            Fill in the details below to add a new catalog item.
          </AppText>

          {/* Basic Info Section */}
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>Basic Info</AppText>
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Product Name *</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. Fresh Apples"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
            {errors.name && <AppText style={styles.errorText}>{errors.name}</AppText>}
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Category *</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. Fruits"
              placeholderTextColor={theme.textSecondary}
              value={category}
              onChangeText={setCategory}
            />
            {errors.category && <AppText style={styles.errorText}>{errors.category}</AppText>}
          </View>

          {/* Pricing & Stock Section */}
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>Pricing & Stock</AppText>
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Price ($) *</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
            {errors.price && <AppText style={styles.errorText}>{errors.price}</AppText>}
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Discount (%)</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. 10 (optional)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              value={discount}
              onChangeText={setDiscount}
            />
            {errors.discount && <AppText style={styles.errorText}>{errors.discount}</AppText>}
          </View>

          {/* Live Discount Calculator */}
          {currentPrice > 0 && (
            <View style={[styles.calculatorCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.calcRow}>
                <AppText variant="caption">Original Price:</AppText>
                <AppText variant="caption" style={{ fontWeight: '600' }}>${currentPrice.toFixed(2)}</AppText>
              </View>
              {currentDiscount > 0 && (
                <View style={styles.calcRow}>
                  <AppText variant="caption">Discount ({currentDiscount}%):</AppText>
                  <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '600' }}>
                    -${(currentPrice - finalPrice).toFixed(2)}
                  </AppText>
                </View>
              )}
              <View style={[styles.calcRow, styles.calcTotalRow]}>
                <AppText variant="subtitle">Final Price:</AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                  ${finalPrice.toFixed(2)}
                </AppText>
              </View>
            </View>
          )}

          <View style={styles.field}>
            <AppText variant="caption">Initial Stock Quantity *</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={stockQuantity}
              onChangeText={setStockQuantity}
            />
            {errors.stockQuantity && <AppText style={styles.errorText}>{errors.stockQuantity}</AppText>}
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Low Stock Threshold *</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
            />
            {errors.lowStockThreshold && <AppText style={styles.errorText}>{errors.lowStockThreshold}</AppText>}
          </View>

          {/* Additional Meta Section */}
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>Additional Metadata</AppText>
          </View>

          <View style={styles.field}>
            <AppText variant="caption">SKU (Stock Keeping Unit)</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. SKU-FR-001"
              placeholderTextColor={theme.textSecondary}
              value={sku}
              onChangeText={setSku}
            />
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Barcode</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. 8901234567890"
              placeholderTextColor={theme.textSecondary}
              value={barcode}
              onChangeText={setBarcode}
            />
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Purchase Date (YYYY-MM-DD)</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. 2026-08-15"
              placeholderTextColor={theme.textSecondary}
              value={purchaseDate}
              onChangeText={setPurchaseDate}
            />
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Expiry Date (YYYY-MM-DD)</AppText>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
              placeholder="e.g. 2027-08-15"
              placeholderTextColor={theme.textSecondary}
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
            {errors.expiryDate && <AppText style={styles.errorText}>{errors.expiryDate}</AppText>}
          </View>

          <View style={styles.field}>
            <AppText variant="caption">Description</AppText>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { color: theme.text, borderColor: theme.textSecondary }
              ]}
              placeholder="Enter product description..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.switchField}>
            <View style={styles.switchLabelContainer}>
              <AppText variant="subtitle">Available to Customers</AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Toggle listing visibility in product catalog
              </AppText>
            </View>
            <View style={styles.switchWrapper}>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isAvailable ? '#2563EB' : '#f4f3f4'}
                onValueChange={setIsAvailable}
                value={isAvailable}
              />
            </View>
          </View>

          {/* Equal Sized Responsive Action Buttons */}
          <View style={styles.actionRow}>
            <View style={styles.actionBtn}>
              <Pressable
                style={styles.cancelBtn}
                disabled={isSaving}
                onPress={() => router.replace('/products')}
              >
                <AppText style={styles.cancelBtnText}>Cancel</AppText>
              </Pressable>
            </View>

            <View style={styles.actionBtn}>
              <Pressable
                disabled={!isValid || isSaving}
                style={[
                  styles.saveBtn,
                  { opacity: !isValid || isSaving ? 0.5 : 1 }
                ]}
                onPress={handleSave}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <AppText style={styles.saveBtnText}>Save Product</AppText>
                )}
              </Pressable>
            </View>
          </View>
        </ThemedView>
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
  },
  card: {
    borderRadius: 20,
    padding: Spacing.five,
    gap: Spacing.four,
    width: '100%',
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF44',
    paddingBottom: Spacing.one,
    marginTop: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    width: '100%',
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: Spacing.two,
  },
  switchWrapper: {
    flexShrink: 0,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    backgroundColor: 'transparent',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    paddingLeft: Spacing.one,
  },
  calculatorCard: {
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: '#9CA3AF22',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF44',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.four,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
  cancelBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
