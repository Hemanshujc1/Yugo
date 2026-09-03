import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useShopSettings } from '@/hooks';
import { formatCurrencyINR } from '@/utils';

export default function ShopSettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    profile,
    availability,
    orderSettings,
    deliverySettings,
    deliveryStaff,
    toggleAvailability,
    updateOrderSettings,
    updateDeliverySettings,
  } = useShopSettings();

  // Order Settings Modal
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [minOrderInput, setMinOrderInput] = useState(String(orderSettings.minimumOrderValue));
  const [maxOrderInput, setMaxOrderInput] = useState(String(orderSettings.maximumOrderValue));
  const [allowCOD, setAllowCOD] = useState(orderSettings.allowCOD);
  const [allowOnline, setAllowOnline] = useState(orderSettings.allowOnlinePayment);
  const [prepTime, setPrepTime] = useState(orderSettings.defaultPrepTimeMinutes);
  const [formError, setFormError] = useState<string | null>(null);

  // Availability Toggle Notice
  const [showClosedNotice, setShowClosedNotice] = useState(false);

  const handleToggleAvailability = async (val: boolean) => {
    if (!val) {
      setShowClosedNotice(true);
    }
    await toggleAvailability(val);
  };

  const handleOpenOrderModal = () => {
    setMinOrderInput(String(orderSettings.minimumOrderValue));
    setMaxOrderInput(String(orderSettings.maximumOrderValue));
    setAllowCOD(orderSettings.allowCOD);
    setAllowOnline(orderSettings.allowOnlinePayment);
    setPrepTime(orderSettings.defaultPrepTimeMinutes);
    setFormError(null);
    setOrderModalVisible(true);
  };

  const handleSaveOrderSettings = async () => {
    setFormError(null);
    const minVal = parseFloat(minOrderInput);
    const maxVal = parseFloat(maxOrderInput);

    if (isNaN(minVal) || minVal < 0) {
      setFormError('Minimum Order Value must be 0 or greater.');
      return;
    }
    if (isNaN(maxVal) || maxVal <= minVal) {
      setFormError('Maximum Order Value must be greater than Minimum Order Value.');
      return;
    }
    if (!allowCOD && !allowOnline) {
      setFormError('At least one payment method (COD or Online) must be enabled.');
      return;
    }

    try {
      await updateOrderSettings({
        minimumOrderValue: minVal,
        maximumOrderValue: maxVal,
        allowCOD,
        allowOnlinePayment: allowOnline,
        defaultPrepTimeMinutes: prepTime,
      });
      setOrderModalVisible(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save order settings.');
    }
  };

  const activeStaffCount = deliveryStaff.filter((s) => s.isActive).length;

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Shop Settings' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 32, BottomTabInset + Spacing.six) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Shop Settings"
          subtitle="Configure business profile, operational status, order rules, and delivery modes."
        />

        {/* 1. SHOP PROFILE SECTION */}
        <View style={{ gap: Spacing.two }}>
          <AppText variant="caption" style={styles.sectionHeader}>
            SHOP PROFILE
          </AppText>

          <Pressable onPress={() => router.push('/shop-profile' as any)}>
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    {profile?.shopName || 'Yugo Fresh Mart'}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    {profile?.shopkeeperName} • 📍 {profile?.city}
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {profile?.address} ({profile?.pincode})
                  </AppText>
                </View>

                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                  Edit Profile →
                </AppText>
              </View>
            </ThemedView>
          </Pressable>
        </View>

        {/* 2. SHOP OPERATIONS SECTION */}
        <View style={{ gap: Spacing.two }}>
          <AppText variant="caption" style={styles.sectionHeader}>
            SHOP OPERATIONS & AVAILABILITY
          </AppText>

          {/* Shop Availability Toggle Card */}
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1, paddingRight: Spacing.two }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: availability.isOpen ? '#10B981' : '#EF4444',
                    }}
                  />
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Open for Yugo Orders
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: 2 }}>
                  {availability.isOpen
                    ? 'Currently accepting incoming Yugo customer orders.'
                    : 'Shop is closed. New orders are temporarily paused.'}
                </AppText>
              </View>

              <Switch
                value={availability.isOpen}
                onValueChange={handleToggleAvailability}
                trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {showClosedNotice && !availability.isOpen && (
              <View style={styles.closedNoticeBox}>
                <AppText variant="caption" style={{ color: '#92400E', fontWeight: '600' }}>
                  ℹ️ Closing your shop will stop new orders. Existing active orders will continue normally.
                </AppText>
              </View>
            )}
          </ThemedView>

          {/* Operating Hours Row */}
          <Pressable onPress={() => router.push('/operating-hours' as any)}>
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2, paddingRight: Spacing.two }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Operating Hours
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Mon–Sat 09:00 AM–09:00 PM • Sun 10:00 AM–06:00 PM
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                  Configure →
                </AppText>
              </View>
            </ThemedView>
          </Pressable>

          {/* Order Settings & Preparation Time */}
          <Pressable onPress={handleOpenOrderModal}>
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2, paddingRight: Spacing.two }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Order Settings & Value Limits
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Min {formatCurrencyINR(orderSettings.minimumOrderValue)} • Max {formatCurrencyINR(orderSettings.maximumOrderValue)} • Prep: {orderSettings.defaultPrepTimeMinutes}m
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                  Edit →
                </AppText>
              </View>
            </ThemedView>
          </Pressable>
        </View>

        {/* 3. DELIVERY SECTION */}
        <View style={{ gap: Spacing.two }}>
          <AppText variant="caption" style={styles.sectionHeader}>
            DELIVERY & STAFF MANAGEMENT
          </AppText>

          {/* Delivery Mode Selector */}
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <AppText variant="subtitle" style={{ fontWeight: '800' }}>
              Delivery Mode Setting
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Choose how customer orders are dispatched from your store.
            </AppText>

            <View style={{ flexDirection: 'row', gap: Spacing.two, marginTop: 4 }}>
              {[
                { key: 'both', label: 'Both' },
                { key: 'yugo_partner', label: 'Yugo Rider' },
                { key: 'self_delivery', label: 'Shop Staff' },
              ].map((opt) => {
                const active = deliverySettings.deliveryMode === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    style={[
                      styles.modeChip,
                      {
                        backgroundColor: active ? '#2563EB' : theme.background,
                        borderColor: active ? '#2563EB' : '#9CA3AF44',
                      },
                    ]}
                    onPress={() => updateDeliverySettings({ deliveryMode: opt.key as any })}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: active ? '#FFFFFF' : theme.text,
                        fontWeight: active ? '800' : '500',
                      }}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </ThemedView>

          {/* Delivery Staff Nav */}
          <Pressable onPress={() => router.push('/delivery-staff' as any)}>
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2, paddingRight: Spacing.two }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    Shop Delivery Staff
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    {activeStaffCount} active delivery staff member(s)
                  </AppText>
                </View>
                <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                  Manage →
                </AppText>
              </View>
            </ThemedView>
          </Pressable>
        </View>

        {/* 4. UTILITIES & NAVIGATION */}
        <View style={{ gap: Spacing.two }}>
          <AppText variant="caption" style={styles.sectionHeader}>
            SYSTEM & PREFERENCES
          </AppText>

          <Pressable onPress={() => router.push('/notification-preferences' as any)}>
            <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2, paddingRight: Spacing.two }}>
                  <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                    🔔 Notification Settings
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Configure alerts and notification preferences
                  </AppText>
                </View>
                <AppText variant="subtitle" style={{ color: '#2563EB', fontWeight: '800' }}>
                  →
                </AppText>
              </View>
            </ThemedView>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Order Settings Modal */}
      <Modal visible={orderModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Edit Order Settings
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingVertical: Spacing.two }}>
              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Minimum Order Value (₹)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={minOrderInput}
                  onChangeText={setMinOrderInput}
                  keyboardType="numeric"
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Maximum Order Value (₹)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  value={maxOrderInput}
                  onChangeText={setMaxOrderInput}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.toggleRow}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  Allow Cash on Delivery (COD)
                </AppText>
                <Switch
                  value={allowCOD}
                  onValueChange={setAllowCOD}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleRow}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                  Allow Online Payment (UPI / Card)
                </AppText>
                <Switch
                  value={allowOnline}
                  onValueChange={setAllowOnline}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700', marginBottom: 4 }}>
                  Default Order Preparation Time
                </AppText>
                <View style={{ flexDirection: 'row', gap: Spacing.two }}>
                  {[15, 20, 30, 45, 60].map((mins) => {
                    const active = prepTime === mins;
                    return (
                      <Pressable
                        key={mins}
                        style={[
                          styles.modeChip,
                          {
                            backgroundColor: active ? '#2563EB' : theme.background,
                            borderColor: active ? '#2563EB' : '#9CA3AF44',
                          },
                        ]}
                        onPress={() => setPrepTime(mins)}
                      >
                        <AppText
                          variant="caption"
                          style={{
                            color: active ? '#FFFFFF' : theme.text,
                            fontWeight: active ? '800' : '500',
                          }}
                        >
                          {mins}m
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {formError && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {formError}
                </AppText>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setOrderModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Save Settings" variant="primary" onPress={handleSaveOrderSettings} />
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
    gap: Spacing.four,
  },
  sectionHeader: {
    fontWeight: '800',
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.two,
    borderWidth: 1,
  },
  cardRow: {
    padding: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closedNoticeBox: {
    backgroundColor: '#FEF3C7',
    padding: Spacing.three,
    borderRadius: 12,
    marginTop: Spacing.one,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
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
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    marginTop: 4,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
