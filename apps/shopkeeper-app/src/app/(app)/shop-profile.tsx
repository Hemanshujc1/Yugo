import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Screen, ThemedView, PageHeader } from '@/components';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useShopSettings } from '@/hooks';

export default function ShopProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useShopSettings();

  const [shopName, setShopName] = useState(profile?.shopName || '');
  const [shopkeeperName, setShopkeeperName] = useState(profile?.shopkeeperName || '');
  const [phone] = useState(profile?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(profile?.email || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [city, setCity] = useState(profile?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(profile?.pincode || '560038');
  const [logoUri, setLogoUri] = useState<string | undefined>(profile?.logoUri);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSaveProfile = async () => {
    setFormError(null);
    setSuccessMsg(false);

    if (!shopName.trim()) {
      setFormError('Shop Name is required.');
      return;
    }
    if (!shopkeeperName.trim()) {
      setFormError('Shopkeeper Name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Shop Address is required.');
      return;
    }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      setFormError('Please enter a valid 6-digit Indian Pincode.');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        shopName: shopName.trim(),
        shopkeeperName: shopkeeperName.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        logoUri,
      });

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save shop profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeLogo = () => {
    // Placeholder image picker action
    const mockLogos = [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
    ];
    const nextLogo = logoUri === mockLogos[0] ? mockLogos[1] : mockLogos[0];
    setLogoUri(nextLogo);
  };

  return (
    <Screen safeArea style={[styles.screen, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Shop Profile' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 32, BottomTabInset + Spacing.six) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <PageHeader
            title="Shop Profile"
            subtitle="Manage your store details, location, and owner contact information."
          />

          {/* Logo / Avatar Block */}
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <View style={styles.logoRow}>
              <View style={[styles.avatarBox, { backgroundColor: '#2563EB22', borderColor: '#2563EB' }]}>
                <AppText variant="h1" style={{ color: '#2563EB', fontWeight: '800' }}>
                  {shopName ? shopName.charAt(0).toUpperCase() : 'Y'}
                </AppText>
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="subtitle" style={{ fontWeight: '800' }}>
                  {shopName || 'Yugo Fresh Mart'}
                </AppText>
                <AppText variant="caption" style={{ color: theme.textSecondary }}>
                  Store Branding & Logo Avatar
                </AppText>
                <Pressable onPress={handleChangeLogo} style={{ alignSelf: 'flex-start' }}>
                  <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '800' }}>
                    📷 Change Logo
                  </AppText>
                </Pressable>
              </View>
            </View>
          </ThemedView>

          {/* Profile Form */}
          <ThemedView type="backgroundElement" style={[styles.card, { borderColor: '#9CA3AF22' }]}>
            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Shop Name *
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="e.g. Yugo Fresh Mart"
                placeholderTextColor={theme.textSecondary}
                value={shopName}
                onChangeText={setShopName}
              />
            </View>

            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Shopkeeper Name *
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="e.g. Ankur Sharma"
                placeholderTextColor={theme.textSecondary}
                value={shopkeeperName}
                onChangeText={setShopkeeperName}
              />
            </View>

            {/* Read-only Account Phone */}
            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Account Phone Number (Contact Identifier)
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.textSecondary, borderColor: '#9CA3AF44', backgroundColor: '#9CA3AF11' }]}
                value={phone}
                editable={false}
              />
              <AppText variant="caption" style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                ℹ️ Phone number is your primary account identifier and cannot be changed here.
              </AppText>
            </View>

            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Email Address
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="e.g. shop@example.com"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <View>
              <AppText variant="caption" style={{ fontWeight: '700' }}>
                Street Address *
              </AppText>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="e.g. 12 MG Road, Indiranagar"
                placeholderTextColor={theme.textSecondary}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.two }}>
              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  City *
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="Bengaluru"
                  placeholderTextColor={theme.textSecondary}
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={{ flex: 1 }}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  Pincode * (6 digits)
                </AppText>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                  placeholder="560038"
                  placeholderTextColor={theme.textSecondary}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {formError && (
              <AppText variant="caption" style={{ color: '#DC2626', fontWeight: '700' }}>
                ⚠️ {formError}
              </AppText>
            )}

            {successMsg && (
              <AppText variant="caption" style={{ color: '#10B981', fontWeight: '800' }}>
                ✓ Shop profile updated successfully!
              </AppText>
            )}

            <Button
              title={isSubmitting ? 'Saving Profile...' : 'Save Profile Details'}
              variant="primary"
              onPress={handleSaveProfile}
            />
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    padding: Spacing.four,
    borderRadius: 20,
    gap: Spacing.three,
    borderWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: Spacing.three,
    marginTop: 4,
    fontSize: 14,
  },
});
