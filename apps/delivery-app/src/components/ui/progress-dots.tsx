import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ProgressDotsProps = {
  total: number;
  current: number; // 0-indexed
};

export function ProgressDots({ total, current }: ProgressDotsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row} accessibilityLabel={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i === current ? theme.primary : theme.border,
              width: i === current ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.one, alignItems: 'center' },
  dot: { height: 8, borderRadius: Radius.pill },
});
