import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useDelivery } from '@/state/delivery-context';

/**
 * In-transit flow (Master PRD §10.4.3, "Reaching Drop", TASKS.md item 7).
 * A sibling route to `(delivery)/index.tsx` inside the same `(delivery)`
 * group — reached via `router.push('/in-transit')` from the pickup screen's
 * "Confirm Pickup" handler once `confirmPickup()` advances `deliveryPhase`
 * to `'in_transit'`, not via another top-level state gate. See HANDOFF.md
 * "Important decisions" (sixth session) for why: the top-level gating
 * question (onboarding vs delivery vs tabs) was already answered by the
 * fifth session, and TASKS.md's own priority-order note for this task
 * suggested an in-stack push here specifically, since `(delivery)` was
 * already conditionally mounted for the whole delivery loop, not just
 * pickup.
 *
 * Unlike the pickup screen, this is a single phase/state, no local
 * sub-states — the PRD lists exactly one action here ("Reached Location"),
 * with no photo requirement or intermediate step the way "At Pickup" has.
 *
 * Seventh session: "Reached Location" now pushes to `(delivery)/delivery-otp.tsx`
 * (TASKS.md item 8) instead of ending the loop — same
 * `markReachedLocation()`-then-`router.push` pattern this screen's own
 * "Confirm Pickup" → in-transit handoff established one leg earlier.
 */
export default function InTransitScreen() {
  const theme = useTheme();
  const { activeDelivery, markReachedLocation } = useDelivery();

  // Defensive only — this screen is only ever pushed to from the pickup
  // screen's "Confirm Pickup" handler, which only runs while a delivery is
  // active, but the type is nullable.
  if (!activeDelivery) return null;

  function handleReachedLocation() {
    markReachedLocation();
    router.push('/delivery-otp');
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="caption" themeColor="textSecondary">
          HEADING TO DROP-OFF
        </ThemedText>
        <ThemedText type="h2">{activeDelivery.dropoffArea}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {activeDelivery.itemsSummary} · Order ID: {activeDelivery.id}
        </ThemedText>
      </View>

      <View style={[styles.navPlaceholder, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <ThemedText type="h1">🧭</ThemedText>
        <ThemedText type="bodyBold">Navigating to customer</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
          Turn-by-turn navigation isn't wired up yet — same placeholder convention as the pickup screen's nav
          panel. No separate drop-off distance is tracked in the mock yet, only the drop-off area name.
        </ThemedText>
      </View>

      <View style={styles.footer}>
        <Button label="Reached Location" onPress={handleReachedLocation} />
      </View>
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
  footer: { paddingBottom: Spacing.two, paddingTop: Spacing.four },
});
