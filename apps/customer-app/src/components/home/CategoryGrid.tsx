import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MOCK_CATEGORIES } from '@/constants/mock-data';
import type { Category } from '@/types/product.types';

type CategoryGridProps = {
  onCategoryPress: (category: Category) => void;
};

export function CategoryGrid({ onCategoryPress }: CategoryGridProps) {
  return (
    <View className="flex-row flex-wrap px-4" style={{ gap: 12 }}>
      {MOCK_CATEGORIES.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => onCategoryPress(category)}
          className="items-center"
          style={{ width: '30%' }}
        >
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
            style={{ backgroundColor: category.color + '20' }}
          >
            <ThemedText style={{ fontSize: 28 }}>{category.icon}</ThemedText>
          </View>
          <ThemedText type="small" className="text-center" style={{ fontSize: 12 }}>
            {category.name}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}
