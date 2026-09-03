import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  return (
    <ThemedView type="backgroundElement" style={styles.header}>
      <View style={styles.profileRow}>
        <View style={styles.profileText}>
          <AppText variant="h3">{shopName}</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {greeting}
          </AppText>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={styles.avatar}>
          <SymbolView name={{ ios: 'person.circle.fill', android: 'person', web: 'person' }} size={32} tintColor={theme.text} />
        </Pressable>
      </View>
      <View style={styles.bottomRow}>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          {date}
        </AppText>
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
  notificationButtonWrapper: {
    position: 'relative',
  },
  notificationButton: {
    borderRadius: 16,
    padding: Spacing.two,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
