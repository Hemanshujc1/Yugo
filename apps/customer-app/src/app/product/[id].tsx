import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ProductCard } from '@/components/home/ProductCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import { getProductById } from '@/services/products.service';
import { MOCK_PRODUCTS } from '@/constants/mock-data';
import { YuGoColors } from '@/constants/theme';
import type { Product } from '@/types/product.types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { addItem, getQuantity, updateQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getProductById(id ?? '');
      setProduct(data ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
        <LoadingSpinner fullScreen message="Loading product..." />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
        <View className="flex-1 items-center justify-center">
          <ThemedText style={{ fontSize: 48, marginBottom: 12 }}>🤷</ThemedText>
          <ThemedText type="smallBold">Product not found</ThemedText>
          <Pressable onPress={() => router.back()} className="mt-4">
            <ThemedText style={{ color: YuGoColors.primary }}>Go Back</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const qty = getQuantity(product.id);
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
        >
          <ThemedText style={{ fontSize: 18 }}>←</ThemedText>
        </Pressable>

        {/* Product Image */}
        <View
          className="items-center justify-center"
          style={{
            height: 250,
            backgroundColor: isDark ? '#141A24' : '#F0F0F3',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <ThemedText style={{ fontSize: 80 }}>{product.image}</ThemedText>
        </View>

        <View className="px-4 pt-4">
          {/* Name and unit */}
          <ThemedText type="smallBold" style={{ fontSize: 22, marginBottom: 4 }}>
            {product.name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" className="mb-3">
            {product.unit}
          </ThemedText>

          {/* Rating */}
          <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
            <ThemedText style={{ fontSize: 14 }}>⭐ {product.rating}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
              ({product.reviewCount} reviews)
            </ThemedText>
          </View>

          {/* Price row */}
          <View className="flex-row items-center mb-3" style={{ gap: 10 }}>
            <ThemedText type="smallBold" style={{ fontSize: 28 }}>₹{product.price}</ThemedText>
            {product.discount > 0 && (
              <>
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={{ fontSize: 16, textDecorationLine: 'line-through' }}
                >
                  ₹{product.mrp}
                </ThemedText>
                <Badge label={`${product.discount}% OFF`} color="primary" />
              </>
            )}
          </View>

          {/* Stock badge */}
          <Badge
            label={product.inStock ? 'In Stock' : 'Out of Stock'}
            color={product.inStock ? 'success' : 'error'}
          />

          {/* Description */}
          <ThemedText type="smallBold" style={{ fontSize: 16, marginTop: 20, marginBottom: 8 }}>
            Description
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ lineHeight: 22 }}>
            {product.description}
          </ThemedText>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <>
              <SectionHeader title="You may also like" />
              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProductCard product={item} />}
                scrollEnabled
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      {product.inStock && (
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
          style={{
            backgroundColor: isDark ? '#090C14' : '#F6F8FB',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#283447' : '#DCE5EE',
          }}
        >
          {qty === 0 ? (
            <Button label="Add to Cart" onPress={() => addItem(product)} fullWidth size="lg" />
          ) : (
            <View
              className="flex-row items-center justify-between rounded-2xl overflow-hidden"
              style={{ backgroundColor: YuGoColors.primary, height: 56 }}
            >
              <Pressable
                onPress={() => updateQuantity(product.id, qty - 1)}
                className="px-6 h-full justify-center"
              >
                <ThemedText style={{ color: '#090C14', fontWeight: '700', fontSize: 20 }}>−</ThemedText>
              </Pressable>
              <ThemedText style={{ color: '#090C14', fontWeight: '700', fontSize: 18 }}>
                {qty} in cart
              </ThemedText>
              <Pressable
                onPress={() => updateQuantity(product.id, qty + 1)}
                className="px-6 h-full justify-center"
              >
                <ThemedText style={{ color: '#090C14', fontWeight: '700', fontSize: 20 }}>+</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
