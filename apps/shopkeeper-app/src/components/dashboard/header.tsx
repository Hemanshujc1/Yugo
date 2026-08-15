import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AppText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function DashboardHeader({
  shopName,
  greeting,
  date,
}: {
  shopName: string;
  greeting: string;
  date: string;
}) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.header}>
      <View style={styles.profileRow}>
        <View style={styles.profileText}>
          <AppText variant="h3">{shopName}</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {greeting}
          </AppText>
        </View>
        <View style={styles.avatar}>
          <SymbolView name={{ ios: 'person.circle.fill', android: 'person', web: 'person' }} size={32} tintColor={theme.text} />
        </View>
      </View>
      <View style={styles.bottomRow}>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          {date}
        </AppText>
        <ThemedView type="backgroundSelected" style={styles.notificationButton}>
          <SymbolView name={{ ios: 'bell.fill', android: 'notifications', web: 'notifications' } as any} size={18} tintColor={theme.text} />
        </ThemedView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileText: {
    flex: 1,
    gap: Spacing.one,
    paddingRight: Spacing.two,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationButton: {
    borderRadius: 16,
    padding: Spacing.two,
  },
});
