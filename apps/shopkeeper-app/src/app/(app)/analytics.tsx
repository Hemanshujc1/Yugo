import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { analyticsService } from '@/services/analytics-service';
import { reportExportService } from '@/services/report-export-service';
import { AnalyticsDateRange, FullAnalyticsReport, ComparisonMetric } from '@/types/analytics';
import { formatCurrencyINR } from '@/utils';

function TrendIndicator({ metric }: { metric: ComparisonMetric }) {
  const isDown = metric.trend === 'down';
  const isUp = metric.trend === 'up';
  const isNew = metric.trend === 'new';

  const bgColor = isUp ? '#E6F4EA' : isDown ? '#FEE2E2' : isNew ? '#EFF6FF' : '#F3F4F6';
  const textColor = isUp ? '#10B981' : isDown ? '#DC2626' : isNew ? '#2563EB' : '#4B5563';

  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 }}>
      <AppText variant="caption" style={{ color: textColor, fontWeight: '700', fontSize: 11 }}>
        {metric.formattedChange || '0%'}
      </AppText>
    </View>
  );
}

export default function AnalyticsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('7days');
  const [report, setReport] = useState<FullAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [csvPreview, setCsvPreview] = useState('');

  useEffect(() => {
    let isMounted = true;

    analyticsService
      .getAnalyticsReport(dateRange)
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load analytics report:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  const maxTrendValue = useMemo(() => {
    if (!report || report.salesTrend.length === 0) return 1;
    return Math.max(...report.salesTrend.map((p) => p.grossSales), 1);
  }, [report]);

  const handleExportCSV = () => {
    if (!report) return;
    const content = reportExportService.generateCSVContent(report);
    setCsvPreview(content);
    setExportModalVisible(true);
  };

  const handleConfirmExport = () => {
    setExportModalVisible(false);
    Alert.alert('Report Exported', 'CSV summary generated successfully.');
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Reports & Analytics' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <PageHeader
          showBack
          title="Reports & Analytics"
          subtitle="Operational business insights, sales trends, inventory health, and customer metrics."
          action={
            <Button
              title="📥 Export CSV"
              variant="secondary"
              size="sm"
              onPress={handleExportCSV}
            />
          }
        />

        {/* STICKY DATE RANGE SELECTOR */}
        <ThemedView type="backgroundElement" style={[styles.stickyFilterBar, { borderColor: '#9CA3AF33' }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two }}>
            {[
              { key: 'today', label: 'Today' },
              { key: '7days', label: '7 Days' },
              { key: '30days', label: '30 Days' },
              { key: 'month', label: 'This Month' },
            ].map((chip) => {
              const active = dateRange === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[
                    styles.rangeChip,
                    {
                      backgroundColor: active ? '#2563EB' : theme.background,
                      borderColor: active ? '#2563EB' : '#9CA3AF44',
                    },
                  ]}
                  onPress={() => {
                    setLoading(true);
                    setDateRange(chip.key as AnalyticsDateRange);
                  }}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: active ? '#FFFFFF' : theme.text,
                      fontWeight: active ? '800' : '600',
                    }}
                  >
                    {chip.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </ThemedView>

        {loading || !report ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: Spacing.two }}>
              Aggregating store metrics...
            </AppText>
          </View>
        ) : (
          <View style={{ gap: Spacing.four, marginTop: Spacing.two }}>
            {/* 1. BUSINESS OVERVIEW GRID */}
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionTitle}>
                BUSINESS OVERVIEW
              </AppText>

              <View style={styles.overviewGrid}>
                {/* Gross Sales */}
                <ThemedView type="backgroundElement" style={[styles.overviewCard, { borderColor: '#9CA3AF22' }]}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Gross Sales
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                    {formatCurrencyINR(report.salesSummary.grossSales.value)}
                  </AppText>
                  <TrendIndicator metric={report.salesSummary.grossSales} />
                </ThemedView>

                {/* Net Earnings */}
                <ThemedView type="backgroundElement" style={[styles.overviewCard, { borderColor: '#9CA3AF22' }]}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Net Earnings
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800', color: '#2563EB' }}>
                    {formatCurrencyINR(report.salesSummary.netEarnings.value)}
                  </AppText>
                  <TrendIndicator metric={report.salesSummary.netEarnings} />
                </ThemedView>

                {/* Orders */}
                <ThemedView type="backgroundElement" style={[styles.overviewCard, { borderColor: '#9CA3AF22' }]}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Total Orders
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800' }}>
                    {report.salesSummary.ordersCount.value}
                  </AppText>
                  <TrendIndicator metric={report.salesSummary.ordersCount} />
                </ThemedView>

                {/* Avg Order Value */}
                <ThemedView type="backgroundElement" style={[styles.overviewCard, { borderColor: '#9CA3AF22' }]}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Avg Order Value
                  </AppText>
                  <AppText variant="h2" style={{ fontWeight: '800' }}>
                    {formatCurrencyINR(report.salesSummary.avgOrderValue.value)}
                  </AppText>
                  <TrendIndicator metric={report.salesSummary.avgOrderValue} />
                </ThemedView>
              </View>

              {/* Refunds Bar Card */}
              {report.salesSummary.refundsTotal.value > 0 && (
                <ThemedView type="backgroundElement" style={[styles.refundCard, { borderColor: '#DC262644' }]}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '800' }}>
                      Customer Refunds Processed
                    </AppText>
                    <AppText variant="subtitle" style={{ fontWeight: '800', color: '#DC2626' }}>
                      {formatCurrencyINR(-report.salesSummary.refundsTotal.value)}
                    </AppText>
                  </View>
                  <Pressable onPress={() => router.push('/returns' as any)}>
                    <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                      View Returns →
                    </AppText>
                  </Pressable>
                </ThemedView>
              )}
            </View>

            {/* 2. SALES TREND CHART */}
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionTitle}>
                SALES TREND
              </AppText>

              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  Daily Gross Sales (₹)
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Revenue trend across the selected reporting period.
                </AppText>

                <View style={styles.chartContainer}>
                  {report.salesTrend.map((pt, idx) => {
                    const barHeightPct = Math.max(8, Math.round((pt.grossSales / maxTrendValue) * 100));
                    return (
                      <View key={idx} style={styles.chartBarCol}>
                        <AppText variant="caption" style={{ fontSize: 9, color: theme.textSecondary }}>
                          ₹{pt.grossSales > 1000 ? `${(pt.grossSales / 1000).toFixed(1)}k` : pt.grossSales}
                        </AppText>

                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: `${barHeightPct}%`,
                                backgroundColor: pt.grossSales > 0 ? '#2563EB' : '#9CA3AF33',
                              },
                            ]}
                          />
                        </View>

                        <AppText variant="caption" style={styles.barLabel}>
                          {pt.label}
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              </ThemedView>
            </View>

            {/* 3. SALES CHANNEL BREAKDOWN */}
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionTitle}>
                SALES CHANNEL BREAKDOWN
              </AppText>

              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  Yugo Orders vs Counter Sales
                </AppText>

                {/* Progress bar */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${report.channelBreakdown.yugoPercentage}%`,
                        backgroundColor: '#2563EB',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${report.channelBreakdown.counterPercentage}%`,
                        backgroundColor: '#10B981',
                      },
                    ]}
                  />
                </View>

                <View style={styles.channelRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' }} />
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        Yugo App Orders
                      </AppText>
                    </View>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {formatCurrencyINR(report.channelBreakdown.yugoAmount)} ({report.channelBreakdown.yugoPercentage}%) • {report.channelBreakdown.yugoCount} orders
                    </AppText>
                  </View>

                  <View style={{ flex: 1, gap: 2, alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        Counter Sales
                      </AppText>
                    </View>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {formatCurrencyINR(report.channelBreakdown.counterAmount)} ({report.channelBreakdown.counterPercentage}%) • {report.channelBreakdown.counterCount} sales
                    </AppText>
                  </View>
                </View>
              </ThemedView>
            </View>

            {/* 4. ORDER STATUS & DELIVERY */}
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionTitle}>
                ORDER STATUS & DELIVERY PERFORMANCE
              </AppText>

              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Fulfillment Status
                  </AppText>
                  <View style={styles.successBadge}>
                    <AppText variant="caption" style={{ color: '#10B981', fontWeight: '800' }}>
                      Success Rate: {report.orderStatus.deliverySuccessRate}%
                    </AppText>
                  </View>
                </View>

                <View style={styles.statusGrid}>
                  <View style={styles.statusStatBox}>
                    <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
                      {report.orderStatus.delivered}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Delivered
                    </AppText>
                  </View>

                  <View style={styles.statusStatBox}>
                    <AppText variant="h2" style={{ fontWeight: '800', color: '#2563EB' }}>
                      {report.orderStatus.active}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Active
                    </AppText>
                  </View>

                  <View style={styles.statusStatBox}>
                    <AppText variant="h2" style={{ fontWeight: '800', color: '#DC2626' }}>
                      {report.orderStatus.cancelled}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Cancelled
                    </AppText>
                  </View>

                  <View style={styles.statusStatBox}>
                    <AppText variant="h2" style={{ fontWeight: '800', color: '#D97706' }}>
                      {report.orderStatus.returned}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Returned
                    </AppText>
                  </View>
                </View>
              </ThemedView>
            </View>

            {/* 5. TOP SELLING PRODUCTS */}
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionTitle}>
                TOP SELLING PRODUCTS (UNITS SOLD)
              </AppText>

              {report.topSellingProducts.length > 0 ? (
                report.topSellingProducts.map((prod, idx) => (
                  <Pressable key={prod.productId} onPress={() => router.push('/(tabs)/explore' as any)}>
                    <ThemedView type="backgroundElement" style={[styles.productRankCard, { borderColor: '#9CA3AF22' }]}>
                      <View style={styles.rankBadge}>
                        <AppText variant="subtitle" style={{ fontWeight: '800', color: '#2563EB' }}>
                          #{idx + 1}
                        </AppText>
                      </View>

                      <View style={{ flex: 1 }}>
                        <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                          {prod.productName}
                        </AppText>
                        <AppText variant="caption" style={{ color: theme.textSecondary }}>
                          {prod.netQuantitySold} units sold • Gross: ₹{prod.grossRevenue}
                        </AppText>
                        {prod.estimatedUnitMargin !== undefined && (
                          <AppText variant="caption" style={{ color: '#10B981', fontSize: 11 }}>
                            Est. Unit Margin: ₹{prod.estimatedUnitMargin}
                          </AppText>
                        )}
                      </View>

                      <AppText variant="subtitle" style={{ fontWeight: '800', color: '#10B981' }}>
                        ₹{prod.netRevenue}
                      </AppText>
                    </ThemedView>
                  </Pressable>
                ))
              ) : (
                <ThemedView type="backgroundElement" style={styles.emptyCard}>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    No sales recorded for this period.
                  </AppText>
                </ThemedView>
              )}
            </View>

            {/* 6. INVENTORY HEALTH & ATTENTION */}
            <View style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionTitle}>
                INVENTORY HEALTH & RESTOCK ALERTS
              </AppText>

              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <View style={styles.healthRow}>
                  <View style={styles.healthBox}>
                    <AppText variant="h3" style={{ fontWeight: '800' }}>
                      {report.inventoryHealth.totalProducts}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      Total Items
                    </AppText>
                  </View>

                  <View style={styles.healthBox}>
                    <AppText variant="h3" style={{ fontWeight: '800', color: '#10B981' }}>
                      {report.inventoryHealth.inStockCount}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      In Stock
                    </AppText>
                  </View>

                  <View style={styles.healthBox}>
                    <AppText variant="h3" style={{ fontWeight: '800', color: '#D97706' }}>
                      {report.inventoryHealth.lowStockCount}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      Low Stock
                    </AppText>
                  </View>

                  <View style={styles.healthBox}>
                    <AppText variant="h3" style={{ fontWeight: '800', color: '#DC2626' }}>
                      {report.inventoryHealth.outOfStockCount}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                      Out of Stock
                    </AppText>
                  </View>
                </View>

                {report.inventoryHealth.needsRestocking.length > 0 && (
                  <View style={{ gap: 6, marginTop: Spacing.two }}>
                    <AppText variant="caption" style={{ fontWeight: '800', color: '#DC2626' }}>
                      ⚠️ Needs Restocking ({report.inventoryHealth.needsRestocking.length}):
                    </AppText>

                    {report.inventoryHealth.needsRestocking.slice(0, 3).map((item) => (
                      <Pressable key={item.id} onPress={() => router.push('/(tabs)/explore' as any)}>
                        <View style={styles.restockItemRow}>
                          <AppText variant="caption" style={{ fontWeight: '700', flex: 1 }}>
                            {item.name}
                          </AppText>
                          <AppText variant="caption" style={{ color: item.status === 'out' ? '#DC2626' : '#D97706', fontWeight: '800' }}>
                            {item.stockQuantity} left (Threshold: {item.threshold})
                          </AppText>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </ThemedView>
            </View>

            {/* 7. CUSTOMERS & PROCUREMENT */}
            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              {/* Customer Insights */}
              <Pressable style={{ flex: 1 }} onPress={() => router.push('/customers' as any)}>
                <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22', flex: 1 }]}>
                  <AppText variant="caption" style={{ fontWeight: '800', color: '#6B7280' }}>
                    CUSTOMERS
                  </AppText>
                  <AppText variant="h3" style={{ fontWeight: '800', marginTop: 2 }}>
                    {report.customerInsights.uniqueCustomersCount} Unique
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Repeat Rate: {report.customerInsights.repeatCustomerRate}%
                  </AppText>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800', marginTop: 4 }}>
                    View Customers →
                  </AppText>
                </ThemedView>
              </Pressable>

              {/* Procurement Summary */}
              <Pressable style={{ flex: 1 }} onPress={() => router.push('/suppliers' as any)}>
                <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22', flex: 1 }]}>
                  <AppText variant="caption" style={{ fontWeight: '800', color: '#6B7280' }}>
                    STOCK PURCHASING
                  </AppText>
                  <AppText variant="h3" style={{ fontWeight: '800', marginTop: 2, color: '#10B981' }}>
                    {formatCurrencyINR(report.procurementSummary.totalPurchaseValue)}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    {report.procurementSummary.receiptsCount} Stock Receipts
                  </AppText>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800', marginTop: 4 }}>
                    View Suppliers →
                  </AppText>
                </ThemedView>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CSV Export Preview Modal */}
      <Modal visible={exportModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              CSV Analytics Report Export
            </AppText>

            <ScrollView style={styles.csvBox}>
              <AppText variant="caption" style={{ fontFamily: 'PlatformSelect', fontSize: 11 }}>
                {csvPreview}
              </AppText>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Close" variant="secondary" onPress={() => setExportModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Export Report" variant="primary" onPress={handleConfirmExport} />
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
    gap: Spacing.three,
  },
  stickyFilterBar: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginHorizontal: -Spacing.four,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  loadingContainer: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '800',
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  overviewCard: {
    width: '48%',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  trendBadge: {
    marginTop: 2,
  },
  refundCard: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.two,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: '#9CA3AF15',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  successBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  statusStatBox: {
    alignItems: 'center',
  },
  productRankCard: {
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthBox: {
    alignItems: 'center',
  },
  restockItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
  },
  emptyCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
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
  csvBox: {
    backgroundColor: '#1E293B',
    padding: Spacing.three,
    borderRadius: 12,
    maxHeight: 250,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
