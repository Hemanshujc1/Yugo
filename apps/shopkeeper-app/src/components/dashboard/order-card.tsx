import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, Button, StockStatusBadge, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import type { Order } from '@/types/order';

export interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onMarkReady?: () => void;
  onStartDelivery?: () => void;
  onMarkPickedUp?: () => void;
  onSimulateRider?: () => void;
  onMarkDelivered?: () => void;
}

function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  } catch {
    return 'Recent';
  }
}

export function OrderCard({
  order,
  onPress,
  onAccept,
  onReject,
  onMarkReady,
  onStartDelivery,
  onMarkPickedUp,
  onSimulateRider,
  onMarkDelivered,
}: OrderCardProps) {
  const theme = useTheme();

  // Frontend countdown simulation for NEW orders (30 second timer window)
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (order?.orderStatus !== 'new') return 0;
    const createdAt = new Date(order.createdAt).getTime();
    const elapsed = Math.floor((Date.now() - createdAt) / 1000);
    return Math.max(0, 30 - (elapsed % 30));
  });

  useEffect(() => {
    if (order?.orderStatus !== 'new') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.orderStatus]);

  const itemCount = Array.isArray(order?.items)
    ? order.items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
    : 0;
  const customerName =
    typeof order?.customer === 'string' ? order.customer : order?.customer?.name || 'Customer';

  const fulfillmentMethod =
    order?.deliveryDetails?.fulfillmentMethod ||
    (order?.deliveryType === 'Pickup' ? 'customer_pickup' : 'yugo_partner');

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
        {/* Header Row: Order Number & Status Badge */}
        <View style={styles.headerRow}>
          <View style={styles.numberWrapper}>
            <AppText variant="h3" style={styles.orderNumber}>
              {order?.orderNumber || order?.id || 'Order'}
            </AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {getTimeAgo(order?.createdAt || '')}
            </AppText>
          </View>
          <StockStatusBadge status={order?.orderStatus || 'new'} />
        </View>

        {/* Acceptance Countdown Banner for NEW Orders */}
        {order?.orderStatus === 'new' && (
          <View
            style={[
              styles.countdownBox,
              { backgroundColor: secondsLeft > 0 ? '#FEF7E0' : '#FEE2E2' },
            ]}
          >
            <AppText
              variant="caption"
              style={{
                fontWeight: '700',
                color: secondsLeft > 0 ? '#B06000' : '#DC2626',
              }}
            >
              {secondsLeft > 0
                ? `⏱️ Accept within 00:${secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}`
                : '⚠️ Acceptance Urgent • Requires Attention'}
            </AppText>
          </View>
        )}

        {/* Customer & Items Meta */}
        <View style={styles.customerRow}>
          <AppText variant="subtitle" style={{ fontWeight: '700' }} numberOfLines={1}>
            {customerName}
          </AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} • ` : ''}
            {fulfillmentMethod === 'customer_pickup'
              ? 'Store Pickup'
              : fulfillmentMethod === 'self_delivery'
                ? 'Self Delivery'
                : 'YuGo Delivery'}
          </AppText>

          {order?.deliveryDetails?.partner ? (
            <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '600', marginTop: 2 }}>
              🚚 Rider: {order.deliveryDetails.partner.name}
            </AppText>
          ) : fulfillmentMethod === 'self_delivery' ? (
            <AppText variant="caption" style={{ color: '#6D28D9', fontWeight: '600', marginTop: 2 }}>
              📦 Self Delivery (Shopkeeper)
            </AppText>
          ) : fulfillmentMethod === 'yugo_partner' && order?.orderStatus !== 'cancelled' ? (
            <AppText variant="caption" style={{ color: '#F59E0B', fontWeight: '600', marginTop: 2 }}>
              🔍 Finding YuGo Delivery Partner...
            </AppText>
          ) : null}
        </View>

        {/* Financial Row: Total & Payment Badge */}
        <View style={styles.amountRow}>
          <View style={styles.priceGroup}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Total Amount
            </AppText>
            <AppText variant="h3" style={{ fontWeight: '800', color: theme.text }}>
              {typeof order?.total === 'number' ? `₹${order.total}` : '₹0'}
            </AppText>
          </View>
          <View
            style={[
              styles.paymentBadge,
              { backgroundColor: order?.paymentStatus === 'Paid' ? '#E6F4EA' : '#FEF7E0' },
            ]}
          >
            <AppText
              variant="caption"
              style={{
                fontWeight: '700',
                color: order?.paymentStatus === 'Paid' ? '#137333' : '#B06000',
              }}
            >
              {order?.paymentMethod || 'COD'} • {order?.paymentStatus || 'Pending'}
            </AppText>
          </View>
        </View>

        {/* Dynamic Action Bar */}
        <View style={styles.actionBar}>
          {order?.orderStatus === 'new' && onAccept && onReject ? (
            <View style={styles.dualActionRow}>
              <View style={styles.actionBtnFlex}>
                <Button
                  title="Reject"
                  variant="danger"
                  size="sm"
                  onPress={(e) => {
                    e.stopPropagation();
                    onReject();
                  }}
                />
              </View>
              <View style={styles.actionBtnFlex}>
                <Button
                  title="Accept Order"
                  variant="primary"
                  size="sm"
                  onPress={(e) => {
                    e.stopPropagation();
                    onAccept();
                  }}
                />
              </View>
            </View>
          ) : order?.orderStatus === 'preparing' && onMarkReady ? (
            <View style={styles.singleActionRow}>
              <Button
                title="Mark Ready for Pickup"
                variant="primary"
                size="sm"
                onPress={(e) => {
                  e.stopPropagation();
                  onMarkReady();
                }}
              />
            </View>
          ) : order?.orderStatus === 'ready_for_pickup' ? (
            fulfillmentMethod === 'self_delivery' && onStartDelivery ? (
              <View style={styles.singleActionRow}>
                <Button
                  title="Start Delivery"
                  variant="primary"
                  size="sm"
                  onPress={(e) => {
                    e.stopPropagation();
                    onStartDelivery();
                  }}
                />
              </View>
            ) : fulfillmentMethod === 'customer_pickup' && onMarkPickedUp ? (
              <View style={styles.singleActionRow}>
                <Button
                  title="Complete Customer Pickup"
                  variant="primary"
                  size="sm"
                  onPress={(e) => {
                    e.stopPropagation();
                    onMarkPickedUp();
                  }}
                />
              </View>
            ) : order?.deliveryDetails?.partner && onMarkPickedUp ? (
              <View style={styles.singleActionRow}>
                <Button
                  title="Mark as Picked Up by Rider"
                  variant="primary"
                  size="sm"
                  onPress={(e) => {
                    e.stopPropagation();
                    onMarkPickedUp();
                  }}
                />
              </View>
            ) : onSimulateRider ? (
              <View style={styles.singleActionRow}>
                <Button
                  title="Simulate Rider Acceptance"
                  variant="secondary"
                  size="sm"
                  onPress={(e) => {
                    e.stopPropagation();
                    onSimulateRider();
                  }}
                />
              </View>
            ) : (
              <View style={styles.singleActionRow}>
                <Button title="View Details" variant="secondary" size="sm" onPress={onPress} />
              </View>
            )
          ) : order?.orderStatus === 'out_for_delivery' && onMarkDelivered ? (
            <View style={styles.singleActionRow}>
              <Button
                title="Mark Delivered"
                variant="primary"
                size="sm"
                onPress={(e) => {
                  e.stopPropagation();
                  onMarkDelivered();
                }}
              />
            </View>
          ) : (
            <View style={styles.singleActionRow}>
              <Button title="View Details" variant="secondary" size="sm" onPress={onPress} />
            </View>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  numberWrapper: {
    flex: 1,
  },
  orderNumber: {
    fontWeight: '800',
  },
  countdownBox: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  customerRow: {
    gap: 2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF22',
    paddingTop: Spacing.two,
  },
  priceGroup: {
    gap: 2,
  },
  paymentBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionBar: {
    marginTop: Spacing.one,
    width: '100%',
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  singleActionRow: {
    width: '100%',
  },
  actionBtnFlex: {
    flex: 1,
  },
});
