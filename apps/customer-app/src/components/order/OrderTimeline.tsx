import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';
import type { OrderStatus } from '@/types/order.types';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

type OrderTimelineProps = {
  currentStatus: OrderStatus;
};

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'placed', label: 'Order Placed' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

function getStepIndex(status: OrderStatus): number {
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx >= 0 ? idx : 0;
}

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: YuGoColors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: '#090C14',
        }}
      />
    </Animated.View>
  );
}

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const currentIndex = getStepIndex(currentStatus);

  return (
    <View className="px-4">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <View key={step.status} className="flex-row">
            {/* Timeline indicator */}
            <View className="items-center" style={{ width: 32 }}>
              {isCurrent ? (
                <PulsingDot />
              ) : (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isCompleted
                      ? YuGoColors.primary
                      : isDark ? '#283447' : '#DCE5EE',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCompleted && (
                    <ThemedText style={{ color: '#090C14', fontSize: 12, fontWeight: '700' }}>✓</ThemedText>
                  )}
                </View>
              )}
              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <View
                  style={{
                    width: 2,
                    height: 40,
                    backgroundColor: isCompleted
                      ? YuGoColors.primary
                      : isDark ? '#283447' : '#DCE5EE',
                  }}
                />
              )}
            </View>

            {/* Label */}
            <View className="ml-3 pb-8">
              <ThemedText
                type="small"
                style={{
                  fontWeight: isCurrent ? '700' : '500',
                  color: isUpcoming
                    ? (isDark ? YuGoColors.dark.muted : YuGoColors.light.muted)
                    : isCurrent
                      ? YuGoColors.primary
                      : undefined,
                  fontSize: 14,
                }}
              >
                {step.label}
              </ThemedText>
              {(isCompleted || isCurrent) && (
                <ThemedText
                  type="small"
                  themeColor="textSecondary"
                  style={{ fontSize: 11, marginTop: 2 }}
                >
                  {isCurrent ? 'In progress...' : '10 mins ago'}
                </ThemedText>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
