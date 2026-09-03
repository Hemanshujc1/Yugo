import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';

import { AppText, Button, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string, barcodeType?: string) => void;
  onClose?: () => void;
  isPaused?: boolean;
}

const MOCK_BARCODE_PRESETS = [
  { label: 'Tata Salt 1kg', barcode: '8901030895281' },
  { label: 'Aashirvaad Atta 5kg', barcode: '8901058000124' },
  { label: 'Maggi Noodles 70g', barcode: '8901058850385' },
  { label: 'Colgate Toothpaste', barcode: '8901314000124' },
  { label: 'Unknown Barcode', barcode: '8901999999999' },
];

export function BarcodeScanner({
  onBarcodeDetected,
  onClose,
  isPaused = false,
}: BarcodeScannerProps) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const [enableTorch, setEnableTorch] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);

  const scannedRef = useRef(false);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scannedRef.current || isPaused || hasScanned) return;
    const barcodeStr = (result.data || '').trim();
    if (!barcodeStr) return;

    scannedRef.current = true;
    setHasScanned(true);
    onBarcodeDetected(barcodeStr, result.type);
  };

  const handleSimulateBarcode = (barcode: string) => {
    if (scannedRef.current || isPaused) return;
    scannedRef.current = true;
    setHasScanned(true);
    onBarcodeDetected(barcode.trim(), 'EAN_13_SIMULATED');
  };

  // 1. Permission Loading State
  if (!permission) {
    return (
      <ThemedView type="backgroundElement" style={styles.centerContainer}>
        <AppText variant="subtitle">Checking camera permissions...</AppText>
      </ThemedView>
    );
  }

  // 2. Permission Denied State
  if (!permission.granted) {
    return (
      <ThemedView type="backgroundElement" style={styles.permissionCard}>
        <AppText variant="h1" style={{ fontSize: 44, textAlign: 'center' }}>
          📷
        </AppText>
        <AppText variant="h3" style={{ fontWeight: '800', textAlign: 'center' }}>
          Camera Permission Required
        </AppText>
        <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          Yugo needs camera access to scan retail product barcodes.
        </AppText>

        {!permission.canAskAgain && (
          <AppText variant="caption" style={{ color: '#DC2626', textAlign: 'center', marginTop: 4 }}>
            Camera permission is disabled in your system settings. Please enable camera access for Yugo in your Android Settings.
          </AppText>
        )}

        <View style={styles.permBtnGroup}>
          {permission.canAskAgain && (
            <Button
              title="Allow Camera Access"
              variant="primary"
              onPress={requestPermission}
            />
          )}
          {onClose && (
            <Button
              title="Go Back"
              variant="secondary"
              onPress={onClose}
            />
          )}
        </View>
      </ThemedView>
    );
  }

  // 3. Camera Scanner Screen View
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={enableTorch}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
        }}
        onBarcodeScanned={hasScanned || isPaused ? undefined : handleBarcodeScanned}
      />

      {/* Overlay controls & Scan Target Reticle Frame */}
      <View style={styles.overlayContainer}>
        {/* Top Control Bar */}
        <View style={styles.topControlBar}>
          {onClose ? (
            <Pressable style={styles.iconCircleBtn} onPress={onClose} hitSlop={10}>
              <AppText variant="subtitle" style={{ color: '#FFFFFF', fontWeight: '800' }}>
                ✕
              </AppText>
            </Pressable>
          ) : (
            <View />
          )}

          <Pressable
            style={[
              styles.torchBtn,
              { backgroundColor: enableTorch ? '#2563EB' : 'rgba(0,0,0,0.6)' },
            ]}
            onPress={() => setEnableTorch((prev) => !prev)}
          >
            <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {enableTorch ? '💡 Flash ON' : '🔦 Flash OFF'}
            </AppText>
          </Pressable>
        </View>

        {/* Center Scanner Frame */}
        <View style={styles.targetFrameBox}>
          <View style={styles.targetFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <AppText variant="caption" style={styles.targetInstructions}>
            {hasScanned ? 'Barcode Detected!' : 'Place product barcode inside frame'}
          </AppText>
        </View>

        {/* Bottom Barcode Simulator Toggle (Ideal for Emulator / Web testing) */}
        <View style={styles.bottomBar}>
          <Pressable
            style={styles.simulatorToggleBtn}
            onPress={() => setShowSimulator((prev) => !prev)}
          >
            <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {showSimulator ? 'Hide Test Barcodes ▲' : '🧪 Test / Simulator Barcodes ▼'}
            </AppText>
          </Pressable>

          {showSimulator && (
            <View style={styles.simulatorContent}>
              <AppText variant="caption" style={{ color: '#E0E7FF', fontWeight: '600' }}>
                Tap preset barcode to simulate camera scan:
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
                {MOCK_BARCODE_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.barcode}
                    style={styles.presetChip}
                    onPress={() => handleSimulateBarcode(preset.barcode)}
                  >
                    <AppText variant="caption" style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 11 }}>
                      {preset.label}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.manualInputRow}>
                <TextInput
                  style={styles.manualInput}
                  placeholder="Enter barcode (e.g. 8901030895281)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={manualInput}
                  onChangeText={setManualInput}
                />
                <Button
                  title="Scan Code"
                  variant="primary"
                  size="sm"
                  onPress={() => {
                    if (manualInput.trim()) {
                      handleSimulateBarcode(manualInput);
                    }
                  }}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  permissionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.six,
    gap: Spacing.three,
  },
  permBtnGroup: {
    width: '100%',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 20,
  },
  targetFrameBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  targetFrame: {
    width: 260,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#2563EB',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  targetInstructions: {
    color: '#FFFFFF',
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bottomBar: {
    gap: Spacing.two,
  },
  simulatorToggleBtn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(37,99,235,0.85)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: 16,
  },
  simulatorContent: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  presetScroll: {
    gap: Spacing.two,
    paddingVertical: 4,
  },
  presetChip: {
    backgroundColor: '#374151',
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 10,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: Spacing.three,
    fontSize: 13,
  },
});
