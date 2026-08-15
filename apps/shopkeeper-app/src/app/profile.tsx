import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Screen, ThemedView } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + BottomTabInset + Spacing.four },
        ]}
      >
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h2">Profile</AppText>
          <AppText variant="caption" style={styles.subtitle}>
            View your account, settings, and shop preferences.
          </AppText>
        </ThemedView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.four,
  },
  subtitle: {
    marginTop: Spacing.two,
  },
});
