import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { AppText, Screen, ThemedView, PageHeader, Button } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProducts } from '@/hooks';
import { categories } from '@/services/dashboard-mock-data';

export default function CategoriesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { products } = useProducts();

  // Compute category item counts dynamically from central ProductContext
  const categoryCounts = categories.map((cat) => {
    const count = products.filter(
      (p) => p.category.toLowerCase() === cat.name.toLowerCase()
    ).length;
    return { ...cat, count: count || cat.count };
  });

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/products',
      params: { category: categoryName },
    });
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Categories' }} />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Product Categories"
          subtitle="Organize product catalog groups and filter listings."
        />

        <View style={styles.categoryGrid}>
          {categoryCounts.map((cat) => (
            <Pressable
              key={cat.id}
              style={styles.pressable}
              onPress={() => handleCategoryPress(cat.name)}
            >
              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF33' }]}>
                <View style={styles.cardHeader}>
                  <AppText variant="subtitle" style={{ fontWeight: '700' }}>
                    {cat.name}
                  </AppText>
                  <View style={styles.badge}>
                    <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                      {cat.count} items
                    </AppText>
                  </View>
                </View>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Tap to view products under {cat.name} →
                </AppText>
              </ThemedView>
            </Pressable>
          ))}
        </View>

        <Button title="Back to Home" variant="secondary" onPress={() => router.back()} />
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
  categoryGrid: {
    gap: Spacing.three,
  },
  pressable: {
    borderRadius: 16,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#2563EB15',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
