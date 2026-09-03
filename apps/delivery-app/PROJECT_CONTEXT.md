# YuGo Delivery Partner App — Project Context

This file is the source of truth for anyone (human or agent) picking up work on
`apps/delivery-app`. Read this, then `TASKS.md`, then `HANDOFF.md` before touching code.

## 0. Repository reality check (read this first)

This app was found in its **unmodified `create-expo-app` default template state** —
`index.tsx` (demo counter/links screen) and `explore.tsx` (default template
tutorial content) were the only screens, with no auth, no branding, and no
delivery-partner-specific code anywhere. There was no prior `PROJECT_CONTEXT.md`,
`TASKS.md`, or `HANDOFF.md` in the repository. This file and its siblings were
created from scratch on **2026-08-14** by bootstrapping directly from
`docs/YuGo_Master_PRD.pdf` (Section 10 — Delivery Partner App). If a future
session finds this note stale (i.e. the app is clearly further along than
described here), trust the code over this document and update it.

## 1. What this app is

The Delivery Partner mobile app, used by YuGo riders to onboard, go online,
accept delivery requests, and complete deliveries. Spec source: `docs/YuGo_Master_PRD.pdf`,
Section 10. Two partner types exist:

- **General Partner** — freelance, works across multiple shops, full KYC (Aadhaar
  front/back, Driving Licence, Vehicle RC, selfie).
- **Merchant Partner** — hired by a single shop, lighter KYC (Aadhaar + selfie),
  since the shop vouches for them.

## 2. Monorepo layout

Turborepo, npm workspaces. Root `package.json` requires `npm 11.12.1` via
`devEngines` — **the current sandbox only has npm 10.9.7 pre-installed**, so
plain `npm`/`npx` fail with `EBADDEVENGINES`. **Better workaround found this
session (2026-08-14, second session):** `npm install -g npm@11.12.1` succeeds
in this sandbox — it's a global npm self-update, not a project-scoped install,
so the `devEngines` check in the repo's own `package.json` never gets a chance
to block it. After that, `npm -v` reports `11.12.1` and plain `npm install`
/ `npx <anything>` work normally for the rest of the session — no need to
invoke binaries manually via `node node_modules/<pkg>/bin/...` anymore. If a
future session finds the sandbox back on an older npm, try this first before
falling back to the manual-invocation workaround. This unlocked running
`npx expo start` itself (briefly, headlessly) this session, which had not
been possible before — see §3 note on `router.d.ts` below.

```
apps/
  delivery-app/    ← this app (Expo Router, React Native, NativeWind)
  customer-app/    ← same default template state, untouched, not our concern
  shopkeeper-app/  ← same default template state, untouched, not our concern
  admin-web/       ← Next.js (untouched)
  shopkeeper-web/  ← Next.js (untouched)
packages/
  shared-types/    ← @yugo/shared-types — Order, Shop, UserRole. Minimal, no
                      Partner/Delivery types yet (see §5).
  api-client/      ← @yugo/api-client — axios wrapper, only getOrders/getShops.
                      No partner/auth/verification endpoints exist yet.
docs/
  YuGo_Master_PRD.pdf   ← full product spec, all four apps + brand system.
                           Section 10 = Delivery Partner App (the one that matters here).
  Research-report.md    ← market research background.
```

**Rule respected this session and going forward:** do not modify `customer-app`,
`shopkeeper-app`, `admin-web`, `shopkeeper-web`, or the contents of `packages/`.
Domain types specific to the delivery-partner flow that don't have a backend
contract yet live locally in `apps/delivery-app/src/types/`, not in
`@yugo/shared-types` (see §5 for the promotion path once a real backend exists).

## 3. Delivery-app tech stack (as actually configured — verify before assuming newer APIs)

