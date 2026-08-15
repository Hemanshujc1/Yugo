import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { AppText, Button, Screen, ThemedView, StockStatusBadge, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks';

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = typeof params.orderId === 'string' ? params.orderId : Array.isArray(params.orderId) ? params.orderId[0] : '';

  const { orders, acceptOrder, rejectOrder, markOrderReady, updateOrderStatus } = useOrders();

  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return (
      <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Order Details' }} />
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h2">Order Not Found</AppText>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {`No order matching ID "${orderId}" was found.`}
          </AppText>
          <Button title="Back to Orders Queue" variant="primary" onPress={() => router.replace('/orders')} />
        </ThemedView>
      </Screen>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Order Details' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title Bar */}
        <PageHeader
          title={`Order ${order.orderNumber}`}
          subtitle={`Placed on ${formattedDate}`}
          action={<StockStatusBadge status={order.orderStatus} />}
        />

        {/* Customer Information Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Customer Information</AppText>
          
          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Customer Name</AppText>
            <AppText variant="subtitle" style={{ fontWeight: '700' }}>{order.customer.name}</AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Contact Phone</AppText>
            <AppText variant="body" style={{ fontWeight: '600', color: '#2563EB' }}>{order.customer.phone}</AppText>
          </View>

          <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start', gap: 2 }]}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Delivery Address</AppText>
            <AppText variant="body" style={{ fontWeight: '500' }}>
              {order.customer.address}, {order.customer.city}
            </AppText>
          </View>
        </ThemedView>

        {/* Items Breakdown Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Ordered Items ({order.items.length})</AppText>

          {order.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <View style={styles.itemMeta}>
                <AppText variant="subtitle" style={{ fontWeight: '700' }} numberOfLines={1}>
                  {item.productName}
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  {item.quantity} × ₹{item.unitPrice}
                </AppText>
              </View>
              <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                ₹{item.finalPrice}
              </AppText>
            </View>
          ))}
        </ThemedView>

        {/* Bill Breakup Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Bill Breakup</AppText>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Subtotal</AppText>
            <AppText variant="body" style={{ fontWeight: '600' }}>₹{order.subtotal}</AppText>
          </View>

          {order.discount > 0 && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Discount</AppText>
              <AppText variant="body" style={{ fontWeight: '600', color: '#EF4444' }}>-₹{order.discount}</AppText>
            </View>
          )}

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Delivery Fee</AppText>
            <AppText variant="body" style={{ fontWeight: '600' }}>₹{order.deliveryFee}</AppText>
          </View>

          {order.tax > 0 && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Taxes & Charges</AppText>
              <AppText variant="body" style={{ fontWeight: '600' }}>₹{order.tax}</AppText>
            </View>
          )}

          <View style={[styles.infoRow, styles.totalRow]}>
            <AppText variant="h3">Total Amount</AppText>
            <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
              ₹{order.total}
            </AppText>
          </View>
        </ThemedView>

        {/* Payment & Delivery Partner Metadata Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Payment & Logistics</AppText>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Payment Method</AppText>
            <AppText variant="body" style={{ fontWeight: '700' }}>{order.paymentMethod}</AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Payment Status</AppText>
            <AppText
              variant="body"
              style={{ fontWeight: '700', color: order.paymentStatus === 'Paid' ? '#10B981' : '#F59E0B' }}
            >
              {order.paymentStatus}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>Fulfillment Type</AppText>
            <AppText variant="body" style={{ fontWeight: '600' }}>{order.deliveryType}</AppText>
          </View>

          {order.deliveryPartner && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>Delivery Agent</AppText>
              <AppText variant="body" style={{ fontWeight: '600' }}>
                {order.deliveryPartner.name} ({order.deliveryPartner.type})
              </AppText>
            </View>
          )}
        </ThemedView>

        {/* Order Lifecycle Visual Timeline */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>Order Progress Timeline</AppText>

          <View style={styles.timelineList}>
            {order.timeline.map((item, idx) => {
              const isCancelled = item.status === 'cancelled';
              const dotColor = isCancelled ? '#EF4444' : item.completed ? '#10B981' : '#D1D5DB';
              const lineColor = isCancelled ? '#EF4444' : item.completed ? '#10B981' : '#E5E7EB';
              const textColor = isCancelled ? '#EF4444' : item.completed ? theme.text : theme.textSecondary;

              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineIconCol}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: dotColor },
                      ]}
                    />
                    {idx < order.timeline.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: lineColor },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <AppText
                      variant="subtitle"
                      style={{
                        fontWeight: item.completed || isCancelled ? '700' : '500',
                        color: textColor,
                      }}
                    >
                      {item.label}
                    </AppText>
                    <AppText variant="caption" style={{ color: isCancelled ? '#EF4444' : theme.textSecondary }}>
                      {item.timestamp}{isCancelled && order.cancellationReason ? ` • ${order.cancellationReason}` : ''}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        </ThemedView>

        {/* Dynamic Contextual Action Bar */}
        <View style={styles.actionSection}>
          {order.orderStatus === 'new' && (
            <View style={styles.dualActionRow}>
              <View style={styles.btnFlex}>
                <Button
                  title="Reject Order"
                  variant="danger"
                  onPress={() => {
                    rejectOrder(order.id);
                    router.replace('/orders');
                  }}
                />
              </View>
              <View style={styles.btnFlex}>
                <Button
                  title="Accept Order"
                  variant="primary"
                  onPress={() => {
                    acceptOrder(order.id);
                  }}
                />
              </View>
            </View>
          )}

          {order.orderStatus === 'preparing' && (
            <Button
              title="Mark Ready for Pickup"
              variant="primary"
              onPress={() => {
                markOrderReady(order.id);
              }}
            />
          )}

          {order.orderStatus === 'ready_for_pickup' && (
            <Button
              title="Dispatch for Delivery"
              variant="primary"
              onPress={() => {
                updateOrderStatus(order.id, 'out_for_delivery');
              }}
            />
          )}

          {order.orderStatus === 'out_for_delivery' && (
            <Button
              title="Mark Delivered"
              variant="primary"
              onPress={() => {
                updateOrderStatus(order.id, 'delivered');
              }}
            />
          )}

          <Button
            title="Back to Orders Queue"
            variant="secondary"
            onPress={() => router.replace('/orders')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    borderWidth: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF44',
    paddingBottom: Spacing.one,
    marginBottom: Spacing.one,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  itemMeta: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#9CA3AF44',
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  timelineList: {
    gap: Spacing.two,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  timelineIconCol: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.two,
  },
  actionSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  btnFlex: {
    flex: 1,
  },
});
