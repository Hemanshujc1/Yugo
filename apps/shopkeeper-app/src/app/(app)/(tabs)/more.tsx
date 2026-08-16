import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppText, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();

  const menuItems = [
    {
      key: 'customers',
      title: 'Customers',
      description: 'View customer profiles, contact history, and order trends',
      icon: { ios: 'person.2.fill', android: 'groups', web: 'groups' },
      href: '/customers',
    },
    {
      key: 'profile',
      title: 'Profile & Settings',
      description: 'Account information, shop details, and preferences',
      icon: { ios: 'person.circle.fill', android: 'person', web: 'person' },
      href: '/profile',
    },
    {
      key: 'explore',
      title: 'Explore Guide',
      description: 'Learn about Yugo features, tips, and workflows',
      icon: { ios: 'book.fill', android: 'explore', web: 'explore' },
      href: '/explore',
    },
  ];

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BottomTabInset + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title Header */}
        <PageHeader
          title="More"
          subtitle="Secondary features and account management."
        />

        {/* Navigation Options List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
              onPress={() => router.push(item.href as any)}
            >
              <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSelected }]}>
                  <SymbolView name={item.icon as any} size={22} tintColor="#2563EB" />
                </View>
                <View style={styles.body}>
                  <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" style={[styles.description, { color: theme.textSecondary }]}>
                    {item.description}
                  </AppText>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' } as any}
                  size={16}
                  tintColor={theme.textSecondary}
                />
              </ThemedView>
            </Pressable>
          ))}
        </View>
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
  menuList: {
    gap: Spacing.three,
  },
  pressable: {
    width: '100%',
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.8,
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    width: '100%',
    borderWidth: 1,
  },
  iconContainer: {
    height: 44,
    width: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    marginTop: 2,
    fontSize: 13,
  },
});
