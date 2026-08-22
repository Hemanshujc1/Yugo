import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { YuGoColors } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <ThemedText style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </ThemedText>
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#090C14' : '#FFFFFF',
          borderTopColor: isDark ? '#283447' : '#DCE5EE',
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
        },
        tabBarActiveTintColor: YuGoColors.primary,
        tabBarInactiveTintColor: isDark ? YuGoColors.dark.muted : YuGoColors.light.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="🏠" focused={focused} />
              {itemCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -10,
                    backgroundColor: YuGoColors.primary,
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <ThemedText style={{ color: '#090C14', fontSize: 10, fontWeight: '700' }}>
                    {itemCount}
                  </ThemedText>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
