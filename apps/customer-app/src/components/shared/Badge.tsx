import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { YuGoColors } from '@/constants/theme';

type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'premium';

type BadgeProps = {
  label: string;
  color?: BadgeColor;
};

const colorMap: Record<BadgeColor, string> = {
  primary: YuGoColors.primary,
  success: YuGoColors.success,
  warning: YuGoColors.warning,
  error: YuGoColors.error,
  premium: YuGoColors.premium,
};

export function Badge({ label, color = 'primary' }: BadgeProps) {
  const badgeColor = colorMap[color];

  return (
    <View
      className="rounded-full px-2.5 py-1 self-start"
      style={{ backgroundColor: badgeColor + '26' }}
    >
      <ThemedText type="small" style={{ color: badgeColor, fontSize: 12, fontWeight: '600' }}>
        {label}
      </ThemedText>
    </View>
  );
}
