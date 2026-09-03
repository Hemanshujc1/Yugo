/**
 * Domain types for the delivery request loop (Master PRD §10.4, PRD screens
 * 7–10: incoming request, pickup, in-transit, delivery). Split out from
 * `types/partner.ts` since that file is about partner identity/KYC and this
 * is about orders — see PROJECT_CONTEXT.md §6 for the reasoning.
 *
 * No order-matching backend exists yet (`@yugo/api-client` only has
 * `getOrders`/`getShops`, and those aren't partner-scoped). These types
 * describe the mocked shape produced by `services/mock-partner-api.ts`'s
 * `subscribeToIncomingRequests`, written to look like a plausible real
 * `GET /partner/requests/incoming` payload so a later swap is mechanical.
 */

export interface IncomingOrderRequest {
  id: string;
  shopName: string;
  shopAddress: string;
  dropoffArea: string;
  distanceKm: number;
  estimatedPayout: number;
  itemsSummary: string;
  /** Countdown duration, in seconds, that the partner has to accept or reject. */
  expiresInSeconds: number;
  /**
   * Last 4 digits only (seventh session, TASKS.md item 8) — the PRD §10.9
   * OTP-lockout fallback ("verify the last 4 digits of the customer's phone
   * number") is the only place this app ever needs customer phone data, so
   * only the last 4 digits are modeled rather than a full number nothing
   * else in the app displays or dials. Not a real backend field name (no
   * `GET /partner/requests/incoming` contract exists yet) — a mock-shaped
   * placeholder like every other field on this type.
   */
  customerPhoneLast4: string;
}
