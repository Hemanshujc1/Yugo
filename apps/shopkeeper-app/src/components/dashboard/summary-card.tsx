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
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.iconOuter}>
        <View style={[styles.iconContainer, { backgroundColor: `${tint}20` }]}> 
          <SymbolView name={icon as any} size={20} tintColor={tint} />
        </View>
      </View>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="h2" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" style={[styles.detail, { color: theme.textSecondary }]}> 
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
  iconOuter: {
    alignItems: 'flex-end',
  },
  iconContainer: {
    height: 40,
    width: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    lineHeight: 24,
  },
  value: {
    marginTop: Spacing.one,
  },
  detail: {
    marginTop: Spacing.one,
  },
});
