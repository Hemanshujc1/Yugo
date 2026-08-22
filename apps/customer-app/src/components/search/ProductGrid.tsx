import { FlatList, View } from 'react-native';
import { ProductCard } from '@/components/home/ProductCard';
import { ThemedText } from '@/components/themed-text';
import type { Product } from '@/types/product.types';

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ThemedText style={{ fontSize: 48, marginBottom: 12 }}>🔍</ThemedText>
        <ThemedText type="smallBold" style={{ fontSize: 16 }}>No products found</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" className="mt-1">
          Try a different search term
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <ProductCard product={item} horizontal={false} />
        </View>
      )}
    />
  );
}
