import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import * as partnerApi from '@/services/mock-partner-api';
import type { ThemeColor } from '@/constants/theme';
import type { IncomingOrderRequest } from '@/types/order';

/**
 * State for the accepted-request → pickup → in-transit → delivery lifecycle
 * (Master PRD §10.4.3, "Reaching Pickup" / "At Pickup" / "Reaching Drop" /
 * "Delivery"). Deliberately a
 * sibling context to `PartnerAuthProvider`, not a field added to it — see
 * HANDOFF.md "Important decisions" for the reasoning (same split rationale
 * already applied to `types/order.ts` vs `types/partner.ts`: this is
 * delivery-loop state, not partner identity/onboarding state, and it has its
 * own lifecycle that's only relevant between Accept and drop-off).
 */

export type OutcomeTone = Extract<ThemeColor, 'success' | 'warning' | 'error'>;
export type Outcome = { label: string; tone: OutcomeTone };

/**
 * Local sub-state across the whole accepted-delivery lifecycle, not just the
 * pickup leg. Sixth session (2026-08-15) broadened this from the fifth
 * session's pickup-only `PickupPhase` (`'reaching' | 'arrived'`) to also
 * cover the in-transit leg (TASKS.md item 7, PRD §10.4.3 "Reaching Drop") —
 * see HANDOFF.md "Important decisions" for why a single widened field was
 * chosen over keeping `pickupPhase` untouched and adding a second flag
 * alongside it (that was the fifth session's other named option).
 * `'reaching_pickup'`/`'at_pickup'` replace the old `'reaching'`/`'arrived'`
 * names — loosely mirrors the PRD §10.5 state-machine names
 * (`ACCEPTED`/`ARRIVED_AT_MERCHANT`/`ORDER_PICKED_UP`) without adopting them
 * verbatim, consistent with how the fifth session's names were already
 * human-readable rather than backend-enum-exact. Seventh session
 * (2026-08-15) added `'arrived_at_customer'`, the exact fourth value the
 * sixth session's own handoff named in advance (TASKS.md item 8, PRD
 * §10.4.3 "Delivery" state) — same reasoning applies again: one linear
 * field, still mirroring PRD §10.5's own single-track enum.
 */
export type DeliveryPhase = 'reaching_pickup' | 'at_pickup' | 'in_transit' | 'arrived_at_customer';
export type PickupPhotoStatus = 'idle' | 'capturing' | 'captured';

