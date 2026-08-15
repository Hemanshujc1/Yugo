import { StyleSheet, ScrollView } from 'react-native';
import { Screen, PageHeader, ThemedView, AppText } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function CustomersScreen() {
  const theme = useTheme();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Customers"
          subtitle="View customer profiles, contact history, and ordering trends."
        />

        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={{ fontWeight: '700' }}>Active Customer Network</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            Customer analytics, recent activity logs, and loyalty tiers will populate as orders progress.
          </AppText>
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
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.two,
  },
});
