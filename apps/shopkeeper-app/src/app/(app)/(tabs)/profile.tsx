import React from 'react';
import { StyleSheet, ScrollView, View, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AppText, Screen, ThemedView, Button, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth, useOrders } from '@/hooks';
import type { DeliveryMode } from '@/types/order';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const { deliveryConfig, updateDeliveryConfig, activeSelfDeliveryCount } = useOrders();

  const handleModeSelect = (mode: DeliveryMode) => {
    updateDeliveryConfig({ deliveryMode: mode });
  };

  const handleThresholdChange = (delta: number) => {
    const current = deliveryConfig.smartDeliveryThreshold || 3;
    const nextVal = Math.max(1, Math.min(50, current + delta));
    updateDeliveryConfig({ smartDeliveryThreshold: nextVal });
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Page Header */}
        <PageHeader
          title="Profile & Settings"
          subtitle="Manage shop account details and delivery handling strategy."
        />

        {/* Account Info Card */}
        {user && (
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Shopkeeper Account
            </AppText>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Name
              </AppText>
              <AppText variant="body" style={styles.infoVal}>
                {user.name}
              </AppText>
            </View>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Email
              </AppText>
              <AppText variant="body" style={styles.infoVal}>
                {user.email}
              </AppText>
            </View>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Shop Name
              </AppText>
              <AppText variant="body" style={styles.infoVal}>
                {user.shopName}
              </AppText>
            </View>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Role
              </AppText>
              <AppText variant="body" style={[styles.infoVal, { textTransform: 'capitalize' }]}>
                {user.role}
              </AppText>
            </View>
          </ThemedView>
        )}

        {/* Dedicated Delivery Configuration Section */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Delivery Configuration
          </AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
            Choose how incoming customer delivery orders are fulfilled by your shop:
          </AppText>

          {/* Mode 1: Self Delivery */}
          <Pressable
            style={[
              styles.optionCard,
              deliveryConfig.deliveryMode === 'self_delivery' && styles.optionCardSelected,
            ]}
            onPress={() => handleModeSelect('self_delivery')}
          >
            <View style={styles.radioRow}>
              <View
                style={[
                  styles.radioCircle,
                  deliveryConfig.deliveryMode === 'self_delivery' && styles.radioCircleSelected,
                ]}
              >
                {deliveryConfig.deliveryMode === 'self_delivery' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  Self Delivery
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  I&apos;ll handle all customer delivery orders myself.
                </AppText>
              </View>
            </View>
          </Pressable>

          {/* Mode 2: YuGo Delivery */}
          <Pressable
            style={[
              styles.optionCard,
              deliveryConfig.deliveryMode === 'yugo_delivery' && styles.optionCardSelected,
            ]}
            onPress={() => handleModeSelect('yugo_delivery')}
          >
            <View style={styles.radioRow}>
              <View
                style={[
                  styles.radioCircle,
                  deliveryConfig.deliveryMode === 'yugo_delivery' && styles.radioCircleSelected,
                ]}
              >
                {deliveryConfig.deliveryMode === 'yugo_delivery' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  YuGo Delivery
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  YuGo delivery partners will handle my delivery orders.
                </AppText>
              </View>
            </View>
          </Pressable>

          {/* Mode 3: Smart Delivery (Workload-based) */}
          <Pressable
            style={[
              styles.optionCard,
              deliveryConfig.deliveryMode === 'smart_delivery' && styles.optionCardSelected,
            ]}
            onPress={() => handleModeSelect('smart_delivery')}
          >
            <View style={styles.radioRow}>
              <View
                style={[
                  styles.radioCircle,
                  deliveryConfig.deliveryMode === 'smart_delivery' && styles.radioCircleSelected,
                ]}
              >
                {deliveryConfig.deliveryMode === 'smart_delivery' && (
                  <View style={styles.radioInnerDot} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  Smart Delivery (Automatic Workload)
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  I&apos;ll handle deliveries until my workload reaches a limit. New delivery orders will then be routed to YuGo delivery partners.
                </AppText>
              </View>
            </View>
          </Pressable>

          {/* Threshold Control when Smart Delivery is selected */}
          {deliveryConfig.deliveryMode === 'smart_delivery' && (
            <View style={styles.thresholdBox}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Maximum Pending Self-Delivery Orders
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.two }}>
                Default threshold is 3. When active self-delivery orders reach this limit, new delivery orders switch to YuGo riders.
              </AppText>

              <View style={styles.stepperRow}>
                <Pressable style={styles.stepperBtn} onPress={() => handleThresholdChange(-1)}>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    −
                  </AppText>
                </Pressable>
                <View style={styles.stepperValueBox}>
                  <AppText variant="h3" style={{ fontWeight: '800' }}>
                    {deliveryConfig.smartDeliveryThreshold || 3}
                  </AppText>
                </View>
                <Pressable style={styles.stepperBtn} onPress={() => handleThresholdChange(1)}>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    +
                  </AppText>
                </Pressable>
              </View>

              <View style={styles.workloadIndicator}>
                <SymbolView
                  name={{ ios: 'info.circle.fill', android: 'info', web: 'info' } as any}
                  size={16}
                  tintColor="#2563EB"
                />
                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '600', flex: 1 }}>
                  Current active self-delivery workload: {activeSelfDeliveryCount} / {deliveryConfig.smartDeliveryThreshold || 3} orders
                </AppText>
              </View>
            </View>
          )}
        </ThemedView>

        <Button variant="secondary" title="Logout" onPress={logout} />
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  infoVal: {
    fontWeight: '500',
  },
  optionCard: {
    borderWidth: 1,
    borderColor: '#9CA3AF33',
    borderRadius: 12,
    padding: Spacing.three,
    backgroundColor: '#9CA3AF10',
  },
  optionCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB0D',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: '#2563EB',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  thresholdBox: {
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: '#2563EB0F',
    borderWidth: 1,
    borderColor: '#2563EB33',
    gap: Spacing.two,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    justifyContent: 'center',
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9CA3AF44',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValueBox: {
    width: 60,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563EB66',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workloadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
});
