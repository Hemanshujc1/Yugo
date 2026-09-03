/**
 * Mock implementation of the Delivery Partner backend endpoints described in
 * the Master PRD (§10.3.1, §10.4.1, §10.4 screen 7):
 *   - Firebase phone OTP  (POST /partner/auth/otp, POST /partner/auth/verify)
 *   - GET /partner/verification-status
 *   - GET /partner/requests/incoming (mocked as a subscription, see below)
 *
 * There is no real backend for the delivery-partner domain yet — `@yugo/api-client`
 * only exposes `getOrders` / `getShops`. Rather than wiring fake calls through the
 * shared client (which would misrepresent the real contract to other apps), this
 * module simulates the network with timers so the UI/UX can be built and tested
 * end-to-end now. Swap the function bodies for real `@yugo/api-client` calls once
 * the backend team ships the partner endpoints — the function signatures are
 * written to already match the documented request/response shape.
 */

import type { VerificationStatus } from '@/types/partner';
import type { IncomingOrderRequest } from '@/types/order';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simulates POST /partner/auth/otp — sends a 6-digit OTP to the given phone number. */
export async function requestOtp(phone: string): Promise<{ success: true }> {
  await delay(900);
  return { success: true };
}

/**
 * Simulates POST /partner/auth/verify — verifies the OTP and returns an auth token.
 * Mock rule: any 6-digit code is accepted (no real SMS is sent in this environment).
 */
export async function verifyOtp(phone: string, code: string): Promise<{ token: string }> {
  await delay(700);
  if (code.length !== 6) {
    throw new Error('Enter the 6-digit code sent to your phone.');
  }
  return { token: `mock-token-${phone}` };
}

/** Simulates uploading a single KYC document to backend/OCR pipeline. */
export async function uploadDocument(): Promise<{ success: true }> {
  await delay(1100);
  return { success: true };
}

/**
 * Simulates GET /partner/verification-status, polled after document submission.
 * Mock rule: resolves to "approved" after a short review window so the flow is
 * demoable end-to-end without a real Region Head / Admin reviewer.
 */
export async function checkVerificationStatus(
  attempt: number
): Promise<{ status: VerificationStatus; reason?: string }> {
  await delay(1500);
  if (attempt < 2) {
    return { status: 'under_review' };
  }
  return { status: 'approved' };
}

/**
 * Small pool of plausible mock shops/drop-off areas for the incoming-request
 * generator below. No real shop directory exists yet (`@yugo/api-client`'s
 * `getShops` isn't partner-scoped and has no address/distance data attached),
 * so this is a self-contained placeholder — replace with a real
 * `GET /partner/requests/incoming` payload once that endpoint exists.
 */
const MOCK_SHOPS: Array<{ name: string; address: string }> = [
  { name: 'Sharma General Store', address: 'Shop 4, Sector 12 Market' },
  { name: 'Green Leaf Grocery', address: '22 MG Road' },
  { name: "Patel's Pharmacy", address: 'Near City Hospital, Ring Road' },
  { name: 'Daily Fresh Mart', address: 'Plot 9, Model Town' },
];
const MOCK_DROPOFF_AREAS = ['Sector 15', 'Green Park Extension', 'Lake View Apartments', 'Civil Lines'];
const MOCK_ITEM_SUMMARIES = [
  '3 items · groceries',
  '1 item · medicine',
  '5 items · household essentials',
  '2 items · packaged food',
];

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Zero-padded 4-digit string, e.g. "0042" — matches how a real phone's last-4 would look. */
function randomLast4(): string {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

let requestCounter = 0;

function generateMockRequest(): IncomingOrderRequest {
  requestCounter += 1;
  const shop = randomFrom(MOCK_SHOPS);
  return {
    id: `mock-request-${Date.now()}-${requestCounter}`,
    shopName: shop.name,
    shopAddress: shop.address,
    dropoffArea: randomFrom(MOCK_DROPOFF_AREAS),
    distanceKm: Math.round((1 + Math.random() * 4) * 10) / 10,
    estimatedPayout: Math.round((35 + Math.random() * 45) / 5) * 5,
    itemsSummary: randomFrom(MOCK_ITEM_SUMMARIES),
    expiresInSeconds: 30,
    customerPhoneLast4: randomLast4(),
  };
}

/**
 * Simulates a live subscription to incoming delivery requests
 * (would eventually be `GET /partner/requests/incoming`, likely over a
 * websocket/long-poll in the real backend — Master PRD §10.4, screen 7).
 *
 * Fires a plausible mock request on a randomised 5–11s interval for as long
 * as the caller stays subscribed. The caller (currently `(tabs)/_layout.tsx`)
 * is responsible for only subscribing while the partner is online, and for
 * ignoring new deliveries while one is already being shown to the user — this
 * function does not track "is a request currently being reviewed," it just
 * keeps offering new ones on a timer, same as a real push subscription would.
 *
 * Returns an unsubscribe function; always call it on cleanup (partner goes
 * offline, or the tabs layout unmounts) to stop the timer.
 */
export function subscribeToIncomingRequests(onRequest: (request: IncomingOrderRequest) => void): () => void {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout>;

  function scheduleNext() {
    const delayMs = 5000 + Math.random() * 6000;
    timeoutId = setTimeout(() => {
      if (cancelled) return;
      onRequest(generateMockRequest());
      scheduleNext();
    }, delayMs);
  }

  scheduleNext();

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
}

/**
 * Simulates confirming pickup at the shop (Master PRD §10.4.3, "At Pickup" —
 * requires a photo of all items together before the partner can move on).
 * Not a named endpoint in the PRD's API list yet; the anticipated real
 * contract is something like `POST /partner/orders/:id/confirm-pickup` with
 * a multipart photo upload, likely also flipping backend order state to
 * `ORDER_PICKED_UP` (§10.5). No `expo-image-picker` is installed yet (see
 * PROJECT_CONTEXT.md §7), so this only simulates the network round-trip —
 * the UI-side "photo" is a static placeholder tile, same spirit as
 * `uploadDocument()` having no real file picker either.
 */
export async function confirmPickup(): Promise<{ success: true }> {
  await delay(1100);
  return { success: true };
}

/**
 * Simulates confirming delivery at the customer's door (Master PRD §10.4.3,
 * "Delivery" state — "OTP input; button: 'Mark Delivered'"; §10.5 names the
 * resulting backend state `DELIVERED`). Not a named endpoint in the PRD's
 * API list yet; anticipated real contract is something like
 * `POST /partner/orders/:id/confirm-delivery`, likely flipping backend order
 * state to `DELIVERED`. Deliberately takes no arguments and always
 * succeeds — same shape as `confirmPickup()`. Whether the entered code was
 * valid (the "any 6-digit OTP is accepted" mock rule, or a matched §10.9
 * last-4-of-customer-phone fallback) is decided by the caller
 * (`(delivery)/delivery-otp.tsx`) *before* calling this; this function only
 * simulates the network round-trip for an already-accepted code, exactly
 * like `confirmPickup()` only simulates the round-trip for an
 * already-captured photo. Attempt counting / the 1-minute lockout are pure
 * UI state, not a property of this mock network call.
 */
export async function confirmDelivery(): Promise<{ success: true }> {
  await delay(900);
  return { success: true };
}
