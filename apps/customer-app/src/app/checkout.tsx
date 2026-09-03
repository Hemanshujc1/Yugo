import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/Button';
import { PriceSummary } from '@/components/cart/PriceSummary';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import { useAuthStore } from '@/store/auth.store';
import { useLocationStore } from '@/store/location.store';
import { placeOrder } from '@/services/orders.service';
import { YuGoColors } from '@/constants/theme';

type PaymentMethod = 'upi' | 'card' | 'cod';

export default function CheckoutScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { items, total, deliveryFee, taxes, grandTotal, clearCart } = useCart();
  const { user } = useAuthStore();
  const { selectedAddress, setAddress } = useLocationStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'upi', label: 'UPI', icon: '📱' },
    { id: 'card', label: 'Debit/Credit Card', icon: '💳' },
    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
  ];

  const handlePlaceOrder = async () => {
    if (selectedPayment !== 'cod') {
      Alert.alert('Coming Soon', 'This payment method will be available soon. Please use Cash on Delivery.');
      return;
    }
    setLoading(true);
    try {
      const order = await placeOrder(items, selectedAddress?.line1 ?? '');
      clearCart();
      router.replace(`/tracking/${order.id}`);
    } catch {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <Pressable onPress={() => router.back()} className="mr-3">
          <ThemedText style={{ fontSize: 20 }}>←</ThemedText>
        </Pressable>
        <ThemedText type="smallBold" style={{ fontSize: 20 }}>Checkout</ThemedText>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Delivery Address */}
        <ThemedText type="smallBold" className="mb-3" style={{ fontSize: 16 }}>
          Delivery Address
        </ThemedText>
        <View
          className="rounded-2xl p-4 mb-5"
          style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
        >
          <View className="flex-row items-start">
            <ThemedText style={{ fontSize: 20, marginRight: 12 }}>
              {selectedAddress?.label === 'Home' ? '🏠' : '🏢'}
            </ThemedText>
            <View className="flex-1">
              <ThemedText type="smallBold" style={{ fontSize: 14 }}>
                {selectedAddress?.label ?? 'Address'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                {selectedAddress?.line1 ?? 'No address selected'}
              </ThemedText>
            </View>
            <Pressable onPress={() => setShowAddressPicker(true)}>
              <ThemedText style={{ color: YuGoColors.primary, fontSize: 13, fontWeight: '600' }}>
                Change
              </ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Order Summary */}
        <ThemedText type="smallBold" className="mb-3" style={{ fontSize: 16 }}>
          Order Summary
        </ThemedText>
        <View
          className="rounded-2xl p-4 mb-5"
          style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
        >
          {items.map((item) => (
            <View key={item.product.id} className="flex-row justify-between mb-2">
              <ThemedText type="small" className="flex-1" numberOfLines={1}>
                {item.product.name} × {item.quantity}
              </ThemedText>
              <ThemedText type="small">₹{item.product.price * item.quantity}</ThemedText>
            </View>
          ))}
        </View>

        {/* Price Summary */}
        <PriceSummary
          itemTotal={total}
          deliveryFee={deliveryFee}
          taxes={taxes}
          grandTotal={grandTotal}
        />

        {/* Payment Method */}
        <ThemedText type="smallBold" className="mb-3 mt-5" style={{ fontSize: 16 }}>
          Payment Method
        </ThemedText>
        {paymentMethods.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => setSelectedPayment(method.id)}
            className="flex-row items-center p-4 rounded-xl mb-2"
            style={{
              backgroundColor:
                selectedPayment === method.id
                  ? YuGoColors.primary + '15'
                  : isDark ? '#1B2433' : '#FFFFFF',
              borderWidth: selectedPayment === method.id ? 1.5 : 0,
              borderColor: YuGoColors.primary,
            }}
          >
            <ThemedText style={{ fontSize: 20, marginRight: 12 }}>{method.icon}</ThemedText>
            <ThemedText type="small" className="flex-1" style={{ fontWeight: '500' }}>
              {method.label}
            </ThemedText>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor:
                  selectedPayment === method.id ? YuGoColors.primary : isDark ? '#283447' : '#DCE5EE',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedPayment === method.id && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: YuGoColors.primary,
                  }}
                />
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="px-4 pb-8 pt-4"
        style={{
          backgroundColor: isDark ? '#090C14' : '#F6F8FB',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#283447' : '#DCE5EE',
        }}
      >
        <Button
          label={`Place Order · ₹${grandTotal}`}
          onPress={handlePlaceOrder}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>

      {/* Address Picker Modal */}
      <Modal visible={showAddressPicker} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <Pressable className="flex-1" onPress={() => setShowAddressPicker(false)} />
          <View
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
          >
            <ThemedText type="smallBold" style={{ fontSize: 18, marginBottom: 16 }}>
              Select Delivery Address
            </ThemedText>
            {user?.addresses.map((addr) => (
              <Pressable
                key={addr.id}
                onPress={() => {
                  setAddress(addr);
                  setShowAddressPicker(false);
                }}
                className="flex-row items-center p-4 rounded-xl mb-3"
                style={{
                  backgroundColor:
                    selectedAddress?.id === addr.id
                      ? YuGoColors.primary + '15'
                      : isDark ? '#141A24' : '#F6F8FB',
                  borderWidth: selectedAddress?.id === addr.id ? 1.5 : 0,
                  borderColor: YuGoColors.primary,
                }}
              >
                <ThemedText style={{ fontSize: 20, marginRight: 12 }}>
                  {addr.label === 'Home' ? '🏠' : '🏢'}
                </ThemedText>
                <View className="flex-1">
                  <ThemedText type="smallBold" style={{ fontSize: 14 }}>{addr.label}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={{ fontSize: 12 }}>
                    {addr.line1}
                  </ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
