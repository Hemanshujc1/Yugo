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
      <ThemedView type="backgroundElement" style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSelected }]}> 
          <SymbolView name={icon as any} size={18} tintColor={theme.text} />
        </View>
        <View style={styles.body}>
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="caption" style={[styles.description, { color: theme.textSecondary }]}> 
            {description}
          </AppText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 20,
    width: '48%',
    minWidth: 150,
    maxWidth: 180,
    marginBottom: Spacing.three,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    alignSelf: 'flex-start',
    flexShrink: 1,
    maxHeight: 120,
  },
  iconContainer: {
    height: 40,
    width: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexShrink: 1,
  },
  title: {
    lineHeight: 22,
  },
  description: {
    marginTop: Spacing.one,
  },
});
