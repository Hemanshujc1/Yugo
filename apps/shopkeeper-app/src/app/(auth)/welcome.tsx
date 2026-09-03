import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen, AppText } from '@/components';
import { palette } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borders';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks';

export default function WelcomeScreen() {
  const theme = useTheme();
  const { login } = useAuth();

  return (
    <Screen safeArea scrollable contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {/* Brand Icon Badge */}
        <View style={[styles.badge, { backgroundColor: theme.backgroundElement }]}>
          <SymbolView
            name={{ ios: 'storefront.fill', android: 'store', web: 'store' }}
            size={36}
            tintColor={palette.primary[500]}
          />
        </View>

        {/* Hero Headlines */}
        <View style={styles.header}>
          <AppText variant="h1" style={styles.title}>
            Yugo Shopkeeper
          </AppText>
          <AppText variant="subtitle" style={[styles.subtitle, { color: theme.textSecondary }]}>
            The complete store management platform for modern retailers. Track orders, manage stock, and grow your business.
          </AppText>
        </View>

        {/* Feature Highlights */}
        <View style={styles.features}>
          <FeatureCard
            icon={{ ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }}
            title="Real-Time Order Processing"
            description="Receive and manage incoming customer orders instantly."
          />
          <FeatureCard
            icon={{ ios: 'cube.box.fill', android: 'inventory_2', web: 'inventory_2' }}
            title="Smart Inventory Tracking"
            description="Never run out of stock with automated inventory alerts."
          />
          <FeatureCard
            icon={{ ios: 'chart.bar.fill', android: 'analytics', web: 'analytics' }}
            title="Instant Business Insights"
            description="Monitor daily revenue, top products, and shop performance."
          />
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.loginButton}
          onPress={() => {
            login('shopkeeper@yugo.com', 'Demo Shopkeeper', 'Yugo Supermart', '+91 98765 43210');
            router.replace('/' as any);
          }}
        >
          <AppText style={styles.loginButtonText}>Login to Shop Dashboard</AppText>
        </Pressable>

        <View style={styles.registerPromptRow}>
          <AppText variant="caption" style={{ color: theme.textSecondary }}>
            {"Don't have an account? "}
          </AppText>
          <Pressable onPress={() => router.push('/register' as any)}>
            <AppText variant="caption" style={{ color: palette.primary[600], fontWeight: '600' }}>
              Create Account
            </AppText>
          </Pressable>
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => router.push('/explore' as any)}>
          <AppText variant="caption" style={{ color: palette.primary[600] }}>
            Learn more in Explore Guide →
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.featureCard, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.featureIconContainer}>
        <SymbolView name={icon} size={20} tintColor={palette.primary[500]} />
      </View>
      <View style={styles.featureTextContainer}>
        <AppText variant="subtitle" weight="semiBold" style={styles.featureTitle}>
          {title}
        </AppText>
        <AppText variant="caption" style={{ color: theme.textSecondary }}>
          {description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  content: {
    gap: spacing.xl,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: palette.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 15,
  },
  footer: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  loginButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
