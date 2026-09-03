import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { StatusToggle } from '@/components/ui/status-toggle';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePartnerAuth } from '@/state/partner-auth-context';
import type { PartnerType } from '@/types/partner';

const PARTNER_TYPE_LABEL: Record<PartnerType, string> = {
  general: 'General Partner',
  merchant: 'Merchant Partner',
};

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * "Today" snapshot for the metrics card. No earnings/trips/time-online backend
 * exists yet (see PROJECT_CONTEXT.md §7) — these are static mock numbers
 * standing in for what a real `GET /partner/summary/today` would return,
 * per TASKS.md item 4 ("static mock data is fine until a real backend
 * exists"). Deliberately not wired to the online toggle below: going
 * online/offline in this mock doesn't accrue trips or earnings, since there
 * is no request-matching backend yet either (TASKS.md item 5).
 */
const MOCK_TODAY_STATS = {
  earnings: '₹482',
  trips: '9',
  timeOnline: '4h 05m',
};

/**
 * Header "current location text" (Master PRD §10.4.1: "Header: Status
 * Toggle (Online/Offline), current location text" — this was the one piece
 * of that line the Home screen didn't yet have, found in this session's
 * Phase 0 PRD-conformance pass; see HANDOFF.md/TASKS.md). `expo-location`
 * isn't installed (see PROJECT_CONTEXT.md §7, "No real geolocation"), which
 * already calls for exactly this: "Home screen location text should be a
 * static placeholder until that task is picked up." A plain constant here,
 * not wired to `isOnline` or anything else — swapping in a real reverse-
 * geocoded location once `expo-location` lands only touches this one line.
 */
const MOCK_CURRENT_LOCATION = 'Near MG Road, Sector 12';

export default function HomeScreen() {
  const theme = useTheme();
  const { fullName, partnerType, isOnline, setOnline, reset } = usePartnerAuth();

  const greeting = useMemo(() => getGreeting(new Date().getHours()), []);
  const firstName = fullName?.trim().split(/\s+/)[0] || 'Partner';

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ThemedText type="h2">
          {greeting}, {firstName}
        </ThemedText>
        {partnerType ? (
          <ThemedText type="small" themeColor="textSecondary">
            {PARTNER_TYPE_LABEL[partnerType]}
          </ThemedText>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary" style={styles.locationRow}>
          📍 {MOCK_CURRENT_LOCATION}
        </ThemedText>
      </View>

      <StatusToggle online={isOnline} onToggle={() => setOnline(!isOnline)} />

      <View
        style={[
          styles.metricsCard,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <ThemedText type="bodyBold">Today</ThemedText>
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <ThemedText type="h2" themeColor="primary">
              {MOCK_TODAY_STATS.earnings}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Earnings
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.metric}>
            <ThemedText type="h2">{MOCK_TODAY_STATS.trips}</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Trips
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.metric}>
            <ThemedText type="h2">{MOCK_TODAY_STATS.timeOnline}</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Online
            </ThemedText>
          </View>
        </View>
      </View>

      <View
        style={[styles.mapPlaceholder, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <ThemedText type="h1">🗺️</ThemedText>
        <ThemedText type="bodyBold">Live demand map</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.mapCaption}>
          Real-time demand heatmap and nearby shop pins are coming soon.
        </ThemedText>
      </View>

    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: Spacing.half, marginBottom: Spacing.four },
  locationRow: { marginTop: Spacing.half },
  metricsCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  metricsRow: { flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center', gap: Spacing.half },
  divider: { width: 1, height: 36 },
  mapPlaceholder: {
    marginTop: Spacing.four,
    marginBottom: BottomTabInset,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
  },
  mapCaption: { textAlign: 'center' },
});
