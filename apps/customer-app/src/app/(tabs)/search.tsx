import { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterRow } from '@/components/search/FilterRow';
import { ProductGrid } from '@/components/search/ProductGrid';
import { YuGoColors } from '@/constants/theme';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, POPULAR_SEARCHES } from '@/constants/mock-data';

const FILTER_OPTIONS = ['All', ...MOCK_CATEGORIES.map((c) => c.name)];

export default function SearchScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(
    category
      ? MOCK_CATEGORIES.find((c) => c.id === category)?.name ?? 'All'
      : 'All',
  );

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesQuery =
      query === '' ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      MOCK_CATEGORIES.find((c) => c.name === activeFilter)?.id === p.category;
    return matchesQuery && matchesFilter;
  });

  const hasSearchContent = query.length > 0 || activeFilter !== 'All';

  const handleChipPress = useCallback((search: string) => {
    setQuery(search);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      <View className="pt-2">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        <FilterRow
          filters={FILTER_OPTIONS}
          activeFilter={activeFilter}
          onFilterPress={setActiveFilter}
        />
      </View>

      {hasSearchContent ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <ScrollView className="flex-1 px-4">
          {/* Popular Searches */}
          <ThemedText type="smallBold" className="mb-3" style={{ fontSize: 16 }}>
            Popular Searches
          </ThemedText>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {POPULAR_SEARCHES.map((search) => (
              <Pressable
                key={search}
                onPress={() => handleChipPress(search)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: isDark ? '#1B2433' : '#F0F0F3',
                  borderWidth: 1,
                  borderColor: isDark ? '#283447' : '#DCE5EE',
                }}
              >
                <ThemedText type="small" style={{ fontSize: 13 }}>{search}</ThemedText>
              </Pressable>
            ))}
          </View>

          {/* Categories */}
          <ThemedText type="smallBold" className="mt-6 mb-3" style={{ fontSize: 16 }}>
            Browse Categories
          </ThemedText>
          {MOCK_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setActiveFilter(cat.name)}
              className="flex-row items-center p-3 rounded-xl mb-2"
              style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
            >
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: cat.color + '20' }}
              >
                <ThemedText style={{ fontSize: 20 }}>{cat.icon}</ThemedText>
              </View>
              <ThemedText type="small" style={{ fontWeight: '500' }}>{cat.name}</ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
