import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';

import { AppText, Button, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import type { ValidatedImportRow, ImportSummaryResult } from '@/types/inventory';

export interface ExcelImportModalProps {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_CSV_CONTENT = `Product Name,Barcode,Brand,Variant,Category,MRP,Selling Price,Stock,Threshold
Tata Salt,8901030895281,Tata,1 kg,Staples,28,27,50,10
Aashirvaad Shuddh Chakki Atta,8901058000124,Aashirvaad,5 kg,Staples,320,310,20,5
Maggi 2-Minute Masala Noodles,8901058850385,Maggi,70 g,Snacks,14,14,100,20
Parle-G Glucose Biscuits,8901030000012,Parle,800 g,Snacks,80,75,40,10
Surf Excel Easy Wash Detergent Powder,8901030009127,Surf Excel,1 kg,Cleaning,140,135,15,5
Amul Taaza Toned Milk,8901262000108,Amul,1 L,Dairy,56,56,30,8
Colgate Strong Teeth Toothpaste,8901314000124,Colgate,200 g,Personal Care,115,110,25,5
Fortune Sunlite Sunflower Oil,8906007280014,Fortune,1 L,Staples,145,140,18,5
Britannia Good Day Cashew Biscuits,8901063001205,Britannia,600 g,Snacks,120,115,35,8
Nescafe Classic Instant Coffee,8901058000506,Nescafe,100 g,Beverages,320,310,12,5
Dettol Original Soap (3+1 Pack),8901396000120,Dettol,125 g,Personal Care,160,150,22,5
Harpic Power Plus Toilet Cleaner,8901396001257,Harpic,1 L,Cleaning,215,205,14,4
Kissan Fresh Tomato Ketchup,8901030011250,Kissan,950 g,Packaged Food,140,135,16,5
Britannia 100% Whole Wheat Bread,8901063005142,Britannia,400 g,Bakery,50,48,15,5
Catch Black Pepper Powder,8901192000508,Catch,100 g,Spices,120,115,10,3
Custom Local Bakery Cookies,8909990001122,Local Bakery,250 g,Bakery,80,75,12,4
Invalid Sample Item Without Name,,,,,,,`;

type Step = 'upload' | 'review' | 'result';

export function ExcelImportModal({ visible, onClose }: ExcelImportModalProps) {
  const theme = useTheme();
  const { parseExcelOrCsv, validateAndMatchRows, executeImport } = useProducts();

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('Store_Inventory_Batch.csv');
  const [validatedRows, setValidatedRows] = useState<ValidatedImportRow[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummaryResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessSampleFile = async () => {
    setIsProcessing(true);
    try {
      const parsedRows = await parseExcelOrCsv(SAMPLE_CSV_CONTENT);
      const validated = await validateAndMatchRows(parsedRows);
      setValidatedRows(validated);
      setFileName('Sample_Inventory_Template.csv');
      setStep('review');
    } catch (err) {
      console.error('Failed to parse file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleUserChoice = (rowNumber: number, choice: 'replace_stock' | 'add_stock' | 'skip') => {
    setValidatedRows((prev) =>
      prev.map((r) => (r.rowNumber === rowNumber ? { ...r, userChoice: choice } : r))
    );
  };

  const handleConfirmExecuteImport = async () => {
    setIsProcessing(true);
    try {
      const result = await executeImport(validatedRows, fileName);
      setImportSummary(result);
      setStep('result');
    } catch (err) {
      console.error('Import execution failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setValidatedRows([]);
    setImportSummary(null);
    onClose();
  };

  const validCount = validatedRows.filter((r) => r.status === 'valid').length;
  const reviewCount = validatedRows.filter((r) => r.status === 'needs_review').length;
  const invalidCount = validatedRows.filter((r) => r.status === 'invalid').length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleReset}>
      <View style={styles.modalOverlay}>
        <ThemedView type="backgroundElement" style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                Import Shop Inventory
              </AppText>

              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Multi-step Excel / CSV bulk product import wizard
              </AppText>
            </View>
            <Pressable onPress={handleReset} hitSlop={8}>
              <AppText variant="subtitle" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                ✕
              </AppText>
            </Pressable>
          </View>

          {/* STEP 1: UPLOAD & TEMPLATE */}
          {step === 'upload' && (
            <ScrollView contentContainerStyle={styles.stepContent}>
              <View style={styles.uploadBox}>
                <AppText variant="h2" style={{ fontSize: 32 }}>
                  📊
                </AppText>
                <AppText variant="subtitle" style={{ fontWeight: '700', textAlign: 'center' }}>
                  Upload Excel or CSV Spreadsheet
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                  Supported formats: .xlsx, .xls, .csv
                </AppText>

                <View style={{ marginTop: Spacing.two, width: '100%' }}>
                  <Button
                    title={isProcessing ? 'Processing File...' : 'Upload & Parse File'}
                    variant="primary"
                    onPress={handleProcessSampleFile}
                  />
                </View>
              </View>

              {/* Sample Template Section */}
              <View style={styles.templateCard}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  💡 Excel Template Format
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Expected Columns: Product Name*, Barcode, Brand, Variant, Category, MRP, Selling Price, Stock, Threshold.
                </AppText>

                <Button
                  title="Load Sample Retail Spreadsheet"
                  variant="secondary"
                  size="sm"
                  onPress={handleProcessSampleFile}
                />
              </View>
            </ScrollView>
          )}

          {/* STEP 2: REVIEW IMPORT ROWS */}
          {step === 'review' && (
            <View style={{ flex: 1, gap: Spacing.two }}>
              {/* Summary Stats Badges */}
              <View style={styles.badgeRow}>
                <View style={[styles.statChip, { backgroundColor: '#E6F4EA' }]}>
                  <AppText variant="caption" style={{ color: '#137333', fontWeight: '800' }}>
                    🟢 {validCount} Ready
                  </AppText>
                </View>

                <View style={[styles.statChip, { backgroundColor: '#FEF7E0' }]}>
                  <AppText variant="caption" style={{ color: '#B06000', fontWeight: '800' }}>
                    🟡 {reviewCount} Review
                  </AppText>
                </View>

                <View style={[styles.statChip, { backgroundColor: '#FEE2E2' }]}>
                  <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>
                    🔴 {invalidCount} Invalid
                  </AppText>
                </View>
              </View>

              {/* Rows List */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {validatedRows.map((row) => {
                  const isExisting = Boolean(row.existingInventoryItem);

                  return (
                    <View key={row.rowNumber} style={[styles.rowItemCard, { borderColor: '#9CA3AF22' }]}>
                      <View style={styles.rowHeader}>
                        <AppText variant="subtitle" style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>
                          Row {row.rowNumber}: {row.raw.productName || 'Unmapped Row'}
                        </AppText>

                        {row.status === 'valid' ? (
                          <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>
                            ✓ Matched
                          </AppText>
                        ) : row.status === 'needs_review' ? (
                          <AppText variant="caption" style={{ color: '#F59E0B', fontWeight: '700' }}>
                            ⚠️ Custom Item
                          </AppText>
                        ) : (
                          <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                            ✕ Invalid
                          </AppText>
                        )}
                      </View>

                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        Price: ₹{row.raw.sellingPrice || row.raw.mrp || 0} • Stock: {row.raw.stockQuantity || 0}
                        {Boolean(row.raw.barcode) ? ` • Barcode: ${row.raw.barcode}` : ''}
                      </AppText>

                      {row.matchedProduct && (
                        <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '600' }}>
                          Matched Catalog: {row.matchedProduct.name} ({row.matchedProduct.brand} {row.matchedProduct.variant})
                        </AppText>
                      )}

                      {/* Duplicate Stock Handling */}
                      {isExisting && (
                        <View style={styles.duplicateBox}>
                          <AppText variant="caption" style={{ color: '#6D28D9', fontWeight: '700' }}>
                            📦 Existing Item in Shop (Current Stock: {row.existingInventoryItem?.stockQuantity})
                          </AppText>

                          <View style={styles.choiceRow}>
                            <Pressable
                              style={[
                                styles.choiceBtn,
                                { backgroundColor: row.userChoice === 'replace_stock' ? '#2563EB' : '#E5E7EB' },
                              ]}
                              onPress={() => handleToggleUserChoice(row.rowNumber, 'replace_stock')}
                            >
                              <AppText
                                variant="caption"
                                style={{ color: row.userChoice === 'replace_stock' ? '#FFF' : '#374151', fontSize: 11 }}
                              >
                                Replace Stock ({row.raw.stockQuantity})
                              </AppText>
                            </Pressable>

                            <Pressable
                              style={[
                                styles.choiceBtn,
                                { backgroundColor: row.userChoice === 'add_stock' ? '#2563EB' : '#E5E7EB' },
                              ]}
                              onPress={() => handleToggleUserChoice(row.rowNumber, 'add_stock')}
                            >
                              <AppText
                                variant="caption"
                                style={{ color: row.userChoice === 'add_stock' ? '#FFF' : '#374151', fontSize: 11 }}
                              >
                                Add Stock (+{row.raw.stockQuantity})
                              </AppText>
                            </Pressable>

                            <Pressable
                              style={[
                                styles.choiceBtn,
                                { backgroundColor: row.userChoice === 'skip' ? '#DC2626' : '#E5E7EB' },
                              ]}
                              onPress={() => handleToggleUserChoice(row.rowNumber, 'skip')}
                            >
                              <AppText
                                variant="caption"
                                style={{ color: row.userChoice === 'skip' ? '#FFF' : '#374151', fontSize: 11 }}
                              >
                                Skip
                              </AppText>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <View style={{ gap: Spacing.two, marginTop: Spacing.one }}>
                <Button
                  title={isProcessing ? 'Importing Products...' : `Import ${validCount + reviewCount} Products`}
                  variant="primary"
                  onPress={handleConfirmExecuteImport}
                />
                <Button title="Back to Upload" variant="secondary" onPress={() => setStep('upload')} />
              </View>
            </View>
          )}

          {/* STEP 3: IMPORT RESULT */}
          {step === 'result' && importSummary && (
            <ScrollView contentContainerStyle={styles.stepContent}>
              <View style={styles.resultBox}>
                <AppText variant="h2" style={{ fontSize: 40, color: '#10B981' }}>
                  ✓
                </AppText>

                <AppText variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>
                  Inventory Successfully Imported!
                </AppText>

                <View style={styles.resultSummaryCard}>
                  <View style={styles.resultRow}>
                    <AppText variant="body" style={{ color: theme.textSecondary }}>
                      Total Processed
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      {importSummary.totalRows}
                    </AppText>
                  </View>

                  <View style={styles.resultRow}>
                    <AppText variant="body" style={{ color: '#10B981', fontWeight: '600' }}>
                      New Products Added
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                      +{importSummary.addedCount}
                    </AppText>
                  </View>

                  <View style={styles.resultRow}>
                    <AppText variant="body" style={{ color: '#2563EB', fontWeight: '600' }}>
                      Existing Stock Updated
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#2563EB' }}>
                      {importSummary.updatedCount}
                    </AppText>
                  </View>

                  <View style={styles.resultRow}>
                    <AppText variant="body" style={{ color: theme.textSecondary }}>
                      Skipped / Invalid
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: theme.textSecondary }}>
                      {importSummary.skippedCount + importSummary.invalidCount}
                    </AppText>
                  </View>
                </View>

                <View style={{ marginTop: Spacing.three, width: '100%', gap: Spacing.two }}>
                  <Button title="View Updated Inventory" variant="primary" onPress={handleReset} />
                </View>
              </View>
            </ScrollView>
          )}
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
    padding: Spacing.four,
    width: '100%',
    maxWidth: 480,
    height: '85%',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepContent: {
    gap: Spacing.four,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#2563EB55',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: Spacing.five,
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#2563EB08',
  },
  templateCard: {
    backgroundColor: '#9CA3AF15',
    padding: Spacing.four,
    borderRadius: 14,
    gap: Spacing.two,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statChip: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    alignItems: 'center',
  },
  rowItemCard: {
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duplicateBox: {
    backgroundColor: '#F3F4F6',
    padding: Spacing.two,
    borderRadius: 8,
    marginTop: 4,
    gap: 4,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: 2,
  },
  choiceBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resultBox: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.four,
  },
  resultSummaryCard: {
    backgroundColor: '#9CA3AF15',
    padding: Spacing.four,
    borderRadius: 16,
    width: '100%',
    gap: Spacing.two,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
