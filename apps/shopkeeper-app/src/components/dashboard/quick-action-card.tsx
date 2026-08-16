import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { AppText, ThemedView } from '@/components';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface QuickActionCardProps {
  title: string;
  description: string;
  icon: { ios: string; android: string; web: string };
  onPress: () => void;
}

export function QuickActionCard({ title, description, icon, onPress }: QuickActionCardProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSelected }]}>
          <SymbolView name={icon as any} size={20} tintColor="#2563EB" />
        </View>
        <View style={styles.body}>
          <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
            {description}
          </AppText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    width: '100%',
    borderWidth: 1,
  },
  iconContainer: {
    height: 40,
    width: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
  },
  description: {
    marginTop: 2,
    fontSize: 12,
  },
});
