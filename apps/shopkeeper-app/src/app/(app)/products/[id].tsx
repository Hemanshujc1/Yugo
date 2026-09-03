import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { AppText, Screen, ThemedView, Button, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';

export default function ProductDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const {
    catalogProducts,
    shopInventory,
    updateCatalogProduct,
    deactivateCatalogProduct,
    addCatalogProductToShop,
  } = useProducts();

  const catalogProduct = catalogProducts.find((p) => p.id === productId);
  const shopInventoryItem = shopInventory.find(
    (inv) => inv.catalogProductId === productId || inv.catalogProduct?.id === productId
  );

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(catalogProduct?.name || '');
  const [editBrand, setEditBrand] = useState(catalogProduct?.brand || '');
  const [editCategory, setEditCategory] = useState(catalogProduct?.category || '');
  const [editMrp, setEditMrp] = useState(catalogProduct?.mrp.toString() || '');
  const [editBarcode, setEditBarcode] = useState(catalogProduct?.barcode || '');
  const [editPackSize, setEditPackSize] = useState(catalogProduct?.packSize || catalogProduct?.variant || '');
  const [editDescription, setEditDescription] = useState(catalogProduct?.description || '');
  const [editError, setEditError] = useState<string | null>(null);

  // Add to Shop Modal State
  const [isAddingToShop, setIsAddingToShop] = useState(false);
  const [sellingPrice, setSellingPrice] = useState(catalogProduct ? catalogProduct.mrp.toString() : '');
  const [stockQuantity, setStockQuantity] = useState('20');
  const [addError, setAddError] = useState<string | null>(null);

  if (!catalogProduct) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Product Details' }} />
        <View style={styles.errorContent}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Catalog product not found
          </AppText>
          <Button title="Back to Catalog" variant="primary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const handleStartEdit = () => {
    setEditName(catalogProduct.name);
    setEditBrand(catalogProduct.brand);
    setEditCategory(catalogProduct.category);
    setEditMrp(catalogProduct.mrp.toString());
    setEditBarcode(catalogProduct.barcode || '');
    setEditPackSize(catalogProduct.packSize || catalogProduct.variant || '');
    setEditDescription(catalogProduct.description || '');
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    setEditError(null);
    const mrpNum = parseFloat(editMrp);
    if (!editName.trim()) {
      setEditError('Product name is required.');
      return;
    }
    if (isNaN(mrpNum) || mrpNum <= 0) {
      setEditError('Valid MRP is required.');
      return;
    }

    try {
      await updateCatalogProduct(catalogProduct.id, {
        name: editName.trim(),
        brand: editBrand.trim() || 'Generic',
        category: editCategory.trim(),
        mrp: mrpNum,
        barcode: editBarcode.trim() || undefined,
        packSize: editPackSize.trim(),
        variant: editPackSize.trim(),
        description: editDescription.trim() || undefined,
      });
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update catalog product.');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateCatalogProduct(catalogProduct.id);
      router.back();
    } catch (err: any) {
      setEditError(err.message || 'Failed to deactivate product.');
    }
  };

  const handleConfirmAddToShop = async () => {
    setAddError(null);
    const priceNum = parseFloat(sellingPrice);
    const stockNum = parseInt(stockQuantity, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setAddError('Valid selling price in ₹ is required.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setAddError('Valid initial stock is required.');
      return;
    }

    try {
      await addCatalogProductToShop(catalogProduct.id, priceNum, stockNum, 5);
      setIsAddingToShop(false);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add to shop inventory.');
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: catalogProduct.name }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title={catalogProduct.name}
          subtitle={`Brand: ${catalogProduct.brand} • Category: ${catalogProduct.category}`}
          action={
            <Button title="Edit Master" variant="secondary" size="sm" onPress={handleStartEdit} />
          }
        />

        {/* MASTER CATALOG CARD */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <View style={styles.cardHeaderRow}>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Master Product Definition
            </AppText>
            <StatusBadge status={catalogProduct.isActive !== false ? 'Active' : 'Inactive'} size="sm" />
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Catalog MRP</AppText>
              <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                ₹{catalogProduct.mrp}
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                Manufacturer Ref
              </AppText>
            </View>

            <View style={styles.infoBox}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Pack Size</AppText>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                {catalogProduct.packSize || catalogProduct.variant || 'Standard'}
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                Unit Type: {catalogProduct.unitType || 'Packet'}
              </AppText>
            </View>
          </View>

          {catalogProduct.barcode && (
            <View style={styles.barcodeRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                Barcode: {catalogProduct.barcode}
              </AppText>
            </View>
          )}

          {catalogProduct.description && (
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {catalogProduct.description}
            </AppText>
          )}
        </ThemedView>

        {/* SHOP INVENTORY STATE CARD */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#2563EB44' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Shop Inventory Operational State
          </AppText>

          {shopInventoryItem ? (
            <View style={{ gap: Spacing.two }}>
              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Shop Selling Price</AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#2563EB' }}>
                    ₹{shopInventoryItem.sellingPrice}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                    Customer Price
                  </AppText>
                </View>

                <View style={styles.infoBox}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>Available Stock</AppText>
                  <AppText variant="h2" style={{ fontWeight: '800' }}>
                    {shopInventoryItem.stockQuantity} packets
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10 }}>
                    Sellable Units
                  </AppText>
                </View>
              </View>

              <Button
                title="View Shop Inventory Item →"
                variant="primary"
                onPress={() =>
                  router.push({
                    pathname: '/inventory-detail/[id]' as any,
                    params: { id: shopInventoryItem.id },
                  })
                }
              />
            </View>
          ) : (
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                This product is currently not added to your shop inventory.
              </AppText>

              <Button
                title="+ Add to Shop Inventory"
                variant="primary"
                onPress={() => {
                  setSellingPrice(catalogProduct.mrp.toString());
                  setStockQuantity('20');
                  setAddError(null);
                  setIsAddingToShop(true);
                }}
              />
            </View>
          )}
        </ThemedView>

        {/* DEACTIVATE ACTION */}
        {catalogProduct.isActive !== false && (
          <Pressable style={styles.deactivateBtn} onPress={handleDeactivate}>
            <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>
              Deactivate Product
            </AppText>
          </Pressable>
        )}
      </ScrollView>

      {/* Edit Master Product Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Edit Master Catalog Product
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.two }}>
              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>Product Name</AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>Brand Name</AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={editBrand}
                  onChangeText={setEditBrand}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ fontWeight: '700' }}>Catalog MRP (₹)</AppText>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                    value={editMrp}
                    onChangeText={setEditMrp}
                    keyboardType="numeric"
                  />
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 10, marginTop: 2 }}>
                    Does NOT change shop selling price
                  </AppText>
                </View>

                <View style={{ flex: 1 }}>
                  <AppText variant="caption" style={{ fontWeight: '700' }}>Pack Size</AppText>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                    value={editPackSize}
                    onChangeText={setEditPackSize}
                  />
                </View>
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>Barcode</AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={editBarcode}
                  onChangeText={setEditBarcode}
                  keyboardType="numeric"
                />
              </View>

              {editError && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {editError}
                </AppText>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save Changes" variant="primary" onPress={handleSaveEdit} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Add to Shop Inventory Modal */}
      <Modal visible={isAddingToShop} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Add to Shop Inventory
            </AppText>

            <View style={{ gap: Spacing.two }}>
              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>Shop Selling Price (₹) *</AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>Initial Stock (Packets) *</AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  keyboardType="numeric"
                />
              </View>

              {addError && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {addError}
                </AppText>
              )}
            </View>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setIsAddingToShop(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Confirm Add" variant="primary" onPress={handleConfirmAddToShop} />
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
    gap: Spacing.four,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  infoBox: {
    minWidth: '45%',
    flex: 1,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: '#9CA3AF15',
    gap: 2,
  },
  barcodeRow: {
    padding: Spacing.two,
    borderRadius: 10,
    backgroundColor: '#9CA3AF15',
  },
  deactivateBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
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
    gap: Spacing.three,
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