- Expo SDK / `expo` package: **57.0.12**
- `expo-router`: file-based routing, **typed routes are ON**
  (`app.json` → `experiments.typedRoutes: true`). This matters: any
  `router.push('/some-route')` where `some-route` has no matching file will fail
  `tsc`, not just fail at runtime. Typed route declarations live in
  `.expo/types/router.d.ts` and are normally regenerated automatically by the
  Metro dev server (`expo start`). **Update (2026-08-14, second session,
  full session):** the npm-upgrade workaround (§2) made `npx expo start
  --no-dev --offline` runnable headlessly (backgrounded, polled until Metro
  reported ready, then killed) and it genuinely worked for the `otp.tsx`
  addition early in the session — confirmed via a real bundle fetch
  (`/node_modules/expo-router/entry.bundle?platform=ios` → HTTP 200, ~8MB, no
  embedded errors) and `router.d.ts` regenerating for real with `/otp` in it.
  **Later in the same session this stopped working reliably** — background
  processes and `/tmp` files stopped surviving between tool calls (sandbox
  instability, not a code issue), so for `partner-type.tsx` through
  `verification-pending.tsx` the fallback was **hand-editing
  `.expo/types/router.d.ts`** again (same technique the first session used
  for the whole file). `tsc --noEmit` is clean either way — the hand-edit
  just mirrors Metro's own output format — but **a future session with a
  stable dev server should let a real `expo start` regenerate this file from
  scratch and diff it against what's here**, as a sanity check that the
  manual edit didn't drift from what Metro would actually produce.
  **Update (2026-08-15, third session):** not directly relevant this
  session — item 4 (Home dashboard) only edited an existing route
  (`(tabs)/index.tsx`) and added a component, no new route file, so
  `router.d.ts` needed no changes either way. Did try `npx expo start
  --no-dev --offline` again anyway as a sanity check: this time it printed
  **"Networking has been disabled"** and Metro never opened port 8081 (curl
  to `localhost:8081` got no connection at all, not even an error response,
  after 30+s) — a step further degraded than the second session's
  "worked once, then got flaky" experience. Not investigated further since
  it wasn't blocking this session's actual task and `tsc` gives strong
  secondary confidence for a same-route edit. **Still flagged as unverified
  by a real bundle fetch — try this fresh in whatever sandbox picks up the
  next route-adding task (item 5).**
  **Update (2026-08-15, fourth session):** tried again (`npm install -g
  npm@11.12.1` worked fine this session, fresh `npm install` at repo root
  succeeded, 924 packages, matching the second/third session's count) —
  `npx expo start --no-dev --offline` printed the exact same **"Networking
  has been disabled"** message as the third session and nothing ever bound
  port 8081, even after 18+s of polling. Also not a code issue and not new
  this session (third session hit the identical wall). This session's
  actual change (incoming-request feature) added no new route file either,
  so — same as the third session's reasoning — `tsc` cleanliness is the
  strongest available signal, and it's genuinely clean. **Third session in a
  row without a live bundle fetch; second session remains the only one that
  got one to work.** Worth a future session trying a materially different
  approach (e.g. `expo export` instead of `expo start`, which doesn't need
  an open port) if verifying an actual render matters enough to invest in.
  **Update (2026-08-15, fifth session):** this session added a genuinely new
  route file (`(delivery)/index.tsx` plus its `_layout.tsx`), so unlike the
  third/fourth sessions this really did need `.expo/types/router.d.ts` to
  gain a new entry — not just re-verify an unchanged one. Did **not**
  attempt `expo start` again this session (same "Networking has been
  disabled" wall three sessions running made it a low-odds use of the
  session's time); instead hand-edited `router.d.ts` directly, same
  technique as the first/second/third sessions used, but this time verified
  the edit programmatically (a small Python script asserting exact
  occurrence counts before replacing, rather than eyeballing a >2000-
  character minified line) — see `HANDOFF.md` Validation section for the
  approach. `tsc --noEmit` confirms the edit is well-formed and consistent
  with the rest of the file, but — same caveat as every hand-edit before it —
  this is **not the same as a real `expo start` regenerating it**, and the
  suggestion to try `expo export` still stands for whichever future session
  wants to finally resolve this.
  **Update (2026-08-15, sixth session):** this sandbox has **no outbound
  network access at all** — a step further degraded than every prior
  session's experience. `npm install -g npm@11.12.1` itself failed
  (`403 Forbidden` reaching `registry.npmjs.org`), so unlike the first
  through fifth sessions, this session could not even get past the
  `devEngines` mismatch to run `npm install`, let alone `npx tsc --noEmit`
  or attempt `expo start`. No `node_modules` directory exists in this
  checkout either. **This session's TypeScript changes are therefore
  entirely unverified by a compiler** — see `HANDOFF.md` "Validation" for
  the manual-review approach used instead (careful re-reading of every
  touched file, cross-checking renamed identifiers with `grep`, and reusing
  the fifth session's assert-occurrence-count script technique for the
  `router.d.ts` hand-edit specifically, which doesn't need `tsc` to trust).
  **A future session with real network access should run
  `npx tsc --noEmit -p apps/delivery-app/tsconfig.json` before doing
  anything else**, to catch anything this session's manual review missed.
  **Update (2026-08-15, seventh session):** same wall again — no outbound
  network access, no `node_modules`, no project-configured `tsc`. This
  session's diff (item 8, delivery-OTP) has therefore never been
  compiler-checked either, on top of the sixth session's still-unverified
  diff — **two sessions running now with zero real `tsc` coverage.** Same
  manual-review substitute used again (see `HANDOFF.md` "Validation"),
  with one addition worth flagging honestly: this session's first attempt
  at the `router.d.ts` hand-edit script introduced a real bug (a stray `;`
  inserted before each new union member, e.g. `...UnknownInputParams; }; |
  { pathname: ...delivery-otp...`, which is invalid TS) — the
  occurrence-count assertions caught that the *counts* were right, but the
  script didn't check the surrounding syntax, so the bug slipped through
  the first verification pass and was only caught by actually reading the
  diff afterward. Fixed in a follow-up pass, re-verified via the same
  brace/paren-balance check plus a direct read of the edited region. This
  is a real gap in the occurrence-count technique itself, not just this
  session's execution of it — see `HANDOFF.md` "Important decisions" for
  the specific lesson.
  **Update (2026-08-15, eighth session):** same wall a third session
  running — but this time confirmed with a concrete result instead of
  inferred from absence: `npm install --prefer-offline --no-audit --no-fund`
  failed immediately on the `devEngines` mismatch (`EBADDEVENGINES`, npm
  10.9.7 vs. the required 11.12.1, same as every session since the sixth);
  re-run with `--force` to get past that got further, then failed with a
  hard `npm error 403 403 Forbidden - GET
  https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz` — an
  explicit egress-proxy denial, not a timeout or a hang. That's slightly
  more informative than the sixth/seventh sessions' "no outbound network
  access at all" framing: the proxy is reachable and responds, it's denying
  registry traffic specifically. Still no `node_modules`, still no real
  `tsc`. This session's only code change (Home-screen location text, TASKS
  item 4 addendum) is a single-line-of-JSX addition using only primitives
  and theme tokens already used elsewhere in the same file, reviewed the
  same manual way as the sixth/seventh sessions' changes (see HANDOFF.md
  "Validation"). This session also spent real time on a **PRD-conformance
  read-through** of the already-built Phase 0 screens against
  `docs/YuGo_Master_PRD.pdf` §10.4.1–10.4.3's actual text (not just
  re-reading prior sessions' diffs) — that's what surfaced the missing
  "current location text" the PRD's Home-screen line asks for alongside the
  Status Toggle, which prior sessions' own notes (see §7 below) had already
  anticipated needing a static placeholder for. **Three sessions running
  now with zero real `tsc` coverage** (sixth, seventh, and this session's
  diffs, all stacked).
  **Update (2026-08-16, ninth session):** same wall a fourth session
  running (`npm install --force` → same `403 Forbidden` on
  `registry.npmjs.org`). This session went one step further than just
  re-confirming that: it directly invoked the sandbox's pre-existing
  global `tsc` (`/home/claude/.npm-global/bin/tsc`, TypeScript 6.0.3,
  installed for unrelated tooling — sits alongside `pdf-lib`/`sharp`/
  `mermaid`/etc. in that global `node_modules`) against
  `apps/delivery-app/tsconfig.json`, bypassing `npm`/`npx` entirely so the
  `devEngines` gate couldn't block it before it even tried. It ran, and
  confirms in concrete, reproducible form what the sixth/seventh/eighth
  sessions' notes already suspected about "a generic `tsc` on `PATH` that
  is not this project's configured TypeScript": ~30+ errors, all
  environment noise — `Cannot find module 'expo-router'`/`'react'`/
  `'react-native'` (expected, no `node_modules` exists in this checkout at
  all) and, less expected, `Cannot use JSX unless the '--jsx' flag is
  provided` on every `.tsx` file despite `tsconfig.json` explicitly
  setting `"jsx": "react-native"` — almost certainly because that
  `tsconfig.json`'s `extends: "expo/tsconfig.base.json"` also can't be
  resolved without `node_modules`, so the `jsx` setting (and probably
  other base-config settings) never actually reaches the compiler. **This
  session made no code changes** (see TASKS.md — this session's actual
  work was a PRD-conformance pass, not a fix), so there was no diff of
  this session's own left unverified; the compiler gap is entirely about
  the sixth/seventh/eighth sessions' accumulated, still-unverified work.
  **Four sessions running now with zero real `tsc` coverage**, and this
  session's experiment closes off what looked like the last plausible
  cheap workaround in *this style* of sandbox — a session with genuine
  outbound network access is what's actually needed next, not a cleverer
  local workaround.
  **Update (2026-08-16, tenth session):** same wall, not re-tested this
  session — the ninth session's direct-global-`tsc` experiment already
  established there's no useful local workaround, so this session didn't
  spend time re-confirming that and instead focused entirely on RR's
  explicit request to implement the incoming-request-overlay gap despite
  the compiler still being unavailable (see §7's entry on that work for
  the full list of what changed). That's a meaningfully different
  situation from the ninth session's "no code changes, so nothing new is
  unverified" — **this session's diff is real, non-trivial, and entirely
  unverified**: a new native-module dependency (`expo-audio`), a new
  gesture-handler component with worklet-driven state, and a
  `GestureHandlerRootView` change to the app root that everything else in
  the app now also depends on rendering correctly. **Five sessions running
  now with zero real `tsc`/`expo start` coverage**, and this is the
  largest single unverified diff of any of them. See `HANDOFF.md` (tenth
  session) for the specific, prioritized list of what a future session
  with real tooling should check first — it's not just "run `tsc`," there
  are device/runtime-only concerns here (gesture recognition on Android,
  actual silent-mode override behavior on a real iOS device, whether the
  synthesized `.wav` actually decodes and loops cleanly) that no compiler
  run alone would catch even once one is available.
  **Update (2026-08-16, eleventh session):** **the wall finally came down.**
  This sandbox had genuine npm registry access — `npm install` succeeded
  from repo root (925 packages, one more than every prior session's 924,
  matching `expo-audio` newly resolving) and `npx tsc --noEmit -p
  apps/delivery-app/tsconfig.json` ran for real for the first time since
  the fifth session. Result: **one genuine error**,
  `TS18047: 'activeDelivery' is possibly 'null'` in `delivery-otp.tsx`'s
  `handleSubmitFallback` (see §6 and §7 below for the fix) — everything
  else across the full ten-session accumulated diff, including the tenth
  session's entire swipe-to-accept/flashing-border/ringtone surface,
  compiled clean on the first real check. Also tried `npx expo start
  --no-dev --offline` again: it printed "Networking has been disabled" as
  usual but — like the second and sixth sessions before it — Metro still
  reached "Waiting on http://localhost:8081", and this time
  `.expo/types/router.d.ts` was **confirmed genuinely regenerated**
  (mtime check, not hand-edited) — resolving the long-standing hand-edit
  caveat two sections below. **However:** a live bundle fetch (the
  `curl .../entry.bundle` check, last successful in the second session)
  was attempted three separate times this session and none completed —
  the background `expo start` process and its log file didn't survive
  between tool calls each time, the same specific instability the
  second/third/fourth/fifth/sixth sessions also ran into at various
  points, this time *not* blocked by networking at all. **So: `tsc` is now
  fully clean, `router.d.ts` is genuinely real, `npm install` fully
  resolves — but an actual Metro-served bundle has still only ever been
  confirmed once, in the second session.** That remains the one specific
  "real tooling" check nobody has repeated since. Also confirmed via `expo
  lint`: it still fails, but with more specific information than any
  prior session had — `npm install`/registry access clearly works (proven
  above), so the failure is scoped to Expo's own API domain specifically
  (a native-module-version-check endpoint `expo lint` calls before
  linting even starts) being outside this sandbox's network allowlist,
  not a general networking problem. Worth trying `npx eslint .` directly
  (skipping `expo lint`'s wrapper and its doctor checks entirely) in a
  future session if getting real lint coverage matters enough to invest
  in — not attempted this session, priority went to the `tsc` breakthrough
  and the (ultimately unsuccessful) bundle-fetch attempts instead.
- TypeScript, strict mode inherited from `expo/tsconfig.base.json`
- NativeWind (Tailwind for RN) — configured (`tailwind.config.js`, `global.css`),
  but the existing codebase mixes it lightly with `StyleSheet.create` +
  the `Themed*` component pattern (see §4). New delivery-flow screens built this
  session follow the `StyleSheet` + `Themed*` pattern for consistency with what
  was already there, not NativeWind classNames. Either is technically fine;
  don't mix both in the same file.
- Navigation: `expo-router` Stack + the custom `NativeTabs` component in
  `components/app-tabs.tsx` (uses `expo-router/unstable-native-tabs`, native
  platform tab bar, NOT the JS `Tabs` component — don't swap this out casually,
  it's an intentional choice already in the template).
- No state library beyond React Context (no Redux/Zustand installed). Keep it
  that way unless a real justified need appears — Context + `useReducer` is used
  for the onboarding flow (see §6) and has been sufficient.
- **Not installed, do not assume available:** `@react-native-async-storage/async-storage`,
  `expo-secure-store`, `expo-image-picker`, `expo-camera`, `react-native-maps`,
  `expo-location`, any `@expo-google-fonts/*` package. All of these will be
  needed eventually (see §7 Known gaps) but adding them is a deliberate,
  scoped decision for whoever picks up that specific task — don't add
  speculatively.

## 4. Existing conventions to preserve

- **`ThemedText` / `ThemedView`** (`src/components/themed-text.tsx`,
  `themed-view.tsx`) — the established pattern for any text/view that needs to
  react to light/dark mode. `ThemedText` takes a `type` prop for the type scale
  and an optional `themeColor` prop for any key of `Colors.light`/`Colors.dark`.
  This session **extended** (did not replace) the `type` union: legacy values
  (`default`, `title`, `small`, `smallBold`, `subtitle`, `link`, `linkPrimary`,
  `code`) still work exactly as before; new values added
  (`display`, `h1`, `h2`, `h3`, `body`, `bodyBold`, `caption`) map to the brand
  type scale in `constants/theme.ts`.
- **`useTheme()`** (`src/hooks/use-theme.ts`) — returns the resolved color object
  for the current color scheme (`Colors.light` or `Colors.dark`). Use this, not
  `useColorScheme()` directly, when you need actual color values.
- **Path alias `@/*`** → `src/*` (see `tsconfig.json`). Always import via `@/...`,
  never relative `../../` chains, matching what was already there.
- File naming: kebab-case for all files (`text-field.tsx`, not `TextField.tsx`),
  matching the existing `themed-text.tsx`, `use-color-scheme.ts`, etc.

## 5. Design system (brand tokens — Master PRD §6)

Implemented in `src/constants/theme.ts`. The delivery app is **dark-first**
(riders use it outdoors, in daylight, often one-handed) but both themes are
implemented since the template already wires up automatic light/dark switching
via `useColorScheme()` — don't force dark-only without an explicit product
decision to do so.

| Token | Dark | Light | Usage |
|---|---|---|---|
| `background` | `#090C14` | `#F6F8FB` | screen background |
| `backgroundElement` | `#111827` | `#FFFFFF` | cards, inputs |
| `surface` / `elevated` | `#141A24` / `#1B2433` | `#FFFFFF` | raised surfaces |
| `border` | `#283447` | `#DCE5EE` | dividers, input borders |
| `primary` (Electric Aqua) | `#30F2C2` | same | primary CTA, active states |
| `secondary` (Sky Cyan) | `#6BE8FF` | same | secondary accents |
| `premium` (Electric Violet) | `#7A5AF8` | same | premium/merchant-tier accents |
| `success` / `warning` / `error` | `#2ED573` / `#FFB84D` / `#FF5D73` | same | status colors |
| `onPrimary` | `#04140F` | same | text/icon color drawn on top of `primary` |

Typography: brand spec calls for **Space Grotesk** (headings) and **Inter**
(body). Real font files are **now bundled** via `@expo-google-fonts/space-grotesk`
and `@expo-google-fonts/inter`. `Fonts` and `Type` in `theme.ts` use the real
fonts directly, and `useFonts` is configured in the root `_layout.tsx` to hold
the splash screen until they load.

Spacing/radius/touch-target tokens (`Spacing`, `Radius`, `MinTouchTarget = 48`)
are also in `theme.ts` — use them instead of hardcoded numbers in new screens.

## 6. Onboarding / auth / delivery-loop architecture

Two route groups under `src/app/`, gated in the root layout:

```
src/app/
  _layout.tsx          ← wraps app in PartnerAuthProvider, conditionally
                          mounts (onboarding) or (tabs) Stack.Screen based on
                          isOnboarded. This is the documented Expo Router
                          pattern for auth-gated navigation:
                          https://docs.expo.dev/router/advanced/authentication/
  (onboarding)/
    _layout.tsx         ← Stack, headerShown:false. IMPORTANT: only registers
                          Stack.Screen entries for files that actually exist
                          (currently all six below) — see TASKS.md, this
                          needs a new entry added every time a new onboarding
                          screen is created, or typed-routes tsc will fail.
    index.tsx           ← Welcome screen
    phone.tsx           ← Phone number entry, calls requestOtp()
    otp.tsx             ← OTP verification, calls verifyOtp()
    partner-type.tsx    ← General vs Merchant, calls setPartnerType()
    vehicle-mode.tsx    ← Two-Wheeler / EV / Bicycle, calls setVehicleType()
    documents.tsx       ← KYC document upload + Merchant full-name capture,
                          calls uploadDocument() / setFullName() /
                          submitForReview()
    verification-pending.tsx  ← polls pollVerification(), approved/rejected/
                          polling local states
    [Phase 0 onboarding stack is now complete — see TASKS.md item 4 for the
     next screen, which is inside (tabs), not (onboarding)]
  (tabs)/
    _layout.tsx         ← REWRITTEN this session (2026-08-15, fourth
                          session): was a one-line `<AppTabs />`
                          pass-through, now also owns the incoming-request
                          subscription lifecycle (subscribes to
                          `subscribeToIncomingRequests()` while
                          `isOnline`, unsubscribes when offline/unmount),
                          holds the currently-shown `IncomingOrderRequest`
                          in state, renders `<IncomingRequestModal>` on top
                          of `<AppTabs />` when one is active, and shows a
                          small transient outcome banner after
                          accept/reject/expire. No new route added, so
                          `.expo/types/router.d.ts` untouched again.
    index.tsx           ← Home tab — greeting header, StatusToggle
                          (online/offline), today's-metrics card (mock
                          data), live-demand map placeholder panel.
                          Reads `isOnline` from `usePartnerAuth()` (promoted
                          into context in the fourth session).
    explore.tsx          ← original default template content, untouched
  (delivery)/            ← NEW this session (fifth session, 2026-08-15).
                          A third top-level route group, sibling to
                          (onboarding)/(tabs), gated by `activeDelivery` in
                          `DeliveryProvider` (see state section below) —
                          same state-driven pattern as the `isOnboarded`
                          auth gate, no `router.push` involved.
    _layout.tsx         ← Stack, headerShown:false, registers `index`,
                          `in-transit`, and (seventh session) `delivery-otp`
                          — same "only register files that exist" rule as
                          (onboarding)/_layout.tsx. Phase 0's (delivery)
                          route group is now complete — three screens
                          covering the whole accepted-request → delivered
                          loop.
    index.tsx           ← Pickup screen (PRD §10.4.3, TASKS.md item 6).
                          One screen, two local phases read from
                          `DeliveryProvider` (`deliveryPhase`,
                          `'reaching_pickup'`/`'at_pickup'`) rather than two
                          routes — same reasoning `verification-pending.tsx`
                          used for its own local polling/approved/rejected
                          states. Confirming pickup (sixth session) now does
                          a real `router.push('/in-transit')` after
                          `confirmPickup()` advances `deliveryPhase`, instead
                          of clearing `activeDelivery`.
    in-transit.tsx      ← NEW this session (sixth session, 2026-08-15).
                          "Reaching Drop" screen (PRD §10.4.3, TASKS.md
                          item 7) — drop-off area, nav placeholder (same
                          convention as the pickup screen's), "Reached
                          Location" button. A sibling *route*, not a third
                          local phase inside `index.tsx` — reached via
                          `router.push`, unlike the pickup→tabs and
                          tabs→delivery transitions, which are state-gated.
                          See HANDOFF.md "Important decisions" for why.
    delivery-otp.tsx     ← NEW this session (seventh session, 2026-08-15).
                          "Delivery" screen (PRD §10.4.3, TASKS.md item 8) —
                          OTP entry, PRD §10.9 lockout (3 wrong attempts →
                          60s lock → last-4-of-customer-phone fallback), and
                          a terminal "Delivered ✓" state that clears
                          `activeDelivery` after a short delay. Reached via
                          `router.push`, same as in-transit.tsx. Phase 0's
                          core delivery loop (screens 1–10) is now
                          code-complete. **Eleventh session (2026-08-16)
                          bugfix:** the first real `tsc` run this project
                          has had since the fifth session caught a genuine
                          `TS18047: 'activeDelivery' is possibly 'null'` in
                          `handleSubmitFallback` — the file's own
                          `if (!activeDelivery) return null` guard narrows
                          the type in the direct render body but not inside
                          that separately-declared closure. Fixed with a
                          local `const delivery = activeDelivery` captured
                          right after the guard, used inside the closure
                          instead of `activeDelivery` directly. `tsc` is
                          now clean across the whole file (and the whole
                          project). See TASKS.md "Priority order" for
                          what's next — a live bundle fetch and an
                          on-device test, not another `tsc` check, which
                          is now done.
```

State: `src/state/partner-auth-context.tsx` — `PartnerAuthProvider` +
`usePartnerAuth()` hook, `useReducer`-based. Holds phone, partner type, vehicle
type, document upload status, verification status, the `isOnboarded` flag
that the root layout reads to decide which route group to mount, and (as of
the fourth session) `isOnline` — whether the partner is currently accepting
delivery requests, read by `(tabs)/_layout.tsx`'s incoming-request
subscription and written by `(tabs)/index.tsx`'s `StatusToggle`. **Persists
across app restarts** via `@react-native-async-storage/async-storage` (except for
`isOnline`, which deliberately resets per session).

`src/state/delivery-context.tsx` (**new, fifth session**) —
`DeliveryProvider` + `useDelivery()` hook, plain `useState`-based (no
reducer — the state shape is small enough not to need one, unlike the
onboarding flow's many interrelated fields). Deliberately a **sibling**
context to `PartnerAuthProvider`, not a field merged into it — see
`HANDOFF.md` "Important decisions." Holds `activeDelivery`
(`IncomingOrderRequest | null` — the accepted request currently being
delivered), `deliveryPhase` (as of the seventh session: `'reaching_pickup' |
'at_pickup' | 'in_transit' | 'arrived_at_customer'`, one linear field
covering the whole loop), photo-capture status, and a `pendingOutcome` field
— as of the seventh session nothing sets this anymore (both prior uses were
removed once the screen each was stopping short of got built), but it's left
in place as ready-to-use infrastructure for the next genuine "next screen
isn't built yet" gap rather than deleted. `completeDelivery()` (new,
seventh session) is the actual terminal action, called from
`delivery-otp.tsx` after its own "Delivered ✓" confirmation. `app/_layout.tsx`'s
`RootNavigator` reads `activeDelivery` to decide whether to mount
`(delivery)` instead of `(tabs)` — same state-driven-navigation pattern as
`isOnboarded`. Also in-memory only, resets on app restart.

API layer: `src/services/mock-partner-api.ts` — **entirely mocked**, simulates
`POST /partner/auth/otp`, `POST /partner/auth/verify`, document upload,
`GET /partner/verification-status`, `GET /partner/requests/incoming` (as
`subscribeToIncomingRequests()`, a timer-based subscription rather than a
one-shot call, since the real thing is likely a websocket/long-poll — see its
doc comment for the exact contract), and (as of the fifth session)
a pickup-confirmation call as `confirmPickup()` (no named endpoint in the PRD
yet; anticipated shape documented in the function's doc comment), and (as of
the seventh session) `confirmDelivery()` — all with `setTimeout` delays,
since none of these backend endpoints exist yet (`@yugo/api-client` only has
`getOrders`/`getShops`). Function signatures are written to match the
documented request/response shape from the PRD so swapping in real
`@yugo/api-client` calls later should be a mechanical change, not a
redesign. **Mock rules: any 6-digit OTP is accepted for auth; incoming
requests fire every 5–11s while subscribed, from a small hardcoded pool of
shop names/areas** (`MOCK_SHOPS`/`MOCK_DROPOFF_AREAS`/`MOCK_ITEM_SUMMARIES`
in the same file); **`confirmPickup()`/`confirmDelivery()` always succeed**
(~1.1s / ~0.9s delay respectively) — there is no real SMS, order-matching,
or photo-verification backend. **Delivery-OTP specifically (seventh
session): any 6-digit code succeeds except the literal `000000`**, reserved
so the PRD §10.9 lockout edge case is actually reachable/testable in a mock
with no real code to validate against — see `delivery-otp.tsx`'s doc comment.

Domain types: `src/types/partner.ts` — `PartnerType`, `VehicleType`,
`VerificationStatus`, `DocumentKey`, `REQUIRED_DOCUMENTS` map. `src/types/order.ts`
(fourth session) — `IncomingOrderRequest`, split into its own file since
it's a different domain concept (an order/request, not partner identity/KYC)
and the second file gives the delivery-loop screens (items 6–8) a natural home
to grow into without bloating `partner.ts`. As of the fifth session, this same
type is reused as the shape of `activeDelivery` in `DeliveryProvider` — no
new "accepted order" type was introduced, since nothing about the order
changes shape between being an incoming request and an active delivery yet
(that may need to change once in-transit/delivery add their own fields, e.g.
a delivery OTP — a decision for whoever picks up item 7 or 8, not made here).
Both files kept local to this app (see §2) until a real backend contract
exists, at which point the wire-format subset should move to
`@yugo/shared-types` so Admin Portal can consume the same shapes for the
verification review queue / live order monitoring.

Shared UI primitives, all in `src/components/ui/`:
`button.tsx`, `screen.tsx`, `text-field.tsx`, `otp-input.tsx`,
`selectable-card.tsx`, `progress-dots.tsx`, `document-row.tsx`,
`status-toggle.tsx` (Online/Offline switch; no track/thumb animation library,
plain state-driven position swap consistent with how
`selectable-card.tsx`/`document-row.tsx` only animate via `opacity` on press).
All are now in real use across the onboarding stack and the Home dashboard.
**`ProgressDots` convention:**
`total=5, current=<n>` (0-indexed) represents the 5 "choice/input" steps —
phone, otp, partner-type (2), vehicle-mode (3), documents (4) — the welcome
screen and verification-pending don't show dots since they aren't
user-input steps. `phone.tsx` and `otp.tsx` have been updated to show
dots for visual consistency.

Domain-specific (not generic-enough for `ui/`) components live directly in
`src/components/`: `incoming-request-modal.tsx` (fourth session) — the
full-screen accept/reject modal for PRD screen 7, rendered conditionally from
`(tabs)/_layout.tsx`, not a route (see the file tree above and "Important
decisions" in `HANDOFF.md` for why a plain overlay was chosen over a
navigator-based modal route). The pickup screen (fifth session) took the
opposite approach — a real route, `(delivery)/index.tsx` — since unlike the
incoming-request modal it needs to persist across a state transition
(reaching → arrived) and shouldn't be dismissible by tapping outside it or
navigating a tab away; see `HANDOFF.md` "Important decisions" for both
sessions' reasoning side by side.

## 7. Known gaps / deliberately deferred (not bugs — scoped-out decisions)

- **No real font files.** RESOLVED, twelfth session. Added `@expo-google-fonts/*` packages.
- **No secure persistence.** Onboarding state is persisted via `AsyncStorage` (added twelfth session). Follow-up:
  add `expo-secure-store` for the auth token once real auth exists.
- **No real camera/document capture.** Documents screen (not yet built) will
  need `expo-image-picker` for camera-or-gallery capture. Deferred rather than
  added speculatively.
- **No real maps.** Home screen (not yet redesigned) references a "live demand
  heatmap" area in the PRD — building this for real needs `react-native-maps`
  + a Google Maps API key, which is a meaningful scoped task on its own.
  Build it as a styled placeholder panel until then, not a broken map view.
- **No real geolocation.** `expo-location` not installed. **Update (eighth
  session):** the Home screen's static-placeholder location text this note
  called for now exists (`MOCK_CURRENT_LOCATION` in `(tabs)/index.tsx`,
  TASKS.md item 4 addendum) — closes the specific PRD-conformance gap this
  line flagged, not the underlying "no real geolocation" deferral, which is
  unchanged and still needs `expo-location` + reverse geocoding as a real,
  separately-scoped task.
- **Incoming-request overlay's PRD §10.4.2 gap — found ninth session,
  implemented tenth session, still not verified against a real
  compiler/device.** The PRD's exact text is *"Flashing borders, loud
  distinct ringtone (overrides silent mode if permission granted)"* and
  *"Actions: swipe to accept, button to reject."* The ninth session found
  none of the three existed and deliberately deferred implementing them —
  see the git history of this section for that session's original
  reasoning (new-dependency risk for the ringtone, compiler-less-session
  risk for the gesture/animation code). **The tenth session (2026-08-16)
  implemented all three, at RR's direct request** ("implement carefully…
  do not stop just because validation is unavailable"):
  - `components/ui/swipe-to-accept.tsx` (new) — swipe-to-accept via
    `Gesture.Pan()` + `react-native-reanimated` shared values, both
    pre-existing dependencies. Includes an `accessibilityActions`/
    `onAccessibilityAction` fallback so double-tap still works for
    screen-reader users.
  - `components/incoming-request-modal.tsx` — flashing border via
    `withRepeat`/`interpolateColor`; looping ringtone via `expo-audio`'s
    `createAudioPlayer` (deliberately not the `useAudioPlayer` hook — see
    the file's doc comment on the SDK 57 looping-after-unmount regression,
    found via search this session, that this sidesteps) plus
    `setAudioModeAsync({ playsInSilentMode: true })`.
  - `assets/audio/incoming-request-ringtone.wav` (new) — an original,
    programmatically synthesized two-note chime, not a sourced/downloaded
    file, avoiding any licensing question (same approach this section
    anticipated for this exact gap before the work was ever done).
  - `app/_layout.tsx` — added `GestureHandlerRootView` around the whole
    app, required by `react-native-gesture-handler` (confirmed via
    documentation search, not assumed).
  - `package.json` — added `expo-audio` (`~57.0.3`).
  **What was unverified through the tenth session — partially resolved,
  eleventh session (2026-08-16):** `tsc` finally ran for real against this
  entire surface (see §3's running log) and came back clean, after fixing
  one genuine unrelated bug it caught in `delivery-otp.tsx` (see §6). `npm
  install` also confirmed `expo-audio@57.0.3` resolves exactly as
  specified. **Still NOT verified, even after this session:** an actual
  live Metro bundle fetch (attempted three times, didn't complete due to
  background-process instability — see §3), and everything device/runtime-
  only that no compiler run could ever catch regardless — gesture
  recognition on a real Android device specifically, actual silent-mode
  override behavior on a real iOS device, and whether the synthesized
  `.wav` actually decodes and loops cleanly at runtime (confirmed only as
  a structurally valid RIFF/WAVE/PCM file via `file`, not confirmed to
  sound right or loop seamlessly). `tsc`-clean is real, meaningful
  progress — it's a different and stronger claim than "reviewed carefully
  by hand" — but it is not the same as an on-device confirmation, and this
  is still explicitly flagged as such rather than presented as fully
  verified. See `HANDOFF.md` (eleventh session) for the complete account.
- **`.expo/types/router.d.ts` — RESOLVED, eleventh session (2026-08-16).**
  Was hand-edited from the second session through the tenth (see §3's
  running log for the full history of that). This session's `expo start`
  attempt reached "Waiting on http://localhost:8081" and genuinely
  regenerated the file — confirmed via a fresh mtime and no hand-edit
  command having touched it. `tsc --noEmit` re-confirmed clean immediately
  after. **No longer a caveat** — the checked-in file is real Metro output,
  not a manual reconstruction, for the first time since early in the
  second session.

## 8. How to validate changes

See `HANDOFF.md` "Validation commands and actual results" for the exact
commands and the `npm install -g npm@11.12.1` workaround (§2) for the
`devEngines` mismatch in this sandbox. Short version, once that's run: plain
`npx tsc --noEmit -p apps/delivery-app/tsconfig.json` from the repo root
works reliably and `npx expo lint` runs but currently fails for an unrelated
reason — it phones home to an Expo API endpoint to check native module
versions before linting, and that request is rejected by this sandbox's
network allowlist. That part is environment-blocked, not a code issue; run
`npm run lint` on a real machine with normal network access before merging.
