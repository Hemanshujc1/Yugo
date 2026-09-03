# YuGo Delivery Partner App — Tasks

Derived from `docs/YuGo_Master_PRD.pdf` Section 10 (Delivery Partner App).
Phase 0 was the core flow through the delivery loop (screens 1–10).
Phase 1 includes product-scope changes that simplify the flow and add productivity features.

Status legend: ✅ done · 🚧 in progress / partially done · ⬜ not started

## Phase 1 — Flow Simplifications & Productivity

1. ✅ **Remove Vehicle Mode selection** — Deleted `vehicle-mode.tsx` and the `VehicleType` data model entirely. Onboarding routes straight from Partner Type to Documents.
2. ✅ **Merchant Partner simplifications** — Merchant Partners skip documents upload (required array is empty). The flow handles this gracefully. Verification bypasses the `rejected` state (removed).
3. ✅ **Theme Toggle** — Implemented `ThemeContext` backed by `AsyncStorage`. Allows explicit Light/Dark/System manual override in the UI.
4. ✅ **Account Screen** — Replaced `(tabs)/explore.tsx` with `(tabs)/account.tsx`. Contains Profile Info, Document Status, Theme Toggle, Working Hours, and Logout (moved from Home screen).
5. ✅ **Working-hours auto-online scheduler** — Added a foreground-only `setInterval` paired with an `AppState` listener in `PartnerAuthProvider` to automatically toggle `isOnline` during working hours.
6. ✅ **Delivery Drop-off Photo** — Added a mandatory photo placeholder step (simulated capture) to `(delivery)/delivery-otp.tsx` before the Mark Delivered button is enabled, mirroring the pickup flow.

## Phase 0 — Onboarding & core loop

1. ✅ **Design system foundation** — brand colors/type-scale/spacing tokens in
   `constants/theme.ts`, extended `ThemedText` variants, shared UI primitives
   (`button`, `screen`, `text-field`, `otp-input`, `selectable-card`,
   `progress-dots`, `document-row`).
2. ✅ **Routing architecture** — `(onboarding)` / `(tabs)` route groups, auth-gated
   root layout, `PartnerAuthProvider` state machine, mock partner API layer.
