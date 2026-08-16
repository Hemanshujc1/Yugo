import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader, StatCard, Button } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { analyticsCards } from '@/services/dashboard-mock-data';

export default function AnalyticsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Analytics' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Header */}
        <PageHeader
          title="Shop Analytics"
          subtitle="Track sales, order performance, and growth metrics."
        />

        {/* 2-Column Responsive Metric Cards */}
        <View style={styles.metricsGrid}>
          {analyticsCards.map((card) => (
            <StatCard
              key={card.key}
              title={card.title}
              value={card.value}
              subtitle={card.detail}
              style={styles.metricCardItem}
              accentColor={
                card.key === 'revenue'
                  ? '#2563EB'
                  : card.key === 'profit'
                    ? '#10B981'
                    : card.key === 'orders'
                      ? '#0EA5E9'
                      : '#F59E0B'
              }
            />
          ))}
        </View>

        {/* Top Selling Categories Container */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Top Selling Categories
          </AppText>

          <View style={styles.barRow}>
            <View style={styles.barMeta}>
              <AppText variant="body" style={{ fontWeight: '700' }}>
                Beverages
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                42% of total sales
              </AppText>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '84%', backgroundColor: '#2563EB' }]} />
            </View>
          </View>

          <View style={styles.barRow}>
            <View style={styles.barMeta}>
              <AppText variant="body" style={{ fontWeight: '700' }}>
                Dairy & Eggs
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                28% of total sales
              </AppText>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '56%', backgroundColor: '#10B981' }]} />
            </View>
          </View>

          <View style={styles.barRow}>
            <View style={styles.barMeta}>
              <AppText variant="body" style={{ fontWeight: '700' }}>
                Bakery
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                16% of total sales
              </AppText>
            </View>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: '32%', backgroundColor: '#F59E0B' }]} />
            </View>
          </View>
        </ThemedView>

        {/* Fulfillment Breakdown Container */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Fulfillment Breakdown
          </AppText>

          <View style={styles.splitRow}>
            <View style={styles.splitBlock}>
              <AppText variant="h2" style={{ color: '#2563EB', fontWeight: '800' }}>
                64%
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                YuGo Delivery
              </AppText>
            </View>

            <View style={styles.splitBlock}>
              <AppText variant="h2" style={{ color: '#6D28D9', fontWeight: '800' }}>
                24%
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Self Delivery
              </AppText>
            </View>

            <View style={styles.splitBlock}>
              <AppText variant="h2" style={{ color: '#10B981', fontWeight: '800' }}>
                12%
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Store Pickup
              </AppText>
            </View>
          </View>
        </ThemedView>

        <Button title="Back to Home" variant="secondary" onPress={() => router.back()} />
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
    gap: Spacing.four,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  metricCardItem: {
    width: '48%',
    minWidth: 150,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF44',
    paddingBottom: Spacing.one,
    marginBottom: Spacing.one,
  },
  barRow: {
    gap: Spacing.one,
  },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#9CA3AF22',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitBlock: {
    alignItems: 'center',
    flex: 1,
  },
});
