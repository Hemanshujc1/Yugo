import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';

import { AppText, Button, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { getStockUnitLabel } from '@/utils/stock-unit';
import type { ShopInventoryItem, StockMovementReason } from '@/types/inventory';

export interface StockAdjustmentModalProps {
  visible: boolean;
  item: ShopInventoryItem | null;
  onClose: () => void;
}

const REASONS: StockMovementReason[] = [
  'Offline sale',
  'Stock received',
  'Damaged',
  'Expired',
  'Returned',
  'Stock correction',
  'Other',
];

export function StockAdjustmentModal({ visible, item, onClose }: StockAdjustmentModalProps) {
  const theme = useTheme();
  const { adjustStock } = useProducts();

  const [mode, setMode] = useState<'set' | 'adjust'>('set');
  const [valInput, setValInput] = useState('');
  const [selectedReason, setSelectedReason] = useState<StockMovementReason>('Stock correction');
  const [customReason, setCustomReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevItemId, setPrevItemId] = useState<string | null>(null);

  if (item && item.id !== prevItemId) {
    setPrevItemId(item.id);
    setMode('set');
    setValInput(item.stockQuantity.toString());
    setSelectedReason('Stock correction');
    setCustomReason('');
    setErrorMsg(null);
  }

  if (!item) return null;

  const cat = item.catalogProduct;
  const unit = getStockUnitLabel(cat.category, cat.variant, cat.unit);
  const currentQty = item.stockQuantity;

  // Calculate target quantity preview
  let targetQty = currentQty;
  const num = parseInt(valInput, 10);
  if (!isNaN(num)) {
    targetQty = mode === 'set' ? Math.max(0, num) : Math.max(0, currentQty + num);
  }

  const handleSave = async () => {
    if (isNaN(num)) {
      setErrorMsg('Please enter a valid number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const finalReason = selectedReason === 'Other' && customReason.trim() ? customReason.trim() : selectedReason;
      await adjustStock(item.id, {
        mode,
        value: num,
        reason: finalReason,
        source: 'MANUAL_ADJUSTMENT',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to adjust stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ThemedView type="backgroundElement" style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardContent}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="h3" style={{ fontWeight: '800' }}>
                  Update Stock
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '700', color: '#2563EB', marginTop: 2 }}>
                  {cat.name}
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Pack size: {cat.variant} • Current stock: <AppText variant="caption" style={{ fontWeight: '800' }}>{currentQty} {unit}</AppText>
                </AppText>
              </View>

              <Pressable onPress={onClose} hitSlop={8}>
                <AppText variant="subtitle" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                  ✕
                </AppText>
              </Pressable>
            </View>

            {/* Mode Switcher Tabs */}
            <View style={[styles.tabSegment, { backgroundColor: theme.background }]}>
              <Pressable
                style={[
                  styles.tabBtn,
                  { backgroundColor: mode === 'set' ? '#2563EB' : 'transparent' },
                ]}
                onPress={() => {
                  setMode('set');
                  setValInput(currentQty.toString());
                  setErrorMsg(null);
                }}
              >
                <AppText
                  variant="caption"
                  style={{ color: mode === 'set' ? '#FFFFFF' : theme.text, fontWeight: '700' }}
                >
                  Set Quantity
                </AppText>
              </Pressable>

              <Pressable
                style={[
                  styles.tabBtn,
                  { backgroundColor: mode === 'adjust' ? '#2563EB' : 'transparent' },
                ]}
                onPress={() => {
                  setMode('adjust');
                  setValInput('+5');
                  setErrorMsg(null);
                }}
              >
                <AppText
                  variant="caption"
                  style={{ color: mode === 'adjust' ? '#FFFFFF' : theme.text, fontWeight: '700' }}
                >
                  Adjust Quantity
                </AppText>
              </Pressable>
            </View>

            {/* Input Form */}
            {mode === 'set' ? (
              <View style={styles.inputGroup}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  New quantity ({unit})
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  keyboardType="numeric"
                  value={valInput}
                  onChangeText={setValInput}
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Adjustment (+ or - {unit})
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  keyboardType="numbers-and-punctuation"
                  placeholder="e.g. +5 or -2"
                  placeholderTextColor={theme.textSecondary}
                  value={valInput}
                  onChangeText={setValInput}
                />
              </View>
            )}

            {/* Reason Selection */}
            <View style={styles.reasonSection}>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Reason for update
              </AppText>

              <View style={styles.reasonChipsGrid}>
                {REASONS.map((r) => {
                  const active = selectedReason === r;
                  return (
                    <Pressable
                      key={r}
                      style={[
                        styles.reasonChip,
                        {
                          backgroundColor: active ? '#2563EB' : theme.background,
                          borderColor: active ? '#2563EB' : '#9CA3AF44',
                        },
                      ]}
                      onPress={() => setSelectedReason(r)}
                    >
                      <AppText
                        variant="caption"
                        style={{ color: active ? '#FFFFFF' : theme.text, fontSize: 12, fontWeight: active ? '700' : '500' }}
                      >
                        {r}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              {selectedReason === 'Other' && (
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, marginTop: Spacing.one }]}
                  placeholder="Specify reason..."
                  placeholderTextColor={theme.textSecondary}
                  value={customReason}
                  onChangeText={setCustomReason}
                />
              )}
            </View>

            {/* Preview Banner */}
            <View style={styles.previewBox}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Stock Transition:
              </AppText>
              <AppText variant="subtitle" style={{ fontWeight: '800', color: '#2563EB' }}>
                {currentQty} → {targetQty} {unit}
              </AppText>
            </View>

            {errorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {errorMsg}
              </AppText>
            )}

            {/* Action Buttons */}
            <View style={styles.btnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={onClose} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={isSubmitting ? 'Saving...' : 'Save Adjustment'}
                  variant="primary"
                  onPress={handleSave}
                />
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  cardContent: {
    padding: Spacing.five,
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tabSegment: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  inputGroup: {
    gap: 4,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: '700',
  },
  reasonSection: {
    gap: Spacing.two,
  },
  reasonChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  reasonChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewBox: {
    backgroundColor: '#2563EB10',
    padding: Spacing.three,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
