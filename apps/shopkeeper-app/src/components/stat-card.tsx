import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './ui/text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export function StatCard({ title, value, subtitle, accentColor, style }: StatCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderLeftColor: accentColor || '#2563EB',
          borderLeftWidth: accentColor ? 4 : 0,
        },
        style,
      ]}
    >
      <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '500' }} numberOfLines={1}>
        {title}
      </AppText>
      <AppText variant="h2" style={[styles.valueText, { color: accentColor || theme.text }]}>
        {value}
      </AppText>
      {Boolean(subtitle) && (
        <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11 }} numberOfLines={1}>
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 16,
    padding: Spacing.three,
    gap: Spacing.one,
    minHeight: 88,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#9CA3AF22',
  },
  valueText: {
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 28,
  },
});
