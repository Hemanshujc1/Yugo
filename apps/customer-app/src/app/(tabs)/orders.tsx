import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/Button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { OrderCard } from '@/components/order/OrderCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import { getOrders } from '@/services/orders.service';
import { MOCK_PRODUCTS } from '@/constants/mock-data';
import type { Order } from '@/types/order.types';

export default function OrdersScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getOrders();
      setOrders(data);
      setLoading(false);
    })();
  }, []);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      if (product) addItem(product);
    });
    router.push('/cart');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      <View className="px-4 pt-4 pb-2">
        <ThemedText type="smallBold" style={{ fontSize: 24, fontWeight: '700' }}>
          My Orders
        </ThemedText>
      </View>

      {loading ? (
        <LoadingSpinner message="Loading orders..." fullScreen />
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText style={{ fontSize: 64, marginBottom: 16 }}>📦</ThemedText>
          <ThemedText type="smallBold" style={{ fontSize: 18, marginBottom: 8 }}>
            No orders yet
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="text-center mb-6">
            Explore our products and place your first order!
          </ThemedText>
          <Button label="Start Shopping" onPress={() => router.push('/(tabs)')} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onReorder={handleReorder} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
