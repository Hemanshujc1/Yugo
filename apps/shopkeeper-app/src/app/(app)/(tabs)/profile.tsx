import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { AppText, Screen, ThemedView, Button, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
      >
        {/* Compact Consistent Page Header */}
        <PageHeader
          title="Profile"
          subtitle="View your account, settings, and shop preferences."
        />

        {user && (
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <AppText variant="subtitle" style={styles.sectionTitle}>Shopkeeper Account</AppText>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Name</AppText>
              <AppText variant="body" style={styles.infoVal}>{user.name}</AppText>
            </View>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Email</AppText>
              <AppText variant="body" style={styles.infoVal}>{user.email}</AppText>
            </View>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Shop Name</AppText>
              <AppText variant="body" style={styles.infoVal}>{user.shopName}</AppText>
            </View>

            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Role</AppText>
              <AppText variant="body" style={[styles.infoVal, { textTransform: 'capitalize' }]}>{user.role}</AppText>
            </View>
          </ThemedView>
        )}

        <Button
          variant="secondary"
          title="Logout"
          onPress={logout}
        />
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
    gap: Spacing.two,
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
});
