import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { YuGoColors } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  onSeeAll?: () => void;
};

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3 mt-5">
      <ThemedText type="smallBold" style={{ fontSize: 18, fontWeight: '700' }}>
        {title}
      </ThemedText>
      {onSeeAll && (
        <Pressable onPress={onSeeAll}>
          <ThemedText type="small" style={{ color: YuGoColors.primary }}>
            See all
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}
