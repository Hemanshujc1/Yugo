import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView, PageHeader, SearchBar } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supplierService } from '@/services/supplier-service';
import { Supplier } from '@/types/supplier';

export default function SuppliersScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Add / Edit Supplier
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    supplierService
      .getSuppliers(searchQuery)
      .then((res) => {
        if (isMounted) {
          setSuppliers(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load suppliers:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormCity('Bengaluru');
    setFormNotes('');
    setFormError(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormName(supplier.name);
    setFormPhone(supplier.phone);
    setFormEmail(supplier.email || '');
    setFormAddress(supplier.address);
    setFormCity(supplier.city);
    setFormNotes(supplier.notes || '');
    setFormError(null);
    setModalVisible(true);
  };

  const handleSaveSupplier = async () => {
    setFormError(null);
    if (!formName.trim()) {
      setFormError('Supplier Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, {
          name: formName,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          city: formCity,
          notes: formNotes,
        });
      } else {
        await supplierService.createSupplier({
          name: formName,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          city: formCity,
          notes: formNotes,
        });
      }

      setModalVisible(false);
      const res = await supplierService.getSuppliers(searchQuery);
      setSuppliers(res);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Suppliers' }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          showBack
          title="Supplier Directory"
          subtitle="Manage vendor contacts and procurement sources for incoming stock."
          action={
            <Button
              title="+ Add Supplier"
              variant="primary"
              size="sm"
              onPress={handleOpenAddModal}
            />
          }
        />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search suppliers by Name, Phone, or City..."
        />

        {/* Suppliers List */}
        {!loading && suppliers.length > 0 ? (
          <View style={{ gap: Spacing.three }}>
            {suppliers.map((supplier) => {
              const lastDateStr = supplier.lastReceivedAt
                ? new Date(supplier.lastReceivedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : 'No receipts yet';

              return (
                <ThemedView key={supplier.id} type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                  <Pressable
                    style={{ flex: 1 }}
                    onPress={() =>
                      router.push({
                        pathname: '/supplier-details' as any,
                        params: { supplierId: supplier.id },
                      })
                    }
                  >
                    <View style={styles.cardHeaderRow}>
                      <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                        {supplier.name}
                      </AppText>
                      <Pressable
                        style={styles.editBtn}
                        onPress={() => handleOpenEditModal(supplier)}
                      >
                        <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                          Edit
                        </AppText>
                      </Pressable>
                    </View>

                    <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '600', marginTop: 2 }}>
                      📞 {supplier.phone || 'No phone'} • 📍 {supplier.city}
                    </AppText>

                    <View style={styles.metricsRow}>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {supplier.receiptCount} receipts • Total: ₹{supplier.totalPurchaseValue.toLocaleString('en-IN')}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
                        Last: {lastDateStr}
                      </AppText>
                    </View>
                  </Pressable>

                  <View style={{ marginTop: Spacing.two, borderTopWidth: 1, borderTopColor: '#9CA3AF22', paddingTop: Spacing.two }}>
                    <Button
                      title="Record Stock Received"
                      variant="secondary"
                      size="sm"
                      onPress={() =>
                        router.push({
                          pathname: '/receive-stock' as any,
                          params: { supplierId: supplier.id },
                        })
                      }
                    />
                  </View>
                </ThemedView>
              );
            })}
          </View>
        ) : !loading ? (
          <ThemedView type="backgroundElement" style={styles.emptyCard}>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>
              No Suppliers Found
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              {searchQuery
                ? `No suppliers match "${searchQuery}".`
                : 'Add suppliers to quickly record incoming stock receipts.'}
            </AppText>
            <Button title="+ Add New Supplier" variant="primary" size="sm" onPress={handleOpenAddModal} />
          </ThemedView>
        ) : null}
      </ScrollView>

      {/* Add / Edit Supplier Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            <AppText variant="h3" style={{ fontWeight: '800' }}>
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </AppText>

            <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingVertical: Spacing.two }}>
              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Supplier Name *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. Shree Traders"
                  placeholderTextColor={theme.textSecondary}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Phone Number
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor={theme.textSecondary}
                  value={formPhone}
                  onChangeText={setFormPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Email Address
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. orders@supplier.com"
                  placeholderTextColor={theme.textSecondary}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  keyboardType="email-address"
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  City
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="e.g. Bengaluru"
                  placeholderTextColor={theme.textSecondary}
                  value={formCity}
                  onChangeText={setFormCity}
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Address
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="Street address or wholesale market block"
                  placeholderTextColor={theme.textSecondary}
                  value={formAddress}
                  onChangeText={setFormAddress}
                />
              </View>

              <View>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Notes (Optional)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary, height: 60 }]}
                  placeholder="e.g. Delivers every Tuesday"
                  placeholderTextColor={theme.textSecondary}
                  value={formNotes}
                  onChangeText={setFormNotes}
                  multiline
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
                  title={isSubmitting ? 'Saving...' : 'Save Supplier'}
                  variant="primary"
                  onPress={handleSaveSupplier}
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
  searchInput: {
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
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
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
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
    maxHeight: '85%',
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
