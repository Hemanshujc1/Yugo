import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
} from 'react-native';
import { Stack } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNotifications } from '@/hooks';

export default function NotificationPreferencesScreen() {
  const theme = useTheme();
  const { preferences, updatePreferences } = useNotifications();

  const handleToggle = (
    section: 'orders' | 'inventory' | 'system',
    key: string,
    val: boolean
  ) => {
    const updated = {
      ...preferences,
      [section]: {
        ...preferences[section],
        [key]: val,
      },
    };
    updatePreferences(updated);
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Notification Settings' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Notification Preferences"
          subtitle="Choose which in-app operational alerts and shop notifications you want to receive."
        />

        {/* Section 1: Orders */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            📦 Order Alerts
          </AppText>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                New Orders
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Notify immediately when a new customer order arrives.
              </AppText>
            </View>
            <Switch
              value={preferences.orders.newOrders}
              onValueChange={(val) => handleToggle('orders', 'newOrders', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Order Cancellations
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Notify if a customer or system cancels an order.
              </AppText>
            </View>
            <Switch
              value={preferences.orders.orderCancellations}
              onValueChange={(val) => handleToggle('orders', 'orderCancellations', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Delivery Updates
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Notify when riders are assigned or order pickup/delivery is completed.
              </AppText>
            </View>
            <Switch
              value={preferences.orders.deliveryUpdates}
              onValueChange={(val) => handleToggle('orders', 'deliveryUpdates', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>
        </ThemedView>

        {/* Section 2: Inventory */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            🏷️ Inventory & Stock Alerts
          </AppText>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Low Stock Warnings
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Alert when products fall below their configured low stock threshold.
              </AppText>
            </View>
            <Switch
              value={preferences.inventory.lowStock}
              onValueChange={(val) => handleToggle('inventory', 'lowStock', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Out of Stock Warnings
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Alert when a product reaches 0 stock quantity.
              </AppText>
            </View>
            <Switch
              value={preferences.inventory.outOfStock}
              onValueChange={(val) => handleToggle('inventory', 'outOfStock', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Stock Audit Recommendations
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Remind to perform periodic stock audit reconciliations.
              </AppText>
            </View>
            <Switch
              value={preferences.inventory.stockAudits}
              onValueChange={(val) => handleToggle('inventory', 'stockAudits', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>
        </ThemedView>

        {/* Section 3: System */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h3" style={{ fontWeight: '800' }}>
            ⚙️ System & Operational
          </AppText>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Important Shop Alerts
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Receive critical platform maintenance and shop status notifications.
              </AppText>
            </View>
            <Switch
              value={preferences.system.shopAlerts}
              onValueChange={(val) => handleToggle('system', 'shopAlerts', val)}
              trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
            />
          </View>
        </ThemedView>
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
    padding: Spacing.four,
    borderRadius: 16,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF22',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.three,
  },
});
