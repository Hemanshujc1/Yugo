import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { BarcodeScanner } from '@/components/inventory/barcode-scanner';

type ScanStatus = 'scanning' | 'not_found';

export default function ScannerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { findProductByBarcode } = useProducts();

  const [scanStatus, setScanStatus] = useState<ScanStatus>('scanning');
  const [scannedBarcode, setScannedBarcode] = useState<string>('');

  const handleBarcodeDetected = async (barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;
    setScannedBarcode(cleanBarcode);

    // Check if product exists in Master Catalog
    const catalogProd = await findProductByBarcode(cleanBarcode);

    if (catalogProd) {
      // Known barcode -> Navigate directly to Product Details
      router.replace({
        pathname: '/products/[id]' as any,
        params: { id: catalogProd.id },
      });
    } else {
      // Unknown barcode -> Show Product Not Found modal with prefilled Barcode option
      setScanStatus('not_found');
    }
  };

  const handleResetScan = () => {
    setScannedBarcode('');
    setScanStatus('scanning');
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Barcode Scanner' }} />

      <View style={styles.container}>
        <PageHeader
          title="Scan Product Barcode"
          subtitle="Point camera at product barcode to search catalog or onboard new item."
        />

        {scanStatus === 'scanning' ? (
          <View style={styles.scannerWrapper}>
            <BarcodeScanner onBarcodeDetected={handleBarcodeDetected} />
            <ThemedView type="backgroundElement" style={styles.scanInstructionBox}>
              <AppText variant="caption" style={{ fontWeight: '700', textAlign: 'center' }}>
                Center barcode within camera frame to detect
              </AppText>
            </ThemedView>
          </View>
        ) : (
          <ThemedView type="backgroundElement" style={styles.notFoundCard}>
            <View style={styles.iconCircleRed}>
              <AppText variant="h2">🔍</AppText>
            </View>

            <AppText variant="h3" style={{ fontWeight: '800', textAlign: 'center' }}>
              Product Not Found
            </AppText>

            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              No master catalog product exists for detected barcode:
            </AppText>

            <View style={styles.barcodeDisplayBox}>
              <AppText variant="subtitle" style={{ fontWeight: '800', letterSpacing: 1 }}>
                {scannedBarcode}
              </AppText>
            </View>

            <View style={{ gap: Spacing.two, width: '100%', marginTop: Spacing.two }}>
              <Button
                title="+ Add New Product"
                variant="primary"
                onPress={() =>
                  router.replace({
                    pathname: '/products/add' as any,
                    params: { barcode: scannedBarcode },
                  })
                }
              />

              <Button title="Scan Again" variant="secondary" onPress={handleResetScan} />
            </View>
          </ThemedView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  scannerWrapper: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  scanInstructionBox: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.four,
    right: Spacing.four,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  notFoundCard: {
    padding: Spacing.six,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DC262644',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconCircleRed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeDisplayBox: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    backgroundColor: '#9CA3AF15',
  },
});
