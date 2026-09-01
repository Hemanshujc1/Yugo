import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './ui/text';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase().trim();

  let label = status;
  let bgColor = '#F3F4F6';
  let textColor = '#374151';

  if (normalized === 'new') {
    label = 'NEW ORDER';
    bgColor = '#FEE2E2';
    textColor = '#DC2626';
  } else if (normalized === 'accepted') {
    label = 'ACCEPTED';
    bgColor = '#DBEAFE';
    textColor = '#1D4ED8';
  } else if (normalized === 'preparing') {
    label = 'PREPARING';
    bgColor = '#FEF3C7';
    textColor = '#D97706';
  } else if (normalized === 'ready_for_pickup' || normalized === 'ready') {
    label = 'READY FOR PICKUP';
    bgColor = '#E0F2FE';
    textColor = '#0284C7';
  } else if (normalized === 'out_for_delivery') {
    label = 'OUT FOR DELIVERY';
    bgColor = '#F3E8FF';
    textColor = '#7E22CE';
  } else if (normalized === 'delivered' || normalized === 'paid' || normalized === 'in_stock') {
    label = normalized === 'in_stock' ? 'IN STOCK' : normalized.toUpperCase();
    bgColor = '#E6F4EA';
    textColor = '#10B981';
  } else if (normalized === 'cancelled' || normalized === 'out_of_stock' || normalized === 'failed') {
    label = normalized === 'out_of_stock' ? 'OUT OF STOCK' : normalized.toUpperCase();
    bgColor = '#FEE2E2';
    textColor = '#DC2626';
  } else if (normalized === 'low_stock' || normalized === 'pending') {
    label = normalized === 'low_stock' ? 'LOW STOCK' : 'PENDING';
    bgColor = '#FEF3C7';
    textColor = '#D97706';
  } else if (normalized === 'refunded' || normalized === 'partially_returned' || normalized === 'fully_returned') {
    label = normalized.replace('_', ' ').toUpperCase();
    bgColor = '#F3F4F6';
    textColor = '#6B7280';
  }

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isSmall && styles.badgeSm]}>
      <AppText variant="caption" style={{ color: textColor, fontWeight: '800', fontSize: isSmall ? 10 : 11 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
