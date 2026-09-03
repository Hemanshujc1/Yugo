import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { AppText } from './ui/text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
  selected?: boolean;
}

export function StatCard({ title, value, subtitle, accentColor, style, onPress, selected }: StatCardProps) {
  const theme = useTheme();

  const cardContent = (
    <>
      <AppText variant="caption" style={{ color: theme.textSecondary, fontWeight: '600' }} numberOfLines={1}>
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
    </>
  );

  const cardStyle = [
    styles.card,
    {
      backgroundColor: selected ? `${accentColor || '#2563EB'}15` : theme.backgroundElement,
      borderLeftColor: accentColor || '#2563EB',
      borderLeftWidth: accentColor ? 4 : 0,
      borderColor: selected ? (accentColor || '#2563EB') : '#9CA3AF22',
      borderWidth: selected ? 2 : 1,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable style={cardStyle} onPress={onPress}>
        {cardContent}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{cardContent}</View>;
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
