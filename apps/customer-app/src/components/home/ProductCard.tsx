import { DimensionValue, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { YuGoColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/types/product.types';

type ProductCardProps = {
  product: Product;
  horizontal?: boolean;
};

export function ProductCard({ product, horizontal = true }: ProductCardProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { addItem, getQuantity, updateQuantity } = useCart();
  const qty = getQuantity(product.id);

  const cardWidth: DimensionValue = horizontal ? 155 : '100%';

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}` as any)}
      style={{
        width: cardWidth,
        backgroundColor: isDark ? '#1B2433' : '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Image placeholder */}
      <View
        className="items-center justify-center"
        style={{
          height: horizontal ? 100 : 120,
          backgroundColor: isDark ? '#141A24' : '#F6F8FB',
        }}
      >
        <ThemedText style={{ fontSize: 40 }}>{product.image}</ThemedText>
      </View>

      <View className="p-3">
        {/* Discount badge */}
        {product.discount > 0 && (
          <View
            className="self-start rounded-full px-2 py-0.5 mb-1"
            style={{ backgroundColor: YuGoColors.primary + '20' }}
          >
            <ThemedText style={{ color: YuGoColors.primary, fontSize: 10, fontWeight: '700' }}>
              {product.discount}% OFF
            </ThemedText>
          </View>
        )}

        {/* Name */}
        <ThemedText
          type="small"
          numberOfLines={2}
          style={{ fontWeight: '500', fontSize: 13, marginBottom: 2 }}
        >
          {product.name}
        </ThemedText>

        {/* Unit */}
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={{ fontSize: 11, marginBottom: 4 }}
        >
          {product.unit}
        </ThemedText>

        {/* Price row */}
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <ThemedText type="smallBold" style={{ fontSize: 14 }}>
            ₹{product.price}
          </ThemedText>
          {product.discount > 0 && (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={{ fontSize: 11, textDecorationLine: 'line-through' }}
            >
              ₹{product.mrp}
            </ThemedText>
          )}
        </View>

        {/* Add to cart / quantity stepper */}
        <View className="mt-2">
          {qty === 0 ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
              className="rounded-lg items-center py-1.5"
              style={{
                borderWidth: 1.5,
                borderColor: YuGoColors.primary,
              }}
            >
              <ThemedText style={{ color: YuGoColors.primary, fontSize: 12, fontWeight: '700' }}>
                + Add
              </ThemedText>
            </Pressable>
          ) : (
            <View
              className="flex-row items-center justify-between rounded-lg overflow-hidden"
              style={{
                backgroundColor: YuGoColors.primary,
                height: 32,
              }}
            >
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, qty - 1);
                }}
                className="px-3 h-full justify-center"
              >
                <ThemedText style={{ color: '#090C14', fontWeight: '700', fontSize: 16 }}>−</ThemedText>
              </Pressable>
              <ThemedText style={{ color: '#090C14', fontWeight: '700', fontSize: 14 }}>
                {qty}
              </ThemedText>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  updateQuantity(product.id, qty + 1);
                }}
                className="px-3 h-full justify-center"
              >
                <ThemedText style={{ color: '#090C14', fontWeight: '700', fontSize: 16 }}>+</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
