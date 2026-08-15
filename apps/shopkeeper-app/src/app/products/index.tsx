import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { AppText, Screen, ThemedView } from '@/components';
import { ProductCard, SectionHeader, CategoryCard } from '@/components/dashboard';
import { categories, products } from '@/services/dashboard-mock-data';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ProductsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + BottomTabInset + Spacing.four },
        ]}
      >
        <SectionHeader title="Products" subtitle="Inventory overview and product management." />
        <Pressable
          style={styles.nativeAddButton}
          android_ripple={{ color: '#ffffff33' }}
          onPress={() => router.push('/products/add')}
        >
          <Text style={styles.nativeAddButtonText}>Add Product</Text>
        </Pressable>

        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h3">Featured Products</AppText>
          <View style={styles.list}>
            {products.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onEdit={() => router.push(`/product-details?productId=${item.id}`)}
              />
            ))}
          </View>
        </ThemedView>

        <SectionHeader title="Categories" subtitle="Organize products by category." />
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard key={category.id} item={category} />
          ))}
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
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  subtitle: {
    marginTop: Spacing.two,
  },
  nativeAddButton: {
    backgroundColor: '#3C87F7',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.five,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  nativeAddButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  grid: {
    gap: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
