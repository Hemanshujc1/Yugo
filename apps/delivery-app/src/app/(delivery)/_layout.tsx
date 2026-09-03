import { Stack } from 'expo-router';

// NOTE: only screens that exist as files are registered here, same rule as
// (onboarding)/_layout.tsx — typed routes will fail `tsc` otherwise. Pickup
// (TASKS.md item 6), in-transit (item 7, sixth session, 2026-08-15), and
// delivery-otp (item 8, seventh session, 2026-08-15) are all registered now
// — that's the full Phase 0 core delivery loop (PRD §10.4.4 screens 8–10).
export default function DeliveryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="in-transit" />
      <Stack.Screen name="delivery-otp" />
    </Stack>
  );
}