3. ✅ **Onboarding flow screens** (PRD screens 1–5: Splash/OTP, Mode Selection,
   Documents, Verification) — **completed this session, full stack built**:
   - ✅ Welcome screen (`(onboarding)/index.tsx`)
   - ✅ Phone number entry (`(onboarding)/phone.tsx`)
   - ✅ OTP verification (`(onboarding)/otp.tsx`) — `OtpInput`, auto-submits at
     6 digits (manual "Verify" button as fallback), calls
     `usePartnerAuth().verifyOtp(code)`, inline error + clears input on
     failure, 30s resend countdown wired to `requestOtp()`, navigates to
     `/partner-type` on success.
   - ✅ **Partner Type selection** (`(onboarding)/partner-type.tsx`) — built
     this session. General vs Merchant via `SelectableCard` (its first real
     usage), `ProgressDots` (2 of 5, also its first real usage), calls
     `setPartnerType()`, navigates to `/vehicle-mode`.
   - ✅ **Vehicle Mode selection** (`(onboarding)/vehicle-mode.tsx`) — built
     this session. Two-Wheeler / EV / Bicycle via `SelectableCard`, calls
     `setVehicleType()`, navigates to `/documents`.
   - ✅ **Documents upload** (`(onboarding)/documents.tsx`) — built this
     session. Reads `requiredDocuments` from `usePartnerAuth()`, renders a
     `DocumentRow` per required doc, mocked upload via `uploadDocument(key)`.
     Merchant Partners also enter Full Name here (`setFullName()`) via
     `TextField`, with inline validation. Submit button calls
     `submitForReview()`, navigates to `/verification-pending`.
   - ✅ **Verification pending** (`(onboarding)/verification-pending.tsx`) —
     built this session. Polls `pollVerification(attempt)` in a loop, three
     local UI states (polling / approved / rejected — mock never returns
     `rejected` but the type allows it, so it's handled defensively with a
     "Review documents" recovery path). On approved, `isOnboarded` flips true
     in context and the root layout auto-swaps to `(tabs)`; a "Continue"
     button is present as the documented fallback, calling
     `router.replace('/')` (mostly redundant given the auto-swap, but covers
     any slow-device edge case where that transition feels like it's hanging).
   - **Every new screen added here must also get a `<Stack.Screen name="...">`
     entry in `(onboarding)/_layout.tsx`, or `tsc` will fail** (typed routes —
     see `PROJECT_CONTEXT.md` §3). All six onboarding screens are now
     registered.
4. ✅ **Home dashboard redesign** (PRD screen 6, §10.4.1) — **completed this
   session.** Replaced the default template content in `(tabs)/index.tsx`
   with:
   - Greeting header (time-of-day-aware "Good morning/afternoon/evening,
     <first name>" + partner type label), reading `fullName`/`partnerType`
     from `usePartnerAuth()`.
   - **`StatusToggle`** (`components/ui/status-toggle.tsx`, new primitive) —
     full-width Online/Offline switch, local `useState` in the screen (no
     "go online" backend endpoint exists yet — see "Important decisions" in
     `HANDOFF.md`).
   - Metrics card — today's earnings/trips/time-online, static mock numbers
     (`MOCK_TODAY_STATS` constant in the screen file), per this task's own
     "static mock data is fine" scope.
   - Styled dashed-border placeholder panel for the live-demand map — no
     `react-native-maps` integration attempted, per this task's explicit
     scope note (that's its own separate task, `PROJECT_CONTEXT.md` §7).
   - Did **not** wire the toggle to the metrics — going online/offline in
     this mock doesn't move the numbers, since there's no request-matching
     backend yet either (that's item 5 below).
   - **Eighth session (2026-08-15) addendum:** the header was missing the
     PRD's "current location text" (§10.4.1 lists it alongside the Status
     Toggle) — added as a static mock line (`MOCK_CURRENT_LOCATION`),
     exactly the placeholder `PROJECT_CONTEXT.md` §7 already called for
     pending real `expo-location` integration. See HANDOFF.md (eighth
     session) for the full account.
   - **Thirteenth session (2026-08-20) addendum:** added a "Log out" button
     to clear the `AsyncStorage` session and return cleanly to the Welcome
     screen. This is a basic usability requirement implicitly needed to manage
     persistent auth states, even if not strictly diagrammed in PRD §10.4.4.
5. ✅ **Incoming order request flow** (PRD screen 7) — **completed this
   session (fourth session, 2026-08-15).** Built as a full-screen overlay
   from `(tabs)/_layout.tsx`, not an `expo-router` route — see
   `PROJECT_CONTEXT.md` §6 for why. Specifically:
   - `services/mock-partner-api.ts` gained `subscribeToIncomingRequests()` —
     fires a mocked plausible request on a randomised 5–11s interval for as
     long as the caller stays subscribed, plus a small mock shop/drop-off
     data pool and `generateMockRequest()`.
   - `src/types/order.ts` (new file) — `IncomingOrderRequest` type.
   - `components/incoming-request-modal.tsx` (new file) — full-screen
     backdrop + card, live countdown (plain numeric text + a thin progress
     bar, no countdown-ring component — the simpler first pass, per the
     third session's own suggestion), Accept/Reject via the existing
     `Button` primitive.
   - **`isOnline` promoted from Home-screen-local `useState` into
     `PartnerAuthProvider`** (`state/partner-auth-context.tsx`), exactly as
     the third session's handoff flagged as necessary — the subscription
     needs to read it from `(tabs)/_layout.tsx`, outside the Home screen.
     `(tabs)/index.tsx`'s `StatusToggle` now reads/writes `isOnline`/
     `setOnline` from context instead of local state.
   - `(tabs)/_layout.tsx` rewritten (was a one-line pass-through) to own the
     subscription lifecycle (subscribe when `isOnline` flips true, unsubscribe
     when it flips false or on unmount), hold the currently-shown request in
     state (ignoring new deliveries while one is already up), and render a
     small transient outcome banner ("Request accepted…" / "declined" /
     "expired") after each resolution.
   - **On Accept:** the modal dismisses and the banner explicitly says
     "pickup flow coming soon" — item 6 doesn't exist yet, so this is
     honest rather than pretending to navigate somewhere real.
   - **Ninth session (2026-08-16) addendum — real gap found; fixed tenth
     session, verified-clean by real `tsc` eleventh session:** PRD §10.4.2
     specifies three things this screen didn't have: *"Flashing borders,
     loud distinct ringtone (overrides silent mode if permission
     granted)"* and *"Actions: swipe to accept, button to reject."*
     `incoming-request-modal.tsx` had neither a flash/pulse animation nor
     any sound, and Accept was a `Button` press, not a swipe gesture — this
     was simply missed by every session that built or reviewed this screen
     until the ninth session's dedicated PRD-conformance pass caught it.
     **Implemented tenth session (2026-08-16), by explicit ask, despite no
     compiler access at the time:**
     - New `components/ui/swipe-to-accept.tsx` — a reusable swipe-to-accept
       track built on `Gesture.Pan()` (`react-native-gesture-handler`) +
       shared values (`react-native-reanimated`), both pre-existing
       dependencies. Springs back on an incomplete swipe; a full swipe
       animates the rest of the way and then calls `onAccept` via
       `runOnJS`. Also exposes a full `accessibilityRole="button"` +
       `accessibilityActions`/`onAccessibilityAction` path so a double-tap
       still works for screen-reader users — a swipe-only control with no
       tap fallback would have been a real accessibility regression versus
       the button it replaces.
     - `components/incoming-request-modal.tsx` — Accept is now
       `<SwipeToAccept />` instead of a `Button`; Reject stays a plain
       `Button`, matching the PRD's own "swipe to accept, button to
       reject" wording. Added a continuous flashing-border animation
       (`withRepeat`/`interpolateColor` between `theme.border` and
       `theme.error`, 550ms half-cycle). Added a looping ringtone via
       `expo-audio`'s `createAudioPlayer` (deliberately NOT the
       `useAudioPlayer` hook — see the file's own doc comment for the SDK
       57 looping-after-unmount regression this works around) with
       `setAudioModeAsync({ playsInSilentMode: true })` for the PRD's
       "overrides silent mode" requirement.
     - New `assets/audio/incoming-request-ringtone.wav` — an original,
       programmatically synthesized two-note chime, avoiding any
       licensing question.
     - `app/_layout.tsx` — wrapped the whole app in
       `GestureHandlerRootView`, required for
       `react-native-gesture-handler` to receive touch events at all.
     - `package.json` — added `expo-audio` (`~57.0.3`).
     **Eleventh session (2026-08-16) update:** this sandbox had real npm
     registry access for the first time since the fifth session — `npm
     install` succeeded (925 packages) and confirmed `expo-audio` resolves
     cleanly at exactly `57.0.3`. `npx tsc --noEmit` ran for real against
     this entire implementation for the first time and came back clean
     (after fixing one unrelated real bug elsewhere — see item 8's
     `delivery-otp.tsx` note below). The `.wav` asset was confirmed to be
     a valid RIFF/WAVE/PCM file. **What's still NOT verified:** an actual
     live Metro bundle fetch (attempted three times this session, didn't
     complete due to background-process instability, not a network block
     this time) and any on-device/simulator test of the gesture, animation,
     or audio actually working at runtime — see `HANDOFF.md` (eleventh
     session) "Validation" for the full account. `tsc`-clean is real
     progress but is not the same as confirming this renders and behaves
     correctly on an actual device.
6. ✅ **Pickup flow** (PRD screen 8, "Reaching Pickup" / "At Pickup" states) —
   **completed this session (fifth session, 2026-08-15).** Built as a new
   top-level route group, `(delivery)`, sibling to `(onboarding)`/`(tabs)` in
   the root Stack, mounted via the same state-driven auth-gate pattern
   (see `PROJECT_CONTEXT.md` §6). Specifically:
   - `state/delivery-context.tsx` (new file) — `DeliveryProvider`/
     `useDelivery()`, a sibling context to `PartnerAuthProvider` (not merged
     into it — see "Important decisions" in `HANDOFF.md`). Holds
     `activeDelivery`, the local pickup sub-phase (`reaching`/`arrived`),
     photo-capture status, and a `pendingOutcome` handoff for the banner
     shown after pickup completes.
   - `services/mock-partner-api.ts` gained `confirmPickup()` — simulates the
     mandatory all-items-photo confirmation call (~1.1s delay, same style as
     `uploadDocument()`).
   - `app/(delivery)/_layout.tsx` + `app/(delivery)/index.tsx` (new route
     group, one screen) — "Reaching Pickup" (distance placeholder, "Reached
     Store") and "At Pickup" (order details, mandatory-photo placeholder per
     PRD §10.4.3, "Confirm Pickup").
   - `app/_layout.tsx`'s `RootNavigator` extended to a three-way switch:
     `(onboarding)` / `(delivery)` / `(tabs)`, gated on `isOnboarded` then
     `activeDelivery` — same state-driven-navigation pattern as the existing
     auth gate, no `router.push` needed to reach it.
   - `(tabs)/_layout.tsx`'s `handleAccept` now calls `startDelivery()`
     instead of showing "pickup flow coming soon" — that banner is gone;
     the partner is now taken directly to the pickup screen on Accept.
     A new banner ("Picked up — in-transit flow coming soon") fires once
     `confirmPickup()` clears `activeDelivery` and the stack swaps back to
     `(tabs)`, following the same "be honest that the next step isn't built
     yet" principle item 5 established.
   - `.expo/types/router.d.ts` hand-edited to register `(delivery)`,
     verified via a small script rather than by eye (see `HANDOFF.md`
     Validation section).
7. ✅ **In-transit flow** (PRD screen 9, "Reaching Drop") — **completed this
   session (sixth session, 2026-08-15).** Built as a sibling route inside
   the existing `(delivery)` group, reached via `router.push` from the
   pickup screen rather than another top-level state gate. Specifically:
   - `state/delivery-context.tsx` — the fifth session's pickup-only
     `PickupPhase` (`'reaching' | 'arrived'`) was broadened into a single
     `DeliveryPhase` (`'reaching_pickup' | 'at_pickup' | 'in_transit'`)
     covering the whole loop so far, replacing the old field name
     (`pickupPhase` → `deliveryPhase`) everywhere it was read. `confirmPickup()`
     no longer clears `activeDelivery` — it advances `deliveryPhase` to
     `'in_transit'` instead, now that there's somewhere real to send the
     partner.
   - `app/(delivery)/in-transit.tsx` (new file) — "Reaching Drop" screen:
     drop-off area name, a nav placeholder panel (same convention as the
     pickup screen's), "Reached Location" button.
   - `app/(delivery)/index.tsx`'s "Confirm Pickup" handler now does
     `await confirmPickup(); router.push('/in-transit')` instead of just
     awaiting the mock call.
   - New `markReachedLocation()` on `DeliveryProvider` — the "Reached
     Location" action. There's no delivery-OTP screen yet (item 8), so this
     is the current honest stopping point: clears `activeDelivery` (stack
     swaps back to `(tabs)`) and sets a "coming soon" banner, the same
     principle the fifth session's `confirmPickup()` used to apply before
     item 7 existed.
   - `app/(delivery)/_layout.tsx` — registered the new `in-transit` route.
   - `.expo/types/router.d.ts` hand-edited to register `/in-transit` under
     `(delivery)`, using the fifth session's verify-via-script technique
     (assert exact occurrence counts before replacing).
8. ✅ **Delivery / drop-off OTP flow** (PRD screen 10) — **completed this
   session (seventh session, 2026-08-15).** New sibling route inside the
   `(delivery)` group, reached via `router.push` from the in-transit
   screen's "Reached Location" handler, same pattern as item 7. This is the
   final leg of the core delivery loop — Phase 0 (screens 1–10) is now
   fully built end-to-end. Specifically:
   - `state/delivery-context.tsx` — `DeliveryPhase` gained a fourth value,
     `'arrived_at_customer'`. `markReachedLocation()` now advances the
     phase instead of clearing `activeDelivery`. New `completeDelivery()` —
     the actual terminal action, clears `activeDelivery`/resets phase, no
     `pendingOutcome` banner (the new screen shows its own "Delivered ✓"
     confirmation first).
   - `app/(delivery)/delivery-otp.tsx` (new file) — OTP entry (`OtpInput`,
     6 digits), "Mark Delivered" button, PRD §10.9 lockout (3 wrong
     attempts → field locks for 60s + offers a last-4-of-customer-phone
     fallback, verified against a new `customerPhoneLast4` mock field), and
     a terminal "Delivered ✓" state (auto-returns to `(tabs)` after ~1.8s,
     "Done" button as a fallback per the same convention
     `verification-pending.tsx` uses for its own auto-transition).
     **Eleventh session (2026-08-16) bugfix:** the first real `tsc` run
     this project has had since the fifth session caught a genuine
     `TS18047: 'activeDelivery' is possibly 'null'` error in this file's
     `handleSubmitFallback` — the screen's own `if (!activeDelivery) return
     null` guard narrows the type everywhere in the direct render body, but
     not inside that separately-declared closure. Fixed by capturing a
     local `const delivery = activeDelivery` right after the guard and
     using that inside the closure instead. See `HANDOFF.md` (eleventh
     session) for the full account — this had sat unverified through the
     seventh, eighth, ninth, and tenth sessions.
   - `types/order.ts` — `IncomingOrderRequest` gained `customerPhoneLast4`
     (only the last 4 digits are modeled — the only place this app ever
     needs customer phone data).
   - `services/mock-partner-api.ts` — new `confirmDelivery()` (~900ms
     delay, always succeeds — same shape as `confirmPickup()`), and
     `generateMockRequest()` now fills `customerPhoneLast4`. **Mock rule:**
     any 6-digit code succeeds *except* the literal `000000`, reserved so
     the lockout path is actually reachable/testable in this mock (there's
     no real backend to compare a code against otherwise).
   - `app/(delivery)/in-transit.tsx` — "Reached Location" now calls
     `markReachedLocation()` then `router.push('/delivery-otp')`.
   - `app/(delivery)/_layout.tsx` — registered the new `delivery-otp` route.
   - `.expo/types/router.d.ts` hand-edited to register `/delivery-otp`
     under `(delivery)`, using the fifth/sixth sessions' verify-via-script
     technique — see HANDOFF.md "Validation" for a note on a bug this
     session's first attempt introduced and then caught/fixed before
     finishing.

## Explicitly deferred (not Phase 0 blockers, don't start without a specific ask)

- ✅ Real font loading (Space Grotesk / Inter) — built this session
- ✅ Persistent auth/session storage (AsyncStorage for onboarding state) — built this session
- Real document capture (`expo-image-picker`) — §7
- Real maps (`react-native-maps` + API key) — §7
- Real geolocation (`expo-location`) — §7
- Promoting partner types into `@yugo/shared-types` once a real backend exists
- ✅ Add `ProgressDots` to `phone.tsx` and `otp.tsx` for visual consistency — done this session
- Earnings/wallet screens, ratings, support/help center (later PRD phases,
  not in the §10.4.4 Phase 0 table)

## Priority order for next sessions

1. **DONE, eleventh session (2026-08-16): real network access, real
   `tsc`, one real bug found and fixed.** This sandbox had genuine npm
   registry access (unlike the sixth through tenth sessions) — `npm
   install` succeeded (925 packages, including `expo-audio` resolving
   cleanly at exactly `57.0.3`), and `npx tsc --noEmit -p
   apps/delivery-app/tsconfig.json` ran for real for the first time since
   the fifth session. It found **one genuine error**: `TS18047:
   'activeDelivery' is possibly 'null'` in `delivery-otp.tsx`'s
   `handleSubmitFallback` — the file's own `if (!activeDelivery) return
   null` guard doesn't narrow into a separately-declared closure the way it
   does for code directly in the render body, so `activeDelivery` was
   still typed nullable at the one place inside that closure that read it.
   Fixed by capturing it into a local `const delivery = activeDelivery`
   right after the guard and using that inside the closure. **`tsc` is now
   clean, zero errors, across the full accumulated ten-session diff** —
   including the tenth session's swipe-to-accept/flashing-border/ringtone
   work, which is the largest single piece of code in this project that had
   never been compiler-checked before this session. Also confirmed the
   synthesized `.wav` asset is a valid RIFF/WAVE/PCM file (`file` command),
   and got a genuine `expo start`-driven regeneration of
   `.expo/types/router.d.ts` (confirmed via mtime, not hand-edited) —
   resolving the long-standing hand-edit caveat too. See `HANDOFF.md`
   (eleventh session) for the full account, including one still-open item:
   a live Metro bundle fetch (the specific check that would confirm the
   gesture/worklet/audio code not just compiles but actually bundles) was
   attempted three times this session and didn't complete due to
   background-process instability in this sandbox — not a new problem, the
   same one third-through-tenth sessions hit trying to keep a dev server
   alive across tool calls, just not the network-blocked wall those
   sessions saw. **This specific check (a live bundle fetch) is the one
   piece of "real tooling" validation still outstanding** — try it again
   if a future session has more reliable background-process survival.
2. **Phase 0 (the full core delivery loop, PRD §10.4.4 screens 1–10) was
   already code-complete going into this session** (established seventh
   session) and remains so — this session found and fixed a real bug in
   existing code rather than adding anything new. With `tsc` now clean, the
   natural next step is finally the **device/simulator test** every session
   since the sixth has deferred: go online, trigger an incoming request,
   and check the swipe-to-accept gesture, the flashing border, and the
   ringtone (including the "overrides silent mode" claim) actually work on
   a real phone or simulator, not just compile. Nothing about this app's
   code should currently block that test — it's purely a matter of a
   session having a working `expo start` + a connectable device/simulator,
   which no session so far (including this one, for the bundle-fetch
   portion specifically) has had at the same time as real npm access.
3. Other deferred items are listed above under "Explicitly deferred" —
   this session implemented real font loading, AsyncStorage persistence for
   the onboarding flow, and added missing `ProgressDots`. Continue with
   the remaining ones (camera, maps, geolocation) if instructed.

To reach a specific screen without redoing the whole loop each time while
testing: temporarily lower the delay in `subscribeToIncomingRequests`
(`mock-partner-api.ts`), or set `activeDelivery`/`deliveryPhase` directly
via a temporary test hook — revert any such hack before committing. To skip
onboarding entirely while testing: temporarily hardcode `isOnboarded: true`
in `partner-auth-context.tsx`'s `initialState` (revert before committing).
To test the delivery-OTP lockout specifically, enter `000000` three times.
