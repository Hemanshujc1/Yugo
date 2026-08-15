import { StyleSheet, View, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { AppText, Button, Screen, ThemedView } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AddProductScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}> 
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <AppText variant="h2">Add Product</AppText>
          <AppText variant="caption" style={[styles.subtitle, { color: theme.textSecondary }]}>Fill in the product details below.</AppText>

          <View style={styles.field}>
            <AppText variant="subtitle">Product Name</AppText>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]} placeholder="Enter product name" placeholderTextColor={theme.textSecondary} />
          </View>

          <View style={styles.field}>
            <AppText variant="subtitle">Category</AppText>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]} placeholder="e.g. Beverages" placeholderTextColor={theme.textSecondary} />
          </View>

          <View style={styles.field}>
            <AppText variant="subtitle">Price</AppText>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]} placeholder="e.g. $9.99" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
          </View>

          <View style={styles.field}>
            <AppText variant="subtitle">Quantity</AppText>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]} placeholder="e.g. 25" placeholderTextColor={theme.textSecondary} keyboardType="number-pad" />
          </View>

          <View style={styles.field}>
            <AppText variant="subtitle">Status</AppText>
            <TextInput style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]} placeholder="In stock / Low stock / Out of stock" placeholderTextColor={theme.textSecondary} />
          </View>

          <View style={styles.actionRow}>
            <Button variant="secondary" title="Cancel" onPress={() => router.replace('/products')} />
            <Button title="Save Product" onPress={() => router.push('/products')} />
          </View>
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
    gap: Spacing.four,
  },
  subtitle: {
    marginTop: Spacing.two,
  },
  field: {
    gap: Spacing.one,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    backgroundColor: 'transparent',
  },
});
