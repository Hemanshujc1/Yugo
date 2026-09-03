import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { YuGoColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import type { CartItem as CartItemType } from '@/types/cart.types';

type CartItemProps = {
  item: CartItemType;
};

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { product, quantity } = item;

  return (
    <View
      className="flex-row items-center p-4 rounded-2xl mb-3"
      style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
    >
      {/* Product image */}
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: isDark ? '#141A24' : '#F6F8FB' }}
      >
        <ThemedText style={{ fontSize: 28 }}>{product.image}</ThemedText>
      </View>

      {/* Info */}
      <View className="flex-1">
        <ThemedText type="small" numberOfLines={1} style={{ fontWeight: '500', fontSize: 14 }}>
          {product.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
          {product.unit}
        </ThemedText>
      </View>

      {/* Quantity stepper */}
      <View
        className="flex-row items-center rounded-lg overflow-hidden mr-3"
        style={{ borderWidth: 1, borderColor: isDark ? '#283447' : '#DCE5EE' }}
      >
        <Pressable
          onPress={() => {
            if (quantity <= 1) {
              removeItem(product.id);
            } else {
              updateQuantity(product.id, quantity - 1);
            }
          }}
          className="px-3 py-1.5"
        >
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: quantity <= 1 ? YuGoColors.error : undefined }}>
            {quantity <= 1 ? '🗑' : '−'}
          </ThemedText>
        </Pressable>
        <View className="px-3 py-1.5" style={{ borderLeftWidth: 1, borderRightWidth: 1, borderColor: isDark ? '#283447' : '#DCE5EE' }}>
          <ThemedText style={{ fontWeight: '700', fontSize: 14 }}>{quantity}</ThemedText>
        </View>
        <Pressable
          onPress={() => updateQuantity(product.id, quantity + 1)}
          className="px-3 py-1.5"
        >
          <ThemedText style={{ fontSize: 16, fontWeight: '600', color: YuGoColors.primary }}>+</ThemedText>
        </Pressable>
      </View>

      {/* Subtotal */}
      <ThemedText type="smallBold" style={{ fontSize: 14, minWidth: 50, textAlign: 'right' }}>
        ₹{product.price * quantity}
      </ThemedText>
    </View>
  );
}
