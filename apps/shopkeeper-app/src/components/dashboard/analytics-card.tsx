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
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
      <View style={styles.row}>
        <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '500' }} numberOfLines={1}>
          {title}
        </AppText>
        <SymbolView name={icon as any} size={16} tintColor={theme.textSecondary} />
      </View>
      <AppText variant="h2" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }}>
        {detail}
      </AppText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 26,
    marginVertical: Spacing.one,
  },
});