interface DeliveryContextValue {
  /** The accepted request, or null when there's no delivery in progress. Root layout
   * (`app/_layout.tsx`) reads this to decide whether to mount `(delivery)` instead of
   * `(tabs)` — same state-driven-navigation pattern as the `isOnboarded` auth gate. */
  activeDelivery: IncomingOrderRequest | null;
  deliveryPhase: DeliveryPhase;
  pickupPhotoStatus: PickupPhotoStatus;
  /**
   * Set when a leg of the delivery loop ends at a point with no next screen
   * built yet — an outcome banner to show once the root layout swaps back to
   * `(tabs)`. `(tabs)/_layout.tsx` reads this on mount and calls
   * `consumePendingOutcome()` after displaying it. Mirrors how the
   * incoming-request accept/reject/expire outcomes already show a transient
   * banner there. **Seventh session: nothing in this file sets this
   * anymore.** Both prior "honest stopping point" uses (`confirmPickup()` in
   * the fifth session, `markReachedLocation()` in the sixth) were removed
   * once the screen each was stopping short of got built — the delivery
   * loop's last leg (item 8, this session) now has somewhere real to send
   * the partner at every step, so there's no more "coming soon" gap left to
   * announce this way. Left in place, still read by `(tabs)/_layout.tsx`,
   * as ready-to-use infrastructure for the next genuine "next screen isn't
   * built yet" stopping point (Phase 1 work), not dead code to delete.
   */
  pendingOutcome: Outcome | null;
  /** Called from `(tabs)/_layout.tsx`'s `handleAccept` when the partner accepts a request. */
  startDelivery: (request: IncomingOrderRequest) => void;
  /** "Reached Store" button on the Reaching-Pickup screen. */
  markReachedStore: () => void;
  /**
   * "Confirm Pickup" button on the At-Pickup screen. Simulates the mandatory
   * all-items photo capture + confirmation call, then advances
   * `deliveryPhase` to `'in_transit'` — the caller (`(delivery)/index.tsx`)
   * is responsible for navigating to `(delivery)/in-transit.tsx` afterward
   * (a `router.push`, not another state-gate — see HANDOFF.md "Important
   * decisions"). Sixth session: previously this cleared `activeDelivery`
   * entirely, since item 7 didn't exist; now that it does, that was the
   * one thing that needed to change here.
   */
  confirmPickup: () => Promise<void>;
  /**
   * "Reached Location" button on the in-transit (Reaching Drop) screen, PRD
   * §10.4.3. Seventh session: now that the delivery-OTP screen (item 8)
   * exists, this advances `deliveryPhase` to `'arrived_at_customer'` instead
   * of clearing `activeDelivery` — the caller (`(delivery)/in-transit.tsx`)
   * is responsible for navigating to `(delivery)/delivery-otp.tsx`
   * afterward (a `router.push`, same pattern the sixth session used for
   * pickup → in-transit). No mocked network delay — the PRD lists no
   * confirmation call for this button, only for the OTP step after it.
   */
  markReachedLocation: () => void;
  /**
   * "Mark Delivered" button on the delivery-OTP screen, PRD §10.4.3
   * "Delivery" state, called only after that screen has already decided the
   * entered code (or §10.9 last-4-of-customer-phone fallback) is valid —
   * see `services/mock-partner-api.ts#confirmDelivery`'s doc comment for why
   * this function takes no code/validation argument itself. This is the
   * actual end of the delivery loop (PRD §10.5's `DELIVERED` state): clears
   * `activeDelivery` (swapping the stack back to `(tabs)` on its own) with
   * no `pendingOutcome` banner, since the delivery-OTP screen shows its own
   * "Delivered ✓" confirmation before calling this — unlike
   * `markReachedLocation()`'s old use of the banner, there's no "coming
   * soon" message needed here, this is a real terminal success.
   */
  completeDelivery: () => void;
  consumePendingOutcome: () => void;
}

const DeliveryContext = createContext<DeliveryContextValue | null>(null);

export function DeliveryProvider({ children }: PropsWithChildren) {
  const [activeDelivery, setActiveDelivery] = useState<IncomingOrderRequest | null>(null);
  const [deliveryPhase, setDeliveryPhase] = useState<DeliveryPhase>('reaching_pickup');
  const [pickupPhotoStatus, setPickupPhotoStatus] = useState<PickupPhotoStatus>('idle');
  const [pendingOutcome, setPendingOutcome] = useState<Outcome | null>(null);

  const startDelivery = useCallback((request: IncomingOrderRequest) => {
    setActiveDelivery(request);
    setDeliveryPhase('reaching_pickup');
    setPickupPhotoStatus('idle');
  }, []);

  const markReachedStore = useCallback(() => {
    setDeliveryPhase('at_pickup');
  }, []);

  const confirmPickup = useCallback(async () => {
    setPickupPhotoStatus('capturing');
    await partnerApi.confirmPickup();
    setPickupPhotoStatus('captured');
    setDeliveryPhase('in_transit');
  }, []);

  const markReachedLocation = useCallback(() => {
    setDeliveryPhase('arrived_at_customer');
  }, []);

  const completeDelivery = useCallback(() => {
    setActiveDelivery(null);
    setDeliveryPhase('reaching_pickup');
    setPickupPhotoStatus('idle');
  }, []);

  const consumePendingOutcome = useCallback(() => {
    setPendingOutcome(null);
  }, []);

  const value = useMemo<DeliveryContextValue>(
    () => ({
      activeDelivery,
      deliveryPhase,
      pickupPhotoStatus,
      pendingOutcome,
      startDelivery,
      markReachedStore,
      confirmPickup,
      markReachedLocation,
      completeDelivery,
      consumePendingOutcome,
    }),
    [
      activeDelivery,
      deliveryPhase,
      pickupPhotoStatus,
      pendingOutcome,
      startDelivery,
      markReachedStore,
      confirmPickup,
      markReachedLocation,
      completeDelivery,
      consumePendingOutcome,
    ]
  );

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within a DeliveryProvider');
  return ctx;
}
