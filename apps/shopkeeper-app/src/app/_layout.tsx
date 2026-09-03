import "../../global.css";
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useSegments, useRouter, Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProviders } from '@/components/app-providers';
import { useAuth } from '@/hooks';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup =
      segments[0] === '(auth)' ||
      segments[0] === 'welcome' ||
      segments[0] === 'login' ||
      segments[0] === 'verify-otp' ||
      segments[0] === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated user to welcome screen
      router.replace('/welcome' as any);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated user to main app
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

export default function TabLayout() {
  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <RootLayoutNav />
    </AppProviders>
  );
}

