import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/shared/Badge';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';
import type { Order, OrderStatus } from '@/types/order.types';

type OrderCardProps = {
  order: Order;
  onReorder?: (order: Order) => void;
};

const statusBadgeColor: Record<OrderStatus, 'primary' | 'warning' | 'success' | 'error'> = {
  placed: 'primary',
  accepted: 'primary',
  preparing: 'warning',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabel: Record<OrderStatus, string> = {
  placed: 'Placed',
  accepted: 'Accepted',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function OrderCard({ order, onReorder }: OrderCardProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';

  const itemsSummary = order.items
    .slice(0, 2)
    .map((i) => i.name)
    .join(', ');
  const moreCount = order.items.length - 2;

  const isActive = ['placed', 'accepted', 'preparing', 'out_for_delivery'].includes(order.status);

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View>
          <ThemedText type="smallBold" style={{ fontSize: 14 }}>
            {order.id.slice(-8)}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
            {order.shopName} · {new Date(order.createdAt).toLocaleDateString()}
          </ThemedText>
        </View>
        <Badge label={statusLabel[order.status]} color={statusBadgeColor[order.status]} />
      </View>

      {/* Items */}
      <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} className="mb-2">
        {itemsSummary}{moreCount > 0 ? ` +${moreCount} more` : ''}
      </ThemedText>

      {/* Total + Action */}
      <View className="flex-row items-center justify-between" style={{ borderTopWidth: 1, borderTopColor: isDark ? '#344155' : '#C8D4E0', paddingTop: 12 }}>
        <ThemedText type="smallBold">₹{order.totalAmount}</ThemedText>
        <View className="flex-row" style={{ gap: 8 }}>
          {isActive && (
            <Pressable
              onPress={() => router.push(`/tracking/${order.id}`)}
              className="rounded-lg px-4 py-2"
              style={{ backgroundColor: YuGoColors.primary }}
            >
              <ThemedText style={{ color: '#090C14', fontSize: 12, fontWeight: '700' }}>Track Order</ThemedText>
            </Pressable>
          )}
          {order.status === 'delivered' && onReorder && (
            <Pressable
              onPress={() => onReorder(order)}
              className="rounded-lg px-4 py-2"
              style={{ borderWidth: 1.5, borderColor: YuGoColors.primary }}
            >
              <ThemedText style={{ color: YuGoColors.primary, fontSize: 12, fontWeight: '700' }}>Reorder</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
