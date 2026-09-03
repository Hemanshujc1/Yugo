import React from 'react';
import { StyleSheet, View, ScrollView, Modal, Pressable } from 'react-native';

import { AppText, Button, ThemedView } from '@/components';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';

export interface ImportHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ImportHistoryModal({ visible, onClose }: ImportHistoryModalProps) {
  const theme = useTheme();
  const { importHistory } = useProducts();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ThemedView type="backgroundElement" style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <AppText variant="h3" style={{ fontWeight: '800' }}>
                Inventory Import History
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Audit log of previous Excel / CSV bulk imports
              </AppText>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <AppText variant="subtitle" style={{ color: theme.textSecondary, fontWeight: '700' }}>
                ✕
              </AppText>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {importHistory.length > 0 ? (
              importHistory.map((item) => (
                <View key={item.id} style={[styles.historyCard, { borderColor: '#9CA3AF22' }]}>
                  <View style={styles.historyHeader}>
                    <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                      📁 {item.fileName}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {item.date}
                    </AppText>
                  </View>

                  <View style={styles.statsRow}>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      Processed: <AppText variant="caption" style={{ fontWeight: '700' }}>{item.totalProcessed}</AppText>
                    </AppText>
                    <AppText variant="caption" style={{ color: '#10B981', fontWeight: '700' }}>
                      +{item.added} Added
                    </AppText>
                    <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                      {item.updated} Updated
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.textSecondary }}>
                      {item.skipped} Skipped
                    </AppText>
                  </View>
                </View>
              ))
            ) : (
              <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.four }}>
                No bulk imports recorded yet.
              </AppText>
            )}
          </ScrollView>

          <Button title="Close History" variant="secondary" onPress={onClose} />
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
    maxHeight: '75%',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: '#9CA3AF33',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyCard: {
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: Spacing.two,
    gap: Spacing.one,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
});
