import { Stack } from 'expo-router';

// NOTE: only screens that exist as files are registered here. Typed routes
// (app.json experiments.typedRoutes) will fail `tsc` if a Stack.Screen name
// has no matching route file. The full onboarding stack is now built —
// welcome through verification-pending. See HANDOFF.md.
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="partner-type" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="verification-pending" />
    </Stack>
  );
}
