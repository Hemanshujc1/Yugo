import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDelivery } from '@/state/delivery-context';

/**
 * Pickup flow (Master PRD §10.4.3, TASKS.md item 6). Two local phases:
 * "Reaching Pickup" (navigate-to-shop + "Reached Store") and "At Pickup"
 * (order details + mandatory items photo + "Confirm Pickup"). Kept as one
 * screen with local phase state read from `DeliveryProvider`, rather than
 * two separate routes — same reasoning `verification-pending.tsx` used for
 * its polling/approved/rejected states: these aren't independently
 * deep-linkable steps, just sub-states of one task the partner is in the
 * middle of.
 *
 * Mounted by the root layout's state-driven navigation (see app/_layout.tsx)
 * whenever `activeDelivery` is set — not reached via `router.push`. Unlike
 * the fifth session's version, confirming pickup no longer clears
 * `activeDelivery` (that happened when in-transit, item 7, didn't exist yet);
 * it now advances `deliveryPhase` to `'in_transit'` and this screen does a
 * real `router.push` to `(delivery)/in-transit.tsx` — see HANDOFF.md
 * "Important decisions" (sixth session) for why the pickup→in-transit
 * handoff is an in-stack navigation rather than another top-level state gate,
 * unlike onboarding→tabs and tabs→delivery, which both use the state-gate
 * pattern.
 */
export default function PickupScreen() {
  const theme = useTheme();
  const { activeDelivery, deliveryPhase, pickupPhotoStatus, markReachedStore, confirmPickup } = useDelivery();

  // Defensive only — the root layout never mounts this screen without an
  // active delivery, but the type is nullable.
  if (!activeDelivery) return null;

  const isCapturing = pickupPhotoStatus === 'capturing';

  async function handleConfirmPickup() {
    await confirmPickup();
    router.push('/in-transit');
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="caption" themeColor="textSecondary">
          {deliveryPhase === 'reaching_pickup' ? 'HEADING TO PICKUP' : 'AT PICKUP'}
        </ThemedText>
        <ThemedText type="h2">{activeDelivery.shopName}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {activeDelivery.shopAddress}
        </ThemedText>
      </View>

      {deliveryPhase === 'reaching_pickup' ? (
        <>
          <View
            style={[styles.navPlaceholder, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <ThemedText type="h1">🧭</ThemedText>
            <ThemedText type="bodyBold">Navigating to shop</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              Turn-by-turn navigation isn't wired up yet — {activeDelivery.distanceKm} km away, same distance
              shown on the request card.
            </ThemedText>
          </View>

          <View style={styles.footer}>
            <Button label="Reached Store" onPress={markReachedStore} />
          </View>
        </>
      ) : (
        <>
          <View
            style={[styles.orderCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <ThemedText type="caption" themeColor="textSecondary">
              ORDER
            </ThemedText>
            <ThemedText type="bodyBold">{activeDelivery.itemsSummary}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Order ID: {activeDelivery.id}
            </ThemedText>
          </View>

          <ThemedText type="bodyBold" style={styles.photoLabel}>
            Photo of all items together
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.photoHint}>
            Required before you can confirm pickup.
          </ThemedText>

          <Pressable
            disabled={isCapturing}
            accessibilityRole="button"
            style={[
              styles.photoTile,
              { borderColor: theme.border, backgroundColor: theme.surface, opacity: isCapturing ? 0.6 : 1 },
            ]}>
            <ThemedText type="h1">📷</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
              {isCapturing
                ? 'Capturing…'
                : 'No real camera yet (expo-image-picker not installed) — tapping this is a no-op; Confirm Pickup below simulates the capture.'}
            </ThemedText>
          </Pressable>

          <View style={styles.footer}>
            <Button label="Confirm Pickup" onPress={handleConfirmPickup} loading={isCapturing} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.half, marginBottom: Spacing.four },
  navPlaceholder: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  centerText: { textAlign: 'center' },
  orderCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.half,
    marginBottom: Spacing.four,
  },
  photoLabel: { marginBottom: Spacing.half },
  photoHint: { marginBottom: Spacing.three },
  photoTile: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  footer: { paddingBottom: Spacing.two, paddingTop: Spacing.four },
});
