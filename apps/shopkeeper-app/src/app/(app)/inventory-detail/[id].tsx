import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, StockStatusBadge, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { getStockUnitLabel } from '@/utils/stock-unit';
import { StockAdjustmentModal } from '@/components/inventory/stock-adjustment-modal';

export default function InventoryDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { shopInventory, updateShopInventoryItem } = useProducts();

  const [editPriceModal, setEditPriceModal] = useState(false);
  const [editStockModal, setEditStockModal] = useState(false);
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newThreshold, setNewThreshold] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const item = shopInventory.find((i) => i.id === params.id || i.catalogProductId === params.id);

  if (!item) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Inventory Item' }} />
        <View style={styles.errorCenter}>
          <AppText variant="h3" style={{ fontWeight: '700' }}>
            Item Not Found
          </AppText>
          <Button title="Back to Inventory" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

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

  const handleSaveSellingPrice = async () => {
    const priceNum = parseFloat(newSellingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Please enter a valid selling price in ₹.');
      return;
    }
    setErrorMsg(null);
    try {
      await updateShopInventoryItem(item.id, { sellingPrice: priceNum });
      setEditPriceModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update selling price.');
    }
  };

  const handleToggleAvailability = async (val: boolean) => {
    try {
      await updateShopInventoryItem(item.id, { isAvailable: val });
    } catch (err: any) {
      console.error('Failed to toggle availability:', err);
    }
  };

  const handleSaveThreshold = async () => {
    const threshNum = parseInt(newThreshold, 10);
    if (isNaN(threshNum) || threshNum < 0) return;
    try {
      await updateShopInventoryItem(item.id, { lowStockThreshold: threshNum });
    } catch (err: any) {
      console.error('Failed to update threshold:', err);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: cat.name }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title={cat.name}
          subtitle={`Brand: ${cat.brand} • Pack size: ${cat.variant}`}
          action={<StockStatusBadge status={status} />}
        />

        {/* Product Details Section Card */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            Product Catalog Information
          </AppText>
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Global Yugo MRP
              </AppText>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                ₹{cat.mrp}
              </AppText>
            </View>

            <View style={styles.infoCol}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Category
              </AppText>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                {cat.category}
              </AppText>
            </View>

            {Boolean(cat.barcode) && (
              <View style={styles.infoCol}>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Barcode
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  {cat.barcode}
                </AppText>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Shop Pricing & Stock Card */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            Shop Stock & Pricing Config
          </AppText>

          <View style={styles.detailRow}>
            <View>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Shop Selling Price
              </AppText>
              <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                ₹{item.sellingPrice}
              </AppText>
            </View>
            <Button
              title="Edit Price"
              variant="secondary"
              size="sm"
              onPress={() => {
                setNewSellingPrice(item.sellingPrice.toString());
                setErrorMsg(null);
                setEditPriceModal(true);
              }}
            />
          </View>

          <View style={styles.detailRow}>
            <View>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Current Stock Level
              </AppText>
              <AppText variant="h2" style={{ fontWeight: '800' }}>
                {item.stockQuantity} {unit}
              </AppText>
            </View>
            <Button
              title="Adjust Stock"
              variant="primary"
              size="sm"
              onPress={() => setEditStockModal(true)}
            />
          </View>

          <View style={styles.detailRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Customer Availability
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                {item.isAvailable
                  ? 'Product is enabled for online customer ordering.'
                  : 'Product is disabled for online customer ordering.'}
              </AppText>
            </View>
            <Switch
              value={item.isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>
        </ThemedView>

        {/* Threshold Card */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="subtitle" style={{ fontWeight: '800' }}>
            Low Stock Threshold Configuration
          </AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            Alerts will trigger when stock falls below or equal to this threshold.
          </AppText>

          <View style={styles.thresholdRow}>
            <TextInput
              style={[styles.input, { flex: 1, color: theme.text, borderColor: theme.textSecondary }]}
              keyboardType="numeric"
              defaultValue={item.lowStockThreshold.toString()}
              onChangeText={setNewThreshold}
            />
            <Button title="Save Threshold" variant="secondary" size="sm" onPress={handleSaveThreshold} />
          </View>
        </ThemedView>
      </ScrollView>

      {/* Edit Selling Price Modal */}
      <Modal visible={editPriceModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.dialogCard}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Edit Selling Price
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Catalog MRP: ₹{cat.mrp} • Current Selling Price: ₹{item.sellingPrice}
            </AppText>

            <View style={{ gap: 4, marginTop: Spacing.two }}>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                New Selling Price (₹)
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                keyboardType="numeric"
                value={newSellingPrice}
                onChangeText={setNewSellingPrice}
              />
            </View>

            {errorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {errorMsg}
              </AppText>
            )}

            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setEditPriceModal(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save Price" variant="primary" onPress={handleSaveSellingPrice} />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        visible={editStockModal}
        item={item}
        onClose={() => setEditStockModal(false)}
      />
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
  errorCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF22',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  infoCol: {
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  dialogCard: {
    borderRadius: 20,
    padding: Spacing.five,
    width: '100%',
    maxWidth: 380,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
