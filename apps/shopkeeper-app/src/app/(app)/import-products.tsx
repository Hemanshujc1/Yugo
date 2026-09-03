import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader, StatusBadge } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import type { ValidatedImportRow, ImportSummaryResult } from '@/types/inventory';

export default function ImportProductsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { parseExcelOrCsv, validateAndMatchRows, executeImport } = useProducts();

  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const [validatedRows, setValidatedRows] = useState<ValidatedImportRow[]>([]);
  const [importSummary, setImportSummary] = useState<ImportSummaryResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimulateFileSelect = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    // Mock CSV content representing a realistic supplier catalog spreadsheet
    const mockCsvContent = `Row,Product,Brand,Variant,Category,Barcode,MRP,SellingPrice,StockQuantity
1,Aashirvaad Atta 10kg,Aashirvaad,10 kg,Grocery,8901058000999,540,515,30
2,Tata Salt Lite,Tata,1 kg,Grocery,8901030899999,42,38,50
3,Fortune Mustard Oil 5L,Fortune,5 L,Grocery,8906007289999,780,740,15
4,Invalid Product No MRP,Generic,1 kg,Grocery,8901111111111,,20,10
5,Tata Salt,Tata,1 kg,Grocery,8901030895281,28,26,20`; // Row 5 is duplicate barcode

    try {
      const parsedRows = await parseExcelOrCsv(mockCsvContent);
      const validated = await validateAndMatchRows(parsedRows);
      setValidatedRows(validated);
      setStep('preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      const validOnly = validatedRows.filter((r) => r.status === 'valid' || r.status === 'needs_review');
      const summary = await executeImport(validOnly, 'Supplier_Master_Catalog.csv');
      setImportSummary(summary);
      setStep('complete');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to execute import.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validRows = validatedRows.filter((r) => r.status === 'valid');
  const reviewRows = validatedRows.filter((r) => r.status === 'needs_review');
  const invalidRows = validatedRows.filter((r) => r.status === 'invalid');

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Import Products' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Bulk Product Import"
          subtitle="Import master products and initial inventory levels from Excel or CSV spreadsheets."
        />

        {step === 'upload' && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Select Catalog Spreadsheet (.xlsx, .csv)
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Supported columns: Product Name, Brand, Variant/Pack Size, Category, Barcode, MRP, Selling Price, Stock.
            </AppText>

            {errorMsg && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {errorMsg}
              </AppText>
            )}

            <Button
              title={isProcessing ? 'Parsing File...' : '📁 Select & Parse Spreadsheet'}
              variant="primary"
              onPress={handleSimulateFileSelect}
            />
          </ThemedView>
        )}

        {step === 'preview' && (
          <View style={{ gap: Spacing.three }}>
            {/* STATS BREAKDOWN */}
            <ThemedView type="backgroundElement" style={styles.card}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                Import Validation Preview
              </AppText>

              <View style={styles.previewStatsGrid}>
                <View style={styles.statBox}>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                    {validRows.length}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    ✓ Valid
                  </AppText>
                </View>

                <View style={styles.statBox}>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#F59E0B' }}>
                    {reviewRows.length}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    ⚠️ Duplicates
                  </AppText>
                </View>

                <View style={styles.statBox}>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#DC2626' }}>
                    {invalidRows.length}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    ✕ Invalid
                  </AppText>
                </View>
              </View>
            </ThemedView>

            {/* ERROR REPORT LIST */}
            <SectionTitle title="Spreadsheet Issues & Warnings" />

            <View style={{ gap: Spacing.two }}>
              {validatedRows.map((row) => (
                <ThemedView
                  key={row.rowNumber}
                  type="backgroundElement"
                  style={[
                    styles.rowCard,
                    {
                      borderColor:
                        row.status === 'valid'
                          ? '#10B98144'
                          : row.status === 'needs_review'
                          ? '#F59E0B44'
                          : '#DC262644',
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AppText variant="caption" style={{ fontWeight: '800', color: theme.textSecondary }}>
                        Row {row.rowNumber}:
                      </AppText>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {row.raw.productName}
                      </AppText>
                    </View>
                    {row.validationErrors.length > 0 && (
                      <AppText variant="caption" style={{ color: '#DC2626', fontSize: 11, marginTop: 2 }}>
                        {row.validationErrors.join(' • ')}
                      </AppText>
                    )}
                  </View>

                  <StatusBadge
                    status={
                      row.status === 'valid'
                        ? 'Valid'
                        : row.status === 'needs_review'
                        ? 'Duplicate'
                        : 'Invalid'
                    }
                    size="sm"
                  />
                </ThemedView>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two }}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setStep('upload')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={isProcessing ? 'Importing...' : `Import (${validRows.length + reviewRows.length})`}
                  variant="primary"
                  onPress={handleConfirmImport}
                />
              </View>
            </View>
          </View>
        )}

        {step === 'complete' && importSummary && (
          <ThemedView type="backgroundElement" style={styles.card}>
            <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
              ✓ Bulk Import Completed Successfully
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Added {importSummary.addedCount} new catalog products. Updated {importSummary.updatedCount} shop inventory items.
            </AppText>

            <Button
              title="Return to Product Catalog"
              variant="primary"
              onPress={() => router.replace('/catalog' as any)}
            />
          </ThemedView>
        )}
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <AppText variant="subtitle" style={{ fontWeight: '800', marginTop: Spacing.two }}>
      {title}
    </AppText>
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
    borderWidth: 1,
    borderColor: '#9CA3AF22',
    gap: Spacing.three,
  },
  previewStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  rowCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
