import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';

export default function AddProductScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialBarcode = typeof params.barcode === 'string' ? params.barcode : '';

  const { createCatalogProduct, addCatalogProductToShop } = useProducts();

  // Master Catalog Form Fields
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [subcategory] = useState('');
  const [barcode, setBarcode] = useState(initialBarcode);
  const [unitType, setUnitType] = useState('Packet');
  const [packSize, setPackSize] = useState('1 kg');
  const [mrp, setMrp] = useState('');
  const [description, setDescription] = useState('');

  // Shop Inventory Option
  const [addToInventoryNow, setAddToInventoryNow] = useState(true);
  const [sellingPrice, setSellingPrice] = useState('');
  const [initialStock, setInitialStock] = useState('20');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
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

  const unitTypes = [
    'Packet',
    'Pack',
    'Bottle',
    'Box',
    'Piece',
    'Bar',
    'Can',
    'Jar',
    'Tube',
    'Other',
  ];

  const handleSaveProduct = async () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!category.trim()) {
      setFormError('Category is required.');
      return;
    }
    const mrpNum = parseFloat(mrp);
    if (isNaN(mrpNum) || mrpNum <= 0) {
      setFormError('Please enter a valid MRP in ₹.');
      return;
    }

    let sellPriceNum = mrpNum;
    let stockNum = 20;

    if (addToInventoryNow) {
      sellPriceNum = sellingPrice ? parseFloat(sellingPrice) : mrpNum;
      if (isNaN(sellPriceNum) || sellPriceNum <= 0) {
        setFormError('Please enter a valid Shop Selling Price in ₹.');
        return;
      }
      stockNum = parseInt(initialStock, 10);
      if (isNaN(stockNum) || stockNum < 0) {
        setFormError('Please enter a valid initial stock quantity.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Create Master Catalog Product
      const newCatProd = await createCatalogProduct({
        name: name.trim(),
        brand: brand.trim() || 'Generic',
        category: category.trim(),
        subcategory: subcategory.trim() || undefined,
        unitType,
        packSize: packSize.trim() || 'Standard',
        barcode: barcode.trim() || undefined,
        mrp: mrpNum,
        description: description.trim() || undefined,
      });

      // 2. Optionally Add to Shop Inventory
      if (addToInventoryNow) {
        await addCatalogProductToShop(newCatProd.id, sellPriceNum, stockNum, 5);
      }

      router.replace('/catalog' as any);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Add Product' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="Add New Product"
            subtitle="Create a new Master Catalog product definition and optionally add it to shop inventory."
          />

          {/* MASTER CATALOG DETAILS FORM */}
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Master Product Metadata
            </AppText>

            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Product Name *
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="e.g. Aashirvaad Chakki Atta"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Brand Name
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. Aashirvaad"
                  placeholderTextColor={theme.textSecondary}
                  value={brand}
                  onChangeText={setBrand}
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Pack Size (e.g. 5 kg)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. 5 kg / 1 L"
                  placeholderTextColor={theme.textSecondary}
                  value={packSize}
                  onChangeText={setPackSize}
                />
              </View>
            </View>

            {/* Category Selector */}
            <View>
              <AppText variant="caption" style={{ fontWeight: '700', marginBottom: 4 }}>
                Category *
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one }}>
                {categories.map((cat) => {
                  const active = category === cat;
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
                      onPress={() => setCategory(cat)}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: active ? '#FFFFFF' : theme.text,
                          fontWeight: active ? '700' : '500',
                          fontSize: 11,
                        }}
                      >
                        {cat}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Unit Type Selector */}
            <View>
              <AppText variant="caption" style={{ fontWeight: '700', marginBottom: 4 }}>
                Unit Type *
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.one }}>
                {unitTypes.map((ut) => {
                  const active = unitType === ut;
                  return (
                    <Pressable
                      key={ut}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: active ? '#2563EB' : theme.background,
                          borderColor: active ? '#2563EB' : '#9CA3AF44',
                        },
                      ]}
                      onPress={() => setUnitType(ut)}
                    >
                      <AppText
                        variant="caption"
                        style={{
                          color: active ? '#FFFFFF' : theme.text,
                          fontWeight: active ? '700' : '500',
                          fontSize: 11,
                        }}
                      >
                        {ut}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Catalog MRP (₹) *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="250"
                  placeholderTextColor={theme.textSecondary}
                  value={mrp}
                  onChangeText={(val) => {
                    setMrp(val);
                    if (!sellingPrice) setSellingPrice(val);
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Barcode (Optional)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. 8901058000124"
                  placeholderTextColor={theme.textSecondary}
                  value={barcode}
                  onChangeText={setBarcode}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Description (Optional)
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, height: 60 }]}
                placeholder="Product description or details..."
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
          </ThemedView>

          {/* SHOP INVENTORY OPTIONS */}
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  Add to Shop Inventory Now
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Immediately make product sellable at your shop
                </AppText>
              </View>

              <Switch
                value={addToInventoryNow}
                onValueChange={setAddToInventoryNow}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {addToInventoryNow && (
              <View style={{ gap: Spacing.two, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" style={{ fontWeight: '700' }}>
                      Shop Selling Price (₹) *
                    </AppText>
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                      placeholder={mrp || '235'}
                      placeholderTextColor={theme.textSecondary}
                      value={sellingPrice}
                      onChangeText={setSellingPrice}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" style={{ fontWeight: '700' }}>
                      Initial Stock Quantity *
                    </AppText>
                    <TextInput
                      style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                      placeholder="20"
                      placeholderTextColor={theme.textSecondary}
                      value={initialStock}
                      onChangeText={setInitialStock}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}
          </ThemedView>

          {formError && (
            <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
              ⚠️ {formError}
            </AppText>
          )}

          <Button
            title={isSubmitting ? 'Creating Product...' : 'Create Product'}
            variant="primary"
            onPress={handleSaveProduct}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    marginTop: 4,
    fontSize: 14,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
