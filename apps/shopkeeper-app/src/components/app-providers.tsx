import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { AuthProvider } from '@/context/auth-context';
import { ProductProvider } from '@/context/product-context';
import { OrderProvider } from '@/context/order-context';
import { NotificationProvider } from '@/context/notification-context';
import { ShopSettingsProvider } from '@/context/shop-settings-context';
import { initService } from '@/services/init-service';

export interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const colorScheme = useColorScheme();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    initService
      .hydrateAll()
      .then(() => {
        if (isMounted) setIsHydrated(true);
      })
      .catch((err) => {
        console.error('App hydration failed:', err);
        if (isMounted) setIsHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <NotificationProvider>
            <ShopSettingsProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                {children}
              </ThemeProvider>
            </ShopSettingsProvider>
          </NotificationProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
