import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppText, Button, Screen, ThemedView, StockStatusBadge, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useOrders } from '@/hooks';

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId =
    typeof params.orderId === 'string'
      ? params.orderId
      : Array.isArray(params.orderId)
        ? params.orderId[0]
        : '';

  const {
    orders,
    deliveryConfig,
    activeSelfDeliveryCount,
    acceptOrder,
    rejectOrder,
    markOrderReady,
    simulateRiderAcceptance,
    updateDeliveryStatus,
    overrideOrderDeliveryProvider,
    markDeliveryPickedUp,
  } = useOrders();

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
          <Button
            title="Back to Orders Queue"
            variant="primary"
            onPress={() => router.replace('/orders')}
          />
        </ThemedView>
      </Screen>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const isCancelled = order.orderStatus === 'cancelled';
  const isDelivered = order.orderStatus === 'delivered';

  // Fulfillment Method resolution
  const fulfillmentMethod =
    order.deliveryDetails?.fulfillmentMethod ||
    (order.deliveryType === 'Pickup'
      ? 'customer_pickup'
      : order.deliveryPartner
        ? 'yugo_partner'
        : 'yugo_partner');

  const isOverride = Boolean(order.deliveryDetails?.providerOverride);

  // Delivery status label
  const deliveryStatusLabel =
    isCancelled
      ? 'Cancelled'
      : isDelivered || order.deliveryDetails?.status === 'delivered'
        ? 'Delivered'
        : order.deliveryDetails?.status === 'out_for_delivery' || order.orderStatus === 'out_for_delivery'
          ? 'Out for Delivery'
          : order.deliveryDetails?.status === 'assigned' || order.deliveryDetails?.partner
            ? 'Assigned'
            : fulfillmentMethod === 'customer_pickup'
              ? 'Waiting for Customer Pickup'
              : fulfillmentMethod === 'self_delivery'
                ? 'Shopkeeper Delivery'
                : 'Finding a Delivery Partner';

  // Provider locking rule: provider cannot be overridden once assigned, out for delivery, delivered, or cancelled
  const isProviderLocked =
    isCancelled ||
    isDelivered ||
    order.orderStatus === 'out_for_delivery' ||
    order.deliveryDetails?.status === 'assigned' ||
    order.deliveryDetails?.status === 'out_for_delivery' ||
    order.deliveryDetails?.status === 'delivered' ||
    Boolean(order.deliveryDetails?.partner);

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
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Customer Information
          </AppText>

          <View style={styles.infoBlock}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Customer Name
            </AppText>
            <AppText variant="subtitle" style={{ fontWeight: '700', marginTop: 2 }}>
              {order.customer.name}
            </AppText>
          </View>

          <View style={styles.infoBlock}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Contact Phone
            </AppText>
            <AppText variant="body" style={{ fontWeight: '600', color: '#2563EB', marginTop: 2 }}>
              {order.customer.phone}
            </AppText>
          </View>

          <View style={styles.infoBlock}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Delivery Address
            </AppText>
            <AppText variant="body" style={{ fontWeight: '500', marginTop: 2 }}>
              {order.customer.address}, {order.customer.city}
            </AppText>
          </View>
        </ThemedView>

        {/* Dedicated Delivery & Fulfillment Section */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <View style={styles.cardHeaderWrapper}>
            <AppText variant="subtitle" style={styles.sectionTitleNoMargin}>
              Delivery Management
            </AppText>
            <StockStatusBadge
              status={
                fulfillmentMethod === 'yugo_partner'
                  ? 'new'
                  : fulfillmentMethod === 'self_delivery'
                    ? 'ready_for_pickup'
                    : 'delivered'
              }
            />
          </View>

          <View style={styles.divider} />

          {/* Fulfillment Method Block */}
          <View style={styles.infoBlock}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Fulfillment Method
            </AppText>
            <AppText variant="body" style={styles.valueTextBold}>
              {fulfillmentMethod === 'yugo_partner'
                ? 'YuGo Delivery Partner'
                : fulfillmentMethod === 'self_delivery'
                  ? 'Self Delivery (Shopkeeper)'
                  : 'Customer Store Pickup'}
            </AppText>

            {/* Smart Delivery vs Manual Override Indicator */}
            {isOverride ? (
              <AppText variant="caption" style={{ color: '#6D28D9', fontWeight: '600', marginTop: 2 }}>
                🎯 Manual Order Override (Shop-level strategy bypassed for this order)
              </AppText>
            ) : deliveryConfig.deliveryMode === 'smart_delivery' && fulfillmentMethod !== 'customer_pickup' ? (
              <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '600', marginTop: 2 }}>
                ⚡ Strategy: Smart Delivery (Workload: {activeSelfDeliveryCount}/{deliveryConfig.smartDeliveryThreshold || 3})
              </AppText>
            ) : null}
          </View>

          {/* Delivery Status Block */}
          <View style={styles.infoBlock}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Delivery Status
            </AppText>
            <AppText
              variant="body"
              style={{
                fontWeight: '700',
                marginTop: 2,
                color: isCancelled
                  ? '#EF4444'
                  : deliveryStatusLabel === 'Delivered'
                    ? '#10B981'
                    : deliveryStatusLabel === 'Out for Delivery' || deliveryStatusLabel === 'Assigned'
                      ? '#2563EB'
                      : '#F59E0B',
              }}
            >
              {deliveryStatusLabel}
            </AppText>
          </View>

          {/* Per-Order Manual Provider Override Control (Before Rider Assignment) */}
          {!isProviderLocked && fulfillmentMethod !== 'customer_pickup' && (
            <View style={{ marginTop: Spacing.two }}>
              {fulfillmentMethod === 'self_delivery' ? (
                <Button
                  title="Send with YuGo Delivery"
                  variant="secondary"
                  size="sm"
                  onPress={() => overrideOrderDeliveryProvider(order.id, 'yugo_partner')}
                />
              ) : (
                <Button
                  title="Use Self Delivery Instead"
                  variant="secondary"
                  size="sm"
                  onPress={() => overrideOrderDeliveryProvider(order.id, 'self_delivery')}
                />
              )}
            </View>
          )}

          {/* YuGo Rider Finding / Assigned Details */}
          {fulfillmentMethod === 'yugo_partner' && !isCancelled && (
            <View style={styles.fulfillmentContainer}>
              {order.deliveryDetails?.partner ? (
                <View style={styles.partnerCard}>
                  <View style={styles.partnerInfoRow}>
                    <SymbolView
                      name={{ ios: 'person.circle.fill', android: 'person', web: 'person' } as any}
                      size={24}
                      tintColor="#2563EB"
                    />
                    <View style={{ flex: 1 }}>
                      <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                        {order.deliveryDetails.partner.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: theme.textSecondary }}>
                        {order.deliveryDetails.partner.vehicleType} • ⭐ {order.deliveryDetails.partner.rating}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '600', marginTop: 4 }}>
                    📞 {order.deliveryDetails.partner.phone}
                  </AppText>
                </View>
              ) : (
                <View style={styles.findingRiderBox}>
                  <AppText variant="body" style={{ fontWeight: '600', color: '#F59E0B' }}>
                    🔍 Finding a nearby YuGo delivery partner...
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.textSecondary }}>
                    Delivery request is offered to eligible nearby riders. The first rider to accept will be assigned.
                  </AppText>
                  <View style={{ marginTop: Spacing.two }}>
                    <Button
                      title="Simulate Rider Acceptance"
                      variant="secondary"
                      size="sm"
                      onPress={() => simulateRiderAcceptance(order.id)}
                    />
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Self Delivery Details */}
          {fulfillmentMethod === 'self_delivery' && !isCancelled && (
            <View style={styles.partnerCard}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Self Delivery (Shopkeeper)
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Shopkeeper will handle local delivery directly without external rider assignment.
              </AppText>
            </View>
          )}

          {/* Customer Pickup Details */}
          {fulfillmentMethod === 'customer_pickup' && !isCancelled && (
            <View style={styles.partnerCard}>
              <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                Customer Store Pickup
              </AppText>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Customer will collect the order directly from the store location.
              </AppText>
            </View>
          )}

          {isCancelled && (
            <AppText variant="caption" style={{ color: '#EF4444', fontStyle: 'italic', marginTop: 4 }}>
              Order is cancelled. Delivery processing disabled.
            </AppText>
          )}
        </ThemedView>

        {/* Items Breakdown Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Ordered Items ({order.items.length})
          </AppText>

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
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Bill Breakup
          </AppText>

          <View style={styles.infoRowBetween}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Subtotal
            </AppText>
            <AppText variant="body" style={{ fontWeight: '600' }}>
              ₹{order.subtotal}
            </AppText>
          </View>

          {order.discount > 0 && (
            <View style={styles.infoRowBetween}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Discount
              </AppText>
              <AppText variant="body" style={{ fontWeight: '600', color: '#EF4444' }}>
                -₹{order.discount}
              </AppText>
            </View>
          )}

          <View style={styles.infoRowBetween}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Delivery Fee
            </AppText>
            <AppText variant="body" style={{ fontWeight: '600' }}>
              ₹{order.deliveryFee}
            </AppText>
          </View>

          {order.tax > 0 && (
            <View style={styles.infoRowBetween}>
              <AppText variant="caption" style={{ color: theme.textSecondary }}>
                Taxes & Charges
              </AppText>
              <AppText variant="body" style={{ fontWeight: '600' }}>
                ₹{order.tax}
              </AppText>
            </View>
          )}

          <View style={[styles.infoRowBetween, styles.totalRow]}>
            <AppText variant="h3">Total Amount</AppText>
            <AppText variant="h2" style={{ fontWeight: '800', color: '#10B981' }}>
              ₹{order.total}
            </AppText>
          </View>
        </ThemedView>

        {/* Payment Details Card */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Payment Details
          </AppText>

          <View style={styles.infoRowBetween}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Payment Method
            </AppText>
            <AppText variant="body" style={{ fontWeight: '700' }}>
              {order.paymentMethod}
            </AppText>
          </View>

          <View style={styles.infoRowBetween}>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              Payment Status
            </AppText>
            <AppText
              variant="body"
              style={{
                fontWeight: '700',
                color: order.paymentStatus === 'Paid' ? '#10B981' : '#F59E0B',
              }}
            >
              {order.paymentStatus}
            </AppText>
          </View>
        </ThemedView>

        {/* Order Lifecycle Visual Timeline */}
        <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            Order Progress Timeline
          </AppText>

          <View style={styles.timelineList}>
            {order.timeline.map((item, idx) => {
              const isItemCancelled = item.status === 'cancelled';
              const dotColor = isItemCancelled
                ? '#EF4444'
                : item.completed
                  ? '#10B981'
                  : '#D1D5DB';
              const lineColor = isItemCancelled
                ? '#EF4444'
                : item.completed
                  ? '#10B981'
                  : '#E5E7EB';
              const textColor = isItemCancelled
                ? '#EF4444'
                : item.completed
                  ? theme.text
                  : theme.textSecondary;

              return (
                <View key={idx} style={styles.timelineRow}>
                  <View style={styles.timelineIconCol}>
                    <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
                    {idx < order.timeline.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <AppText
                      variant="subtitle"
                      style={{
                        fontWeight: item.completed || isItemCancelled ? '700' : '500',
                        color: textColor,
                      }}
                    >
                      {item.label}
                    </AppText>
                    <AppText
                      variant="caption"
                      style={{ color: isItemCancelled ? '#EF4444' : theme.textSecondary }}
                    >
                      {item.timestamp}
                      {isItemCancelled && order.cancellationReason
                        ? ` • ${order.cancellationReason}`
                        : ''}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        </ThemedView>

        {/* Dynamic Contextual Order Action Bar */}
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

          {/* Action triggers for Ready for Pickup / Assigned / Out for Delivery states */}
          {order.orderStatus === 'ready_for_pickup' && (
            <>
              {fulfillmentMethod === 'yugo_partner' ? (
                order.deliveryDetails?.status === 'assigned' || order.deliveryDetails?.partner ? (
                  <Button
                    title="Mark as Picked Up"
                    variant="primary"
                    onPress={() => {
                      markDeliveryPickedUp(order.id);
                    }}
                  />
                ) : (
                  <AppText variant="caption" style={{ color: theme.textSecondary, textAlign: 'center' }}>
                    Waiting for a YuGo rider to accept the delivery request...
                  </AppText>
                )
              ) : fulfillmentMethod === 'self_delivery' ? (
                <Button
                  title="Dispatch for Delivery"
                  variant="primary"
                  onPress={() => {
                    updateDeliveryStatus(order.id, 'out_for_delivery');
                  }}
                />
              ) : (
                <Button
                  title="Complete Customer Pickup"
                  variant="primary"
                  onPress={() => {
                    updateDeliveryStatus(order.id, 'delivered');
                  }}
                />
              )}
            </>
          )}

          {order.orderStatus === 'out_for_delivery' && (
            <Button
              title="Mark as Delivered"
              variant="primary"
              onPress={() => {
                updateDeliveryStatus(order.id, 'delivered');
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
  cardHeaderWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  divider: {
    height: 1,
    backgroundColor: '#9CA3AF33',
    marginVertical: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#9CA3AF44',
    paddingBottom: Spacing.one,
    marginBottom: Spacing.one,
  },
  sectionTitleNoMargin: {
    fontWeight: 'bold',
  },
  infoBlock: {
    gap: 2,
    width: '100%',
  },
  infoRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueTextBold: {
    fontWeight: '700',
    marginTop: 2,
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
  fulfillmentContainer: {
    marginTop: Spacing.one,
  },
  partnerCard: {
    backgroundColor: '#9CA3AF15',
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.one,
  },
  partnerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  findingRiderBox: {
    backgroundColor: '#FEF7E0',
    borderWidth: 1,
    borderColor: '#FBBC0444',
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.one,
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
