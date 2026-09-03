import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppTabs from '@/components/app-tabs';
import { IncomingRequestModal } from '@/components/incoming-request-modal';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import * as partnerApi from '@/services/mock-partner-api';
import { useDelivery, type Outcome, type OutcomeTone } from '@/state/delivery-context';
import { usePartnerAuth } from '@/state/partner-auth-context';
import type { IncomingOrderRequest } from '@/types/order';

/**
 * Wraps the tab navigator so the incoming-request subscription and its
 * full-screen modal (Master PRD §10.4, screen 7) can live above whichever
 * tab is active, without needing a router route or restructuring the
 * auth-gated Stack in the root layout. See PROJECT_CONTEXT.md §6.
 */
export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isOnline } = usePartnerAuth();
  const { startDelivery, pendingOutcome, consumePendingOutcome } = useDelivery();
  const [incomingRequest, setIncomingRequest] = useState<IncomingOrderRequest | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const outcomeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOnline) {
      // Can't accept an order while offline — drop whatever's showing.
      setIncomingRequest(null);
      return;
    }

    const unsubscribe = partnerApi.subscribeToIncomingRequests((request) => {
      // Ignore new deliveries while one is already being shown — see
      // subscribeToIncomingRequests' doc comment in mock-partner-api.ts.
      setIncomingRequest((current) => current ?? request);
    });

    return unsubscribe;
  }, [isOnline]);

  useEffect(() => {
    return () => {
      if (outcomeTimeoutRef.current) clearTimeout(outcomeTimeoutRef.current);
    };
  }, []);

  const showOutcome = useCallback((label: string, tone: OutcomeTone) => {
    if (outcomeTimeoutRef.current) clearTimeout(outcomeTimeoutRef.current);
    setOutcome({ label, tone });
    outcomeTimeoutRef.current = setTimeout(() => setOutcome(null), 2600);
  }, []);

  // Shows the "picked up — in-transit coming soon" banner set by
  // `confirmPickup()` (delivery-context.tsx) once the root layout has
  // already swapped back from `(delivery)` to `(tabs)` and this component
  // has remounted. Mirrors the accept/reject/expire outcomes below, just
  // sourced from context instead of a same-component action.
  useEffect(() => {
    if (!pendingOutcome) return;
    showOutcome(pendingOutcome.label, pendingOutcome.tone);
    consumePendingOutcome();
  }, [pendingOutcome, consumePendingOutcome, showOutcome]);

  function handleAccept() {
    if (!incomingRequest) return;
    // Pickup flow (TASKS.md item 6) now exists — hand off to DeliveryProvider,
    // which flips `activeDelivery` and the root layout swaps the whole Stack
    // to `(delivery)` on its own (see app/_layout.tsx). No banner here
    // anymore; the partner lands directly on the pickup screen instead of
    // being told to wait, since there's now somewhere real to go.
    startDelivery(incomingRequest);
    setIncomingRequest(null);
  }

  function handleReject() {
    setIncomingRequest(null);
    showOutcome('Request declined', 'warning');
  }

  function handleExpire() {
    setIncomingRequest(null);
    showOutcome('Request expired', 'error');
  }

  return (
    <View style={styles.flex}>
      <AppTabs />

      {outcome ? (
        <View
          pointerEvents="none"
          style={[styles.outcomeBanner, { top: insets.top + Spacing.two, backgroundColor: theme[outcome.tone] }]}>
          <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
            {outcome.label}
          </ThemedText>
        </View>
      ) : null}

      {incomingRequest ? (
        <IncomingRequestModal
          request={incomingRequest}
          onAccept={handleAccept}
          onReject={handleReject}
          onExpire={handleExpire}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  outcomeBanner: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    zIndex: 60,
  },
});
