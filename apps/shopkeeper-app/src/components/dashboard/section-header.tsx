import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="h3">{title}</AppText>
      <AppText variant="caption" style={[styles.subtitle, { color: theme.textSecondary }]}> 
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  subtitle: {
    lineHeight: 20,
  },
});
