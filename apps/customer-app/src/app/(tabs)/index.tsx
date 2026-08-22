import { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/hooks/use-cart';
import { useAuthStore } from '@/store/auth.store';
import { useLocationStore } from '@/store/location.store';
import { YuGoColors } from '@/constants/theme';
import { MOCK_PRODUCTS, MOCK_SHOPS } from '@/constants/mock-data';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { SectionHeader } from '@/components/home/SectionHeader';
import { ProductCard } from '@/components/home/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import type { Category } from '@/types/product.types';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { itemCount } = useCart();
  const { user } = useAuthStore();
  const { selectedAddress, setAddress } = useLocationStore();
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const featuredProducts = MOCK_PRODUCTS.filter((p) => p.discount >= 14);

  // Set default address on mount
  useEffect(() => {
    if (!selectedAddress && user?.addresses?.length) {
      setAddress(user.addresses[0]);
    }
  }, [selectedAddress, user, setAddress]);

  const handleCategoryPress = useCallback(
    (category: Category) => {
      router.push({ pathname: '/(tabs)/search', params: { category: category.id } });
    },
    [router],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={() => setShowAddressPicker(true)}
            className="flex-row items-center flex-1 mr-4"
          >
            <ThemedText style={{ fontSize: 18, marginRight: 6 }}>📍</ThemedText>
            <View className="flex-1">
              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
                Deliver to
              </ThemedText>
              <View className="flex-row items-center">
                <ThemedText type="smallBold" numberOfLines={1} style={{ fontSize: 14, flex: 1 }}>
                  {selectedAddress?.line1 ?? 'Select address'}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, marginLeft: 4 }}>▼</ThemedText>
              </View>
            </View>
          </Pressable>

          <Pressable onPress={() => router.push('/cart')}>
            <View>
              <ThemedText style={{ fontSize: 24 }}>🛒</ThemedText>
              {itemCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -8,
                    backgroundColor: YuGoColors.primary,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <ThemedText style={{ color: '#090C14', fontSize: 10, fontWeight: '700' }}>
                    {itemCount}
                  </ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        </View>

        {/* Search bar (non-editable, navigates on press) */}
        <SearchBar
          value=""
          onChangeText={() => {}}
          editable={false}
          onPress={() => router.push('/(tabs)/search')}
        />

        {/* Banners */}
        <BannerCarousel />

        {/* Categories */}
        <SectionHeader title="Shop by Category" />
        <CategoryGrid onCategoryPress={handleCategoryPress} />

        {/* Featured Products */}
        <SectionHeader title="Today's Deals" onSeeAll={() => router.push('/(tabs)/search')} />
        <FlatList
          data={featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          scrollEnabled
        />

        {/* Nearby Stores */}
        <SectionHeader title="Nearby Stores" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
        >
          {MOCK_SHOPS.map((shop) => (
            <View
              key={shop.id}
              className="rounded-2xl p-4"
              style={{
                width: 200,
                backgroundColor: isDark ? '#1B2433' : '#FFFFFF',
              }}
            >
              <ThemedText type="smallBold" style={{ fontSize: 14, marginBottom: 2 }}>
                {shop.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                {shop.category}
              </ThemedText>
              <View className="flex-row items-center mt-2" style={{ gap: 8 }}>
                <ThemedText style={{ fontSize: 12 }}>⭐ {shop.rating}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                  · {shop.distance}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Buy Again */}
        <SectionHeader title="Buy Again" />
        <FlatList
          data={MOCK_PRODUCTS.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}
          keyExtractor={(item) => item.id + '-buyagain'}
          renderItem={({ item }) => <ProductCard product={item} />}
          scrollEnabled
        />
      </ScrollView>

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
