import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';

type PriceSummaryProps = {
  itemTotal: number;
  deliveryFee: number;
  taxes: number;
  grandTotal: number;
};

export function PriceSummary({ itemTotal, deliveryFee, taxes, grandTotal }: PriceSummaryProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';

  return (
    <View
      className="rounded-2xl p-4"
      style={{ backgroundColor: isDark ? '#1B2433' : '#FFFFFF' }}
    >
      <ThemedText type="smallBold" className="mb-3" style={{ fontSize: 16 }}>
        Price Details
      </ThemedText>

      <View className="flex-row justify-between mb-2">
        <ThemedText type="small" themeColor="textSecondary">Item Total</ThemedText>
        <ThemedText type="small">₹{itemTotal}</ThemedText>
      </View>

      <View className="flex-row justify-between mb-2">
        <ThemedText type="small" themeColor="textSecondary">Delivery Fee</ThemedText>
        {deliveryFee === 0 ? (
          <ThemedText type="small" style={{ color: YuGoColors.success, fontWeight: '600' }}>FREE</ThemedText>
        ) : (
          <ThemedText type="small">₹{deliveryFee}</ThemedText>
        )}
      </View>

      <View className="flex-row justify-between mb-3">
        <ThemedText type="small" themeColor="textSecondary">Taxes (5%)</ThemedText>
        <ThemedText type="small">₹{taxes}</ThemedText>
      </View>

      <View
        className="flex-row justify-between pt-3"
        style={{ borderTopWidth: 1, borderTopColor: isDark ? '#344155' : '#C8D4E0' }}
      >
        <ThemedText type="smallBold" style={{ fontSize: 16 }}>Total</ThemedText>
        <ThemedText type="smallBold" style={{ fontSize: 16 }}>₹{grandTotal}</ThemedText>
      </View>
    </View>
  );
}
