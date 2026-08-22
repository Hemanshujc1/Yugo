import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types/user.types';

export function useAuth() {
  const router = useRouter();
  const { user, token, isLoggedIn, isLoading, login, logout: logoutStore } = useAuthStore();

  const handleLogin = useCallback(
    (userData: User, authToken: string) => {
      login(userData, authToken);
      router.replace('/(tabs)');
    },
    [login, router],
  );

  const handleLogout = useCallback(() => {
    logoutStore();
    router.replace('/auth/login');
  }, [logoutStore, router]);

  return {
    user,
    token,
    isLoggedIn,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
  };
}
