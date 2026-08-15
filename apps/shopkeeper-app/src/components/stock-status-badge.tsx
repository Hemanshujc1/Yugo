import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './ui/text';
import { Spacing } from '@/constants/theme';

export type StatusType =
  | 'In Stock'
  | 'Low stock'
  | 'Out of stock'
  | 'Unavailable'
  | 'new'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | string;

export interface StockStatusBadgeProps {
  status: StatusType;
  style?: ViewStyle;
}

export function StockStatusBadge({ status, style }: StockStatusBadgeProps) {
  const normalized = (status || '').toLowerCase().trim();

  let bg = '#E6F4EA';
  let border = '#34A85344';
  let text = '#137333';
  let label = 'IN STOCK';

  // Product Stock States
  if (normalized.includes('low')) {
    bg = '#FEF7E0';
    border = '#FBBC0444';
    text = '#B06000';
    label = 'LOW STOCK';
  } else if (normalized.includes('out of stock')) {
    bg = '#FCE8E6';
    border = '#EA433544';
    text = '#C5221F';
    label = 'OUT OF STOCK';
  } else if (normalized.includes('unavail')) {
    bg = '#F1F3F4';
    border = '#9CA3AF44';
    text = '#5F6368';
    label = 'UNAVAILABLE';
  }
  // Order Queue States
  else if (normalized === 'new') {
    bg = '#EFF6FF';
    border = '#2563EB44';
    text = '#1D4ED8';
    label = 'NEW';
  } else if (normalized === 'preparing') {
    bg = '#FEF3C7';
    border = '#F59E0B44';
    text = '#B45309';
    label = 'PREPARING';
  } else if (normalized.includes('ready')) {
    bg = '#F3E8FF';
    border = '#7C3AED44';
    text = '#6D28D9';
    label = 'READY FOR PICKUP';
  } else if (normalized.includes('out_for_delivery') || normalized.includes('out for delivery')) {
    bg = '#E0F2FE';
    border = '#0284C744';
    text = '#0369A1';
    label = 'OUT FOR DELIVERY';
  } else if (normalized === 'delivered' || normalized === 'completed') {
    bg = '#E6F4EA';
    border = '#34A85344';
    text = '#137333';
    label = 'DELIVERED';
  } else if (normalized === 'cancelled' || normalized === 'rejected') {
    bg = '#FCE8E6';
    border = '#EA433544';
    text = '#C5221F';
    label = 'CANCELLED';
  } else if (status === 'In Stock') {
    label = 'IN STOCK';
  } else {
    label = status.toUpperCase();
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <AppText variant="caption" style={[styles.badgeText, { color: text }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
