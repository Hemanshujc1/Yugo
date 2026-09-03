import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { OrderTimeline } from '@/components/order/OrderTimeline';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOrderById } from '@/services/orders.service';
import { YuGoColors } from '@/constants/theme';
import type { Order } from '@/types/order.types';

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getOrderById(orderId ?? '');
      if (data) {
        setOrder(data);
      } else {
        // If not found (new order), create a placeholder
        setOrder({
          id: orderId ?? '',
          status: 'placed',
          shopName: 'QuickMart',
          items: [],
          totalAmount: 0,
          deliveryAddress: '',
          createdAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    })();
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
        <LoadingSpinner fullScreen message="Loading order details..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
            ORDER #{order?.id.slice(-8)}
          </ThemedText>
          <ThemedText type="smallBold" style={{ fontSize: 22, marginTop: 4 }}>
            {order?.shopName}
          </ThemedText>
        </View>

        {/* Status Timeline */}
        <View
          className="rounded-2xl p-4 mx-4 mb-4"
          style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
        >
          <ThemedText type="smallBold" className="mb-4" style={{ fontSize: 16 }}>
            Order Status
          </ThemedText>
          <OrderTimeline currentStatus={order?.status ?? 'placed'} />
        </View>

        {/* Delivery Partner (show for out_for_delivery) */}
        {order?.deliveryPartner && order.status === 'out_for_delivery' && (
          <View
            className="rounded-2xl p-4 mx-4 mb-4"
            style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
          >
            <ThemedText type="smallBold" className="mb-3" style={{ fontSize: 16 }}>
              Delivery Partner
            </ThemedText>
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: YuGoColors.primary + '20' }}
              >
                <ThemedText style={{ fontSize: 20 }}>🏍️</ThemedText>
              </View>
              <View className="flex-1">
                <ThemedText type="smallBold" style={{ fontSize: 14 }}>
                  {order.deliveryPartner.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                  {order.deliveryPartner.phone}
                </ThemedText>
              </View>
              <View className="flex-row" style={{ gap: 12 }}>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? '#141A24' : '#F6F8FB' }}
                >
                  <ThemedText style={{ fontSize: 18 }}>📞</ThemedText>
                </View>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: isDark ? '#141A24' : '#F6F8FB' }}
                >
                  <ThemedText style={{ fontSize: 18 }}>💬</ThemedText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Map placeholder */}
        <View
          className="rounded-2xl mx-4 mb-6 items-center justify-center"
          style={{
            height: 180,
            backgroundColor: isDark ? '#1B2433' : '#F0F0F3',
            borderWidth: 1,
            borderColor: isDark ? '#283447' : '#DCE5EE',
            borderStyle: 'dashed',
          }}
        >
          <ThemedText style={{ fontSize: 36, marginBottom: 8 }}>🗺️</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Live map coming soon
          </ThemedText>
        </View>

        {/* Estimated delivery */}
        {order?.estimatedDelivery && (
          <View className="px-4 mb-6">
            <View
              className="flex-row items-center rounded-xl p-4"
              style={{ backgroundColor: YuGoColors.primary + '15' }}
            >
              <ThemedText style={{ fontSize: 18, marginRight: 10 }}>⏱️</ThemedText>
              <View>
                <ThemedText type="small" style={{ color: YuGoColors.primary, fontWeight: '600', fontSize: 13 }}>
                  Estimated Delivery
                </ThemedText>
                <ThemedText type="smallBold" style={{ fontSize: 14 }}>
                  {new Date(order.estimatedDelivery).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Back to Home */}
        <View className="px-4">
          <Button label="Back to Home" onPress={() => router.replace('/(tabs)')} fullWidth variant="outline" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
