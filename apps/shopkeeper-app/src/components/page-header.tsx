import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './ui/text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function PageHeader({ title, subtitle, action, style }: PageHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleWrapper}>
        <AppText variant="h2" style={styles.titleText}>
          {title}
        </AppText>
        {Boolean(subtitle) && (
          <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: Spacing.one }}>
            {subtitle}
          </AppText>
        )}
      </View>
      {Boolean(action) && <View style={styles.actionWrapper}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    gap: Spacing.two,
    width: '100%',
  },
  titleWrapper: {
    flex: 1,
  },
  titleText: {
    fontWeight: '700',
  },
  actionWrapper: {
    flexShrink: 0,
  },
});
