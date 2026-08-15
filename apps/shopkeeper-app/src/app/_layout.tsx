import "../../global.css";
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useSegments, useRouter } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProviders } from '@/components/app-providers';
import AppTabs from '@/components/app-tabs';
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
      segments[0] === 'verify-otp';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated user to welcome screen
      router.replace('/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated user to main app
      router.replace('/');
    }
  }, [isAuthenticated, segments, router]);

  return <AppTabs />;
}

export default function TabLayout() {
  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <RootLayoutNav />
    </AppProviders>
  );
}
