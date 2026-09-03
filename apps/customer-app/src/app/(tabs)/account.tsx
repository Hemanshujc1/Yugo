import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/use-auth';
import { YuGoColors } from '@/constants/theme';

type MenuItem = {
  icon: string;
  label: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
};

export default function AccountScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark' || scheme === 'unspecified';
  const { user, logout } = useAuth();

  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is coming in the next update!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems: MenuItem[] = [
    { icon: '📍', label: 'My Addresses', onPress: showComingSoon },
    { icon: '❤️', label: 'My Wishlist', onPress: showComingSoon },
    { icon: '💰', label: 'YuGo Wallet', subtitle: '₹0.00', onPress: showComingSoon },
    { icon: '🎟️', label: 'Coupons & Offers', onPress: showComingSoon },
    { icon: '🎁', label: 'Refer & Earn', onPress: showComingSoon },
    { icon: '💬', label: 'Help & Support', onPress: showComingSoon },
    { icon: '🔒', label: 'Privacy Policy', onPress: showComingSoon },
    { icon: '🚪', label: 'Logout', color: YuGoColors.error, onPress: handleLogout },
  ];

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#090C14' : '#F6F8FB' }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Profile Header */}
        <View className="items-center py-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: YuGoColors.primary + '20' }}
          >
            <ThemedText style={{ fontSize: 28, fontWeight: '700', color: YuGoColors.primary }}>
              {initials}
            </ThemedText>
          </View>
          <ThemedText type="smallBold" style={{ fontSize: 20 }}>
            {user?.name ?? 'User'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            +91 {user?.phone ?? ''}
          </ThemedText>
          <Pressable
            className="mt-3 rounded-full px-5 py-2"
            style={{
              borderWidth: 1.5,
              borderColor: YuGoColors.primary,
            }}
            onPress={showComingSoon}
          >
            <ThemedText style={{ color: YuGoColors.primary, fontSize: 13, fontWeight: '600' }}>
              Edit Profile
            </ThemedText>
          </Pressable>
        </View>

        {/* Menu */}
        <View className="px-4">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              className="flex-row items-center py-4"
              style={{
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? '#283447' : '#DCE5EE',
              }}
            >
              <ThemedText style={{ fontSize: 20, marginRight: 14 }}>{item.icon}</ThemedText>
              <ThemedText
                type="small"
                className="flex-1"
                style={{
                  fontWeight: '500',
                  color: item.color ?? (isDark ? YuGoColors.dark.text : YuGoColors.light.text),
                }}
              >
                {item.label}
              </ThemedText>
              {item.subtitle && (
                <ThemedText type="small" themeColor="textSecondary" className="mr-2">
                  {item.subtitle}
                </ThemedText>
              )}
              <ThemedText style={{ color: isDark ? YuGoColors.dark.muted : YuGoColors.light.muted }}>›</ThemedText>
            </Pressable>
          ))}
        </View>

        {/* App version */}
        <ThemedText
          type="small"
          themeColor="textSecondary"
          className="text-center mt-8"
          style={{ fontSize: 12 }}
        >
          YuGo v1.0.0
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}
