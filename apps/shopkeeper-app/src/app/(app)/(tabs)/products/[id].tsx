import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Alert, Switch, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { AppText, Screen, ThemedView, Button, StockStatusBadge } from '@/components';
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

export default function ProductDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { products, updateProduct, deleteProduct, updateStock, updateAvailability } = useProducts();

  const product = products.find((p) => p.id === productId);
  const scrollViewRef = useRef<ScrollView>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quick inline stock adjustment state
  const [directStockInput, setDirectStockInput] = useState(product ? product.stockQuantity.toString() : '');

  // Form Fields
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [discount, setDiscount] = useState(product?.discountPercentage?.toString() || '');
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity.toString() || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.lowStockThreshold?.toString() || '10');
  const [sku, setSku] = useState(product?.sku || '');
  const [barcode, setBarcode] = useState(product?.barcode || '');
  const [purchaseDate, setPurchaseDate] = useState(product?.purchaseDate || '');
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate || '');
  const [description, setDescription] = useState(product?.description || '');
  const [isAvailableForm, setIsAvailableForm] = useState(product?.isAvailable ?? true);

  const handleStartEditing = () => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(product.price.toString());
      setDiscount(product.discountPercentage?.toString() || '');
      setStockQuantity(product.stockQuantity.toString());
      setLowStockThreshold(product.lowStockThreshold?.toString() || '10');
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setPurchaseDate(product.purchaseDate || '');
      setExpiryDate(product.expiryDate || '');
      setDescription(product.description || '');
      setIsAvailableForm(product.isAvailable);
    }
    setIsEditing(true);
    // Scroll to the top of the form when edit begins
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, 50);
  };

  if (!product) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Product Not Found' }} />
        <ThemedView type="backgroundElement" style={styles.notFoundCard}>
          <AppText variant="h2">Product Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            The requested product (ID: {productId}) could not be located in your catalog.
          </AppText>
          <Button title="Back to Products" variant="primary" onPress={() => router.replace('/products')} />
        </ThemedView>
      </Screen>
    );
  }

  // Live Price Calculation in Edit Mode
  const currentPrice = parseFloat(price) || 0;
  const currentDiscount = discount ? parseFloat(discount) : 0;
  const finalPrice = calculateFinalPrice(currentPrice, currentDiscount);

  // Edit Form Validation
  const errors: FormErrors = {};
  if (!name.trim()) errors.name = 'Product name is required';
  if (!category.trim()) errors.category = 'Category is required';
  if (!price.trim()) {
    errors.price = 'Price is required';
  } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  if (discount.trim()) {
    const d = parseFloat(discount);
    if (isNaN(d) || d < 0 || d > 100) errors.discount = 'Discount must be between 0 and 100';
  }
  if (!stockQuantity.trim()) {
    errors.stockQuantity = 'Stock quantity is required';
  } else if (isNaN(parseInt(stockQuantity, 10)) || parseInt(stockQuantity, 10) < 0) {
    errors.stockQuantity = 'Stock must be 0 or greater';
  }

  const isValid = Object.keys(errors).length === 0;

  const handleAdjustStock = async (newStock: number) => {
    const safeStock = Math.max(0, newStock);
    setDirectStockInput(safeStock.toString());
    await updateStock(product.id, safeStock);
  };

  const handleToggleAvailability = async (newVal: boolean) => {
    await updateAvailability(product.id, newVal);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to permanently delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            await deleteProduct(product.id);
            setIsSaving(false);
            router.replace('/products');
          },
        },
      ]
    );
  };

  const handleSaveChanges = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);
    try {
      const parsedPrice = parseFloat(price) || 0;
      const parsedDiscount = discount ? parseFloat(discount) : undefined;
      const parsedStock = parseInt(stockQuantity, 10) || 0;
      const parsedThreshold = parseInt(lowStockThreshold, 10) || 0;

      await updateProduct(product.id, {
        name: name.trim(),
        category: category.trim(),
        price: parsedPrice,
        discountPercentage: parsedDiscount,
        stockQuantity: parsedStock,
        lowStockThreshold: parsedThreshold,
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
        description: description.trim() || undefined,
        isAvailable: isAvailableForm,
        availability: isAvailableForm,
      });

      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  // Stock status label
  const statusLabel =
    !product.isAvailable
      ? 'Unavailable'
      : product.stockQuantity === 0
        ? 'Out of stock'
        : product.stockQuantity <= (product.lowStockThreshold ?? 10)
          ? 'Low stock'
          : 'In Stock';

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: isEditing ? 'Edit Product' : 'Product Details' }} />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]}
        keyboardShouldPersistTaps="handled"
      >
        {!isEditing ? (
          /* ======================================================== */
          /* DETAILS VIEW                                             */
          /* ======================================================== */
          <ThemedView type="backgroundElement" style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <AppText variant="h2">{product.name}</AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>{product.category}</AppText>
              </View>
              <StockStatusBadge status={statusLabel} />
            </View>

            {/* Price Details Card */}
            <View style={[styles.detailsSection, styles.priceCard, { backgroundColor: theme.backgroundElement }]}>
              <View style={styles.row}>
                <AppText variant="caption">Final Selling Price</AppText>
                <AppText variant="h3" style={{ color: '#10B981', fontWeight: '800' }}>
                  ${(product.finalPrice !== undefined ? product.finalPrice : calculateFinalPrice(product.price, product.discountPercentage)).toFixed(2)}
                </AppText>
              </View>
              {product.discountPercentage !== undefined && product.discountPercentage > 0 && (
                <>
                  <View style={styles.row}>
                    <AppText variant="caption">Original Price</AppText>
                    <AppText variant="caption" style={styles.originalPriceText}>
                      ${product.price.toFixed(2)}
                    </AppText>
                  </View>
                  <View style={styles.row}>
                    <AppText variant="caption">Discount percentage</AppText>
                    <AppText variant="caption" style={{ color: '#EF4444', fontWeight: '700' }}>
                      {product.discountPercentage}% OFF
                    </AppText>
                  </View>
                </>
              )}
            </View>

            {/* Quick Actions Panel: Stock and Availability Toggle */}
            <View style={styles.detailsSection}>
              <AppText variant="subtitle" style={styles.sectionTitle}>Stock Management</AppText>
              
              <View style={styles.stockControls}>
                <Pressable
                  style={[styles.stockBtn, { backgroundColor: theme.backgroundElement }]}
                  onPress={() => handleAdjustStock(product.stockQuantity - 1)}
                >
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>−</AppText>
                </Pressable>
                
                <TextInput
                  style={[styles.stockInput, { color: theme.text, borderColor: theme.textSecondary }]}
                  keyboardType="number-pad"
                  value={directStockInput}
                  onChangeText={setDirectStockInput}
                  onBlur={() => {
                    const parsed = parseInt(directStockInput, 10);
                    if (!isNaN(parsed)) {
                      handleAdjustStock(parsed);
                    } else {
                      setDirectStockInput(product.stockQuantity.toString());
                    }
                  }}
                />

                <Pressable
                  style={[styles.stockBtn, { backgroundColor: theme.backgroundElement }]}
                  onPress={() => handleAdjustStock(product.stockQuantity + 1)}
                >
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>+</AppText>
                </Pressable>
              </View>
            </View>

            <View style={styles.detailsSection}>
              <View style={styles.availabilityToggle}>
                <View style={styles.switchLabelContainer}>
                  <AppText variant="subtitle">Availability Status</AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    {product.isAvailable ? 'Available and listed' : 'Unavailable and hidden'}
                  </AppText>
                </View>
                <View style={styles.switchWrapper}>
                  <Switch
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={product.isAvailable ? '#2563EB' : '#f4f3f4'}
                    onValueChange={handleToggleAvailability}
                    value={product.isAvailable}
                  />
                </View>
              </View>
            </View>

            {/* Details and Information Card */}
            <View style={styles.detailsSection}>
              <AppText variant="subtitle" style={styles.sectionTitle}>Product Details</AppText>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Product ID</AppText>
                  <AppText variant="caption">{product.id}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>SKU</AppText>
                  <AppText variant="caption">{product.sku || 'N/A'}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Barcode</AppText>
                  <AppText variant="caption">{product.barcode || 'N/A'}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Low Stock Alert Threshold</AppText>
                  <AppText variant="caption">{product.lowStockThreshold ?? 10} items</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Purchase Date</AppText>
                  <AppText variant="caption">{product.purchaseDate || 'N/A'}</AppText>
                </View>
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Expiry Date</AppText>
                  <AppText variant="caption">{product.expiryDate || 'N/A'}</AppText>
                </View>
                {product.description && (
                  <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: Spacing.one }]}>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>Description</AppText>
                    <AppText variant="body">{product.description}</AppText>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Last Updated</AppText>
                  <AppText variant="caption">{new Date(product.updatedAt).toLocaleDateString()}</AppText>
                </View>
              </View>
            </View>

            {/* Action Buttons: Responsive Equal-Flex Stack */}
            <View style={styles.actionColumn}>
              <View style={styles.actionRow}>
                <View style={styles.actionBtn}>
                  <Button
                    title="Edit Product"
                    variant="primary"
                    disabled={isSaving}
                    onPress={handleStartEditing}
                  />
                </View>
                <View style={styles.actionBtn}>
                  <Button
                    variant="danger"
                    title="Delete Product"
                    disabled={isSaving}
                    onPress={handleDelete}
                  />
                </View>
              </View>

              <Button
                variant="secondary"
                title="Back to Catalog"
                disabled={isSaving}
                onPress={() => router.replace('/products')}
              />
            </View>
          </ThemedView>
        ) : (
          /* ======================================================== */
          /* EDIT FORM VIEW                                           */
          /* ======================================================== */
          <ThemedView type="backgroundElement" style={styles.card}>
            <AppText variant="h2">Edit Product</AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
              Modify the fields below to update the catalog listing.
            </AppText>

            {/* Basic Info Section */}
            <View style={styles.sectionHeader}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>Basic Info</AppText>
            </View>

            <View style={styles.field}>
              <AppText variant="caption">Product Name *</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={name}
                onChangeText={setName}
              />
              {errors.name && <AppText style={styles.errorText}>{errors.name}</AppText>}
            </View>

            <View style={styles.field}>
              <AppText variant="caption">Category *</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
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
                keyboardType="decimal-pad"
                value={discount}
                onChangeText={setDiscount}
              />
              {errors.discount && <AppText style={styles.errorText}>{errors.discount}</AppText>}
            </View>

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
              <AppText variant="caption">Stock Quantity *</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
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
                keyboardType="number-pad"
                value={lowStockThreshold}
                onChangeText={setLowStockThreshold}
              />
            </View>

            {/* Additional Meta Section */}
            <View style={styles.sectionHeader}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>Additional Metadata</AppText>
            </View>

            <View style={styles.field}>
              <AppText variant="caption">SKU</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={sku}
                onChangeText={setSku}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="caption">Barcode</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={barcode}
                onChangeText={setBarcode}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="caption">Purchase Date (YYYY-MM-DD)</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="caption">Expiry Date (YYYY-MM-DD)</AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>

            <View style={styles.field}>
              <AppText variant="caption">Description</AppText>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.text, borderColor: theme.textSecondary }
                ]}
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
                  thumbColor={isAvailableForm ? '#2563EB' : '#f4f3f4'}
                  onValueChange={setIsAvailableForm}
                  value={isAvailableForm}
                />
              </View>
            </View>

            {/* Action Buttons: Responsive Equal-Flex Allocation */}
            <View style={styles.actionRow}>
              <View style={styles.actionBtn}>
                <Button
                  variant="secondary"
                  title="Cancel"
                  disabled={isSaving}
                  onPress={() => setIsEditing(false)}
                />
              </View>
              <View style={styles.actionBtn}>
                <Button
                  title={isSaving ? 'Saving...' : 'Save Changes'}
                  disabled={!isValid || isSaving}
                  onPress={handleSaveChanges}
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
  },
  card: {
    borderRadius: 20,
    padding: Spacing.five,
    gap: Spacing.four,
    width: '100%',
  },
  notFoundCard: {
    borderRadius: 20,
    padding: Spacing.six,
    gap: Spacing.three,
    alignItems: 'center',
    margin: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  titleContainer: {
    flex: 1,
  },
  detailsSection: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF22',
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  priceCard: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#9CA3AF22',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalPriceText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  stockControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  stockBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF44',
  },
  stockInput: {
    width: 72,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 16,
    fontWeight: 'bold',
  },
  availabilityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoGrid: {
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionColumn: {
    gap: Spacing.two,
    marginTop: Spacing.four,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
  },
});
