import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SelectableCardProps = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
};

export function SelectableCard({ title, description, selected, onPress, icon }: SelectableCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
          borderWidth: selected ? 2 : 1.5,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.textCol}>
        <ThemedText type="h3">{title}</ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      <View
        style={[
          styles.radio,
          { borderColor: selected ? theme.primary : theme.border },
          selected && { backgroundColor: theme.primary },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.three,
    minHeight: MinTouchTarget,
  },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  textCol: { flex: 1, gap: Spacing.half },
  description: { lineHeight: 18 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: Radius.pill,
    borderWidth: 2,
  },
});
