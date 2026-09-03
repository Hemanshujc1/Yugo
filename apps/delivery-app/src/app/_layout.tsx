import "../../global.css";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { DeliveryProvider, useDelivery } from '@/state/delivery-context';
import { PartnerAuthProvider, usePartnerAuth } from '@/state/partner-auth-context';
import { ThemeProvider as AppThemeProvider, useAppThemeContext } from '@/state/theme-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <AppThemeProvider>
        <ThemeAdapter>
          <PartnerAuthProvider>
            <DeliveryProvider>
              <AnimatedSplashOverlay />
              <RootNavigator />
            </DeliveryProvider>
          </PartnerAuthProvider>
        </ThemeAdapter>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

function ThemeAdapter({ children }: React.PropsWithChildren) {
  const { activeTheme } = useAppThemeContext();
  return (
    <ThemeProvider value={activeTheme === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { isReady, isOnboarded } = usePartnerAuth();
  const { activeDelivery } = useDelivery();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inDeliveryGroup = segments[0] === '(delivery)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isOnboarded) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)');
      }
    } else if (activeDelivery) {
      if (!inDeliveryGroup) {
        router.replace('/(delivery)');
      }
    } else {
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [isReady, isOnboarded, activeDelivery, segments, router]);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(delivery)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

