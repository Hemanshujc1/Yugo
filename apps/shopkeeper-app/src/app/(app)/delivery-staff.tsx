import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Switch,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useShopSettings, useOrders } from '@/hooks';
import { DeliveryStaffMember } from '@/types/shop-settings';

export default function DeliveryStaffScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { deliveryStaff, addDeliveryStaff, updateDeliveryStaff } = useShopSettings();
  const { orders } = useOrders();

  // Add Staff Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeStaff = deliveryStaff.filter((s) => s.isActive);
  const inactiveStaff = deliveryStaff.filter((s) => !s.isActive);

  const handleOpenAddModal = () => {
    setStaffName('');
    setStaffPhone('');
    setFormError(null);
    setModalVisible(true);
  };

  const handleSaveStaff = async () => {
    setFormError(null);
    if (!staffName.trim()) {
      setFormError('Staff Name is required.');
      return;
    }
    if (!staffPhone.trim()) {
      setFormError('Phone Number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDeliveryStaff({
        name: staffName.trim(),
        phone: staffPhone.trim(),
      });
      setModalVisible(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (member: DeliveryStaffMember, val: boolean) => {
    if (!val) {
      const activeDeliveries = orders.filter(
        (o) =>
          o.orderStatus === 'out_for_delivery' &&
          o.deliveryDetails?.assignedStaff?.id === member.id
      );
      if (activeDeliveries.length > 0) {
        import('react-native').then(({ Alert }) => {
          Alert.alert(
            'Active Deliveries In Progress',
            `Warning: ${member.name} currently has ${activeDeliveries.length} active delivery order(s) assigned. Disabling staff will not affect historical records, but reassignment is recommended.`
          );
        });
      }
    }

    try {
      await updateDeliveryStaff(member.id, { isActive: val });
    } catch (err) {
      console.error('Failed to toggle staff status:', err);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Delivery Staff' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Shop Delivery Staff"
          subtitle="Manage shop delivery personnel available for local order dispatches."
          action={
            <Button
              title="+ Add Staff"
              variant="primary"
              size="sm"
              onPress={handleOpenAddModal}
            />
          }
        />

        <Pressable onPress={() => router.push('/delivery-operations' as any)}>
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#2563EB44', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <View style={{ flex: 1 }}>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                🚚 Delivery Operations Command Center
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                View active staff assignments, pickups, and dispatches
              </AppText>
            </View>
            <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
              View →
            </AppText>
          </ThemedView>
        </Pressable>

        {/* Active Staff Section */}
        <View style={{ gap: Spacing.two }}>
          <AppText variant="caption" style={styles.sectionHeader}>
            ACTIVE STAFF MEMBERS ({activeStaff.length})
          </AppText>

          {activeStaff.length > 0 ? (
            activeStaff.map((member) => (
              <ThemedView key={member.id} type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                      👤 {member.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      📞 {member.phone}
                    </AppText>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppText variant="caption" style={{ color: '#10B981', fontWeight: '800' }}>
                      Active
                    </AppText>
                    <Switch
                      value={member.isActive}
                      onValueChange={(val) => handleToggleActive(member, val)}
                      trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </ThemedView>
            ))
          ) : (
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                No active delivery staff members. Tap + Add Staff to add staff.
              </AppText>
            </ThemedView>
          )}
        </View>

        {/* Inactive Staff Section */}
        {inactiveStaff.length > 0 && (
          <View style={{ gap: Spacing.two }}>
            <AppText variant="caption" style={styles.sectionHeader}>
              INACTIVE STAFF MEMBERS ({inactiveStaff.length})
            </AppText>

            {inactiveStaff.map((member) => (
              <ThemedView key={member.id} type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="subtitle" style={{ fontWeight: '700', color: theme.textSecondary }}>
                      👤 {member.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      📞 {member.phone}
                    </AppText>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AppText variant="caption" style={{ color: '#6B7280', fontWeight: '700' }}>
                      Inactive
                    </AppText>
                    <Switch
                      value={member.isActive}
                      onValueChange={(val) => handleToggleActive(member, val)}
                      trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </ThemedView>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Staff Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              Add Delivery Staff Member
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingVertical: Spacing.two }}>
              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Staff Member Name *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor={theme.textSecondary}
                  value={staffName}
                  onChangeText={setStaffName}
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Phone Number *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={theme.textSecondary}
                  value={staffPhone}
                  onChangeText={setStaffPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {formError && (
                <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                  ⚠️ {formError}
                </AppText>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" variant="secondary" onPress={() => setModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={isSubmitting ? 'Saving...' : 'Save Staff'}
                  variant="primary"
                  onPress={handleSaveStaff}
                />
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
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    marginTop: 4,
    fontSize: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
