import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface OrderItem {
  id: string;
  customer: string;
  amount: string;
  status: string;
  statusColor: string;
  time: string;
}

export function OrderCard({
  order,
  onPress,
}: {
  order: OrderItem;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={styles.row}>
          <View>
            <AppText variant="subtitle">{order.id}</AppText>
            <AppText variant="caption" style={{ color: theme.textSecondary }}>
              {order.customer}
            </AppText>
          </View>
          <View style={[styles.badge, { backgroundColor: `${order.statusColor}20` }]}> 
            <AppText variant="caption" style={{ color: order.statusColor }}>
              {order.status}
            </AppText>
          </View>
        </View>
        <View style={styles.row}> 
          <AppText variant="caption" style={styles.time}>
            {order.time}
          </AppText>
          <AppText variant="subtitle">{order.amount}</AppText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 999,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  time: {
    color: '#60646C',
  },
});
