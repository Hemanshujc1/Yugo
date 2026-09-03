import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AppText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface SummaryCardProps {
  title: string;
  value: string;
  detail: string;
  icon: { ios: string; android: string; web: string };
  tint: string;
}

export function SummaryCard({ title, value, detail, icon, tint }: SummaryCardProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
      <View style={styles.headerRow}>
        <AppText variant="caption" style={[styles.title, { color: theme.textSecondary }]} numberOfLines={2}>
          {title}
        </AppText>
        <View style={[styles.iconContainer, { backgroundColor: `${tint}20` }]}>
          <SymbolView name={icon as any} size={18} tintColor={tint} />
        </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.one,
  },
  iconContainer: {
    height: 32,
    width: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontWeight: '500',
  },
  value: {
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 26,
    marginVertical: Spacing.one,
  },
});
