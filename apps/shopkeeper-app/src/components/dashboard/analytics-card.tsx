import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AppText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface AnalyticsCardProps {
  title: string;
  value: string;
  detail: string;
  icon: { ios: string; android: string; web: string };
}

export function AnalyticsCard({ title, value, detail, icon }: AnalyticsCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.row}>
        <AppText variant="subtitle">{title}</AppText>
        <SymbolView name={icon as any} size={16} tintColor={theme.text} />
      </View>
      <AppText variant="h2" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" style={{ color: theme.textSecondary }}>
        {detail}
      </AppText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
});
