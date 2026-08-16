import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 12);
  const tabBarHeight = 56 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: '#9CA3AF33',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'house.fill', android: 'home', web: 'home' }
                  : { ios: 'house', android: 'home', web: 'home' }
              }
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'cube.box.fill', android: 'inventory_2', web: 'inventory_2' }
                  : { ios: 'cube.box', android: 'inventory_2', web: 'inventory_2' }
              }
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'archivebox.fill', android: 'inventory', web: 'inventory' }
                  : { ios: 'archivebox', android: 'inventory', web: 'inventory' }
              }
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'receipt.fill', android: 'receipt_long', web: 'receipt_long' }
                  : { ios: 'receipt', android: 'receipt_long', web: 'receipt_long' }
              }
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <SymbolView
              name={
                focused
                  ? { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view' }
                  : { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' }
              }
              size={22}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="customers"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
