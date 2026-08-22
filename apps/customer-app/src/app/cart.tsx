import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/Button';
import { CartItemRow } from '@/components/cart/CartItem';
import { PriceSummary } from '@/components/cart/PriceSummary';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import { YuGoColors } from '@/constants/theme';

export default function CartScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { items, total, itemCount, deliveryFee, taxes, grandTotal } = useCart();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ThemedText style={{ fontSize: 20 }}>←</ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={{ fontSize: 20, flex: 1 }}>
          My Cart
        </ThemedText>
        {itemCount > 0 && (
          <ThemedText type="small" themeColor="textSecondary">
            {itemCount} items
          </ThemedText>
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText style={{ fontSize: 64, marginBottom: 16 }}>🛒</ThemedText>
          <ThemedText type="smallBold" style={{ fontSize: 18, marginBottom: 8 }}>
            Your cart is empty
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="text-center mb-6">
            Add items to get started
          </ThemedText>
          <Button label="Start Shopping" onPress={() => router.push('/(tabs)')} />
        </View>
      ) : (
        <>
          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
          >
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}

            <View className="mt-4">
              <PriceSummary
                itemTotal={total}
                deliveryFee={deliveryFee}
                taxes={taxes}
                grandTotal={grandTotal}
              />
            </View>

            {deliveryFee === 0 && (
              <View
                className="flex-row items-center rounded-xl p-3 mt-3"
                style={{ backgroundColor: YuGoColors.success + '15' }}
              >
                <ThemedText style={{ fontSize: 16, marginRight: 8 }}>🎉</ThemedText>
                <ThemedText type="small" style={{ color: YuGoColors.success, fontWeight: '600', fontSize: 13 }}>
                  You saved ₹30 on delivery!
                </ThemedText>
              </View>
            )}
          </ScrollView>

          <View
            className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
            style={{
              backgroundColor: isDark ? '#090C14' : '#F6F8FB',
              borderTopWidth: 1,
              borderTopColor: isDark ? '#283447' : '#DCE5EE',
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText type="small" themeColor="textSecondary">
                Total
              </ThemedText>
              <ThemedText type="smallBold" style={{ fontSize: 20 }}>
                ₹{grandTotal}
              </ThemedText>
            </View>
            <Button
              label="Proceed to Checkout"
              onPress={() => router.push('/checkout')}
              fullWidth
              size="lg"
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
