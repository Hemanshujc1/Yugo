import { ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';

type FilterRowProps = {
  filters: string[];
  activeFilter: string;
  onFilterPress: (filter: string) => void;
};

export function FilterRow({ filters, activeFilter, onFilterPress }: FilterRowProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      className="mb-4"
    >
      {filters.map((filter) => {
        const isActive = filter === activeFilter;
        return (
          <Pressable
            key={filter}
            onPress={() => onFilterPress(filter)}
            className="rounded-full px-4 py-2"
            style={{
              backgroundColor: isActive
                ? YuGoColors.primary
                : isDark ? '#1B2433' : '#F0F0F3',
              borderWidth: isActive ? 0 : 1,
              borderColor: isDark ? '#283447' : '#DCE5EE',
            }}
          >
            <ThemedText
              type="small"
              style={{
                color: isActive
                  ? '#090C14'
                  : isDark ? YuGoColors.dark.textSecondary : YuGoColors.light.textSecondary,
                fontWeight: isActive ? '600' : '400',
                fontSize: 13,
              }}
            >
              {filter}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
