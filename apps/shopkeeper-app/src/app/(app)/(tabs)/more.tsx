import React from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { initService } from '@/services/init-service';
import { useOrders } from '@/hooks';

interface MenuItem {
  key: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface MenuSection {
  sectionTitle: string;
  items: MenuItem[];
}

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { refreshOrders } = useOrders();

  const handleResetDemoData = () => {
    Alert.alert(
      'Developer Action: Reset Demo Data',
      'This will clear local storage and restore the default demo datasets for orders, inventory, catalog, and settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Demo Data',
          style: 'destructive',
          onPress: async () => {
            await initService.resetDemoData();
            await refreshOrders();
            Alert.alert('Demo Data Reset', 'Local data has been reset to default demo dataset.');
          },
        },
      ]
    );
  };

  const menuSections: MenuSection[] = [
    {
      sectionTitle: 'SHOP MANAGEMENT',
      items: [
        {
          key: 'shop-profile',
          title: 'Shop Profile',
          description: 'Basic store details, phone, address, and logo',
          icon: '🏪',
          href: '/shop-profile',
        },
        {
          key: 'shop-settings',
          title: 'Shop Settings',
          description: 'Delivery modes, order prep times, and COD settings',
          icon: '⚙️',
          href: '/shop-settings',
        },
        {
          key: 'operating-hours',
          title: 'Operating Hours',
          description: 'Configure daily store open/close schedules',
          icon: '⏰',
          href: '/operating-hours',
        },
      ],
    },
    {
      sectionTitle: 'OPERATIONS & INVENTORY',
      items: [
        {
          key: 'delivery-ops',
          title: 'Delivery Operations',
          description: 'Pickups, active staff assignments, and dispatches',
          icon: '🚚',
          href: '/delivery-operations',
        },
        {
          key: 'delivery-staff',
          title: 'Shop Delivery Staff',
          description: 'Manage store delivery personnel and active orders',
          icon: '🛵',
          href: '/delivery-staff',
        },
        {
          key: 'suppliers',
          title: 'Suppliers Directory',
          description: 'Vendor contact directory and stock receiving',
          icon: '📦',
          href: '/suppliers',
        },
        {
          key: 'stock-receipts',
          title: 'Stock Receipts History',
          description: 'Audit log of incoming supplier stock shipments',
          icon: '🧾',
          href: '/stock-receipts',
        },
        {
          key: 'returns',
          title: 'Returns & Refunds',
          description: 'Customer returns, stock disposition, and refund logs',
          icon: '↺',
          href: '/returns',
        },
      ],
    },
    {
      sectionTitle: 'BUSINESS & FINANCIALS',
      items: [
        {
          key: 'analytics',
          title: 'Reports & Analytics',
          description: 'Revenue trends, top products, and inventory health',
          icon: '📊',
          href: '/analytics',
        },
        {
          key: 'customers',
          title: 'Customer Directory',
          description: 'Customer order history, contact info, and lifetime spend',
          icon: '👥',
          href: '/customers',
        },
        {
          key: 'earnings',
          title: 'Earnings & Revenue',
          description: 'Daily gross sales, net earnings, and COD collections',
          icon: '📈',
          href: '/earnings',
        },
        {
          key: 'payment-history',
          title: 'Payment History',
          description: 'Order payment status, COD logs, and refunds',
          icon: '💳',
          href: '/payment-history',
        },
      ],
    },
    {
      sectionTitle: 'SYSTEM & PREFERENCES',
      items: [
        {
          key: 'notifications',
          title: 'Notifications',
          description: 'View store updates, order alerts, and stock warnings',
          icon: '🔔',
          href: '/notifications',
        },
        {
          key: 'notification-preferences',
          title: 'Notification Settings',
          description: 'Configure order, inventory, and system alerts',
          icon: '🔕',
          href: '/notification-preferences',
        },
      ],
    },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="More"
          subtitle="Shop settings, operations management, analytics, and business tools."
        />

        <View style={{ gap: Spacing.four, marginTop: Spacing.two }}>
          {menuSections.map((sec) => (
            <View key={sec.sectionTitle} style={{ gap: Spacing.two }}>
              <AppText variant="caption" style={styles.sectionHeader}>
                {sec.sectionTitle}
              </AppText>

              {sec.items.map((item) => (
                <Pressable key={item.key} onPress={() => router.push(item.href as any)}>
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.menuItemCard, { borderColor: '#9CA3AF22' }]}
                  >
                    <View style={styles.iconCircle}>
                      <AppText variant="subtitle">{item.icon}</AppText>
                    </View>

                    <View style={styles.textContainer}>
                      <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                        {item.title}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1 }}>
                        {item.description}
                      </AppText>
                    </View>

                    <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 16 }}>
                      ›
                    </AppText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
          ))}

          {/* DEVELOPER TOOLS */}
          <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
            <AppText variant="caption" style={styles.sectionHeader}>
              DEVELOPER TOOLS
            </AppText>
            <ThemedView type="backgroundElement" style={[styles.menuItemCard, { borderColor: '#DC262644' }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <AppText variant="subtitle">🔄</AppText>
              </View>

              <View style={styles.textContainer}>
                <AppText variant="subtitle" style={{ fontWeight: '700', color: '#DC2626' }}>
                  Reset Demo Data
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1 }}>
                  Clear local persistence and restore initial mock state
                </AppText>
              </View>

              <Button
                title="Reset"
                variant="secondary"
                size="sm"
                onPress={handleResetDemoData}
              />
            </ThemedView>
          </View>
        </View>
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
  },
  sectionHeader: {
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    gap: Spacing.three,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9CA3AF1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
});
