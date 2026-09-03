import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { SwipeToAccept } from '@/components/ui/swipe-to-accept';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { IncomingOrderRequest } from '@/types/order';

type IncomingRequestModalProps = {
  request: IncomingOrderRequest;
  onAccept: () => void;
  onReject: () => void;
  onExpire: () => void;
};

/** Original, synthesized two-note chime — not a recording of any real ringtone or copyrighted
 * work, generated for this project specifically so there's no licensing question. See
 * `PROJECT_CONTEXT.md` §7 for why a synthesized placeholder was used instead of a sourced audio
 * file. `@/assets/*` → `./assets/*`, same alias every other asset `require()` in this app uses
 * (see e.g. `components/web-badge.tsx`). */
const RINGTONE_SOURCE = require('@/assets/audio/incoming-request-ringtone.wav');

/**
 * Full-screen modal/sheet shown when a new delivery request arrives while the
 * partner is online (Master PRD §10.4, screen 7). Rendered as a plain
 * absolutely-positioned overlay from `(tabs)/_layout.tsx` — not an
 * `expo-router` route — so it can appear on top of whichever tab is
 * currently active without any navigation-stack changes. See
 * PROJECT_CONTEXT.md §6 for why.
 *
 * **Tenth session (2026-08-16):** gained the three PRD §10.4.2 features the
 * ninth session found missing and documented but didn't implement —
 * flashing borders, a looping ringtone that overrides the device's silent
 * switch, and swipe-to-accept (the `SwipeToAccept` primitive; Reject stays
 * a plain `Button`, matching the PRD's own "swipe to accept, button to
 * reject" wording exactly). See `HANDOFF.md` (tenth session) for the full
 * writeup, `PROJECT_CONTEXT.md` §7 for what's still not verified, and the
 * doc comments below for the two features' own specific caveats.
 */
export function IncomingRequestModal({ request, onAccept, onReject, onExpire }: IncomingRequestModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [secondsLeft, setSecondsLeft] = useState(request.expiresInSeconds);

  // Reset and restart the countdown whenever a new request comes in.
  useEffect(() => {
    setSecondsLeft(request.expiresInSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [request.id, request.expiresInSeconds]);

  useEffect(() => {
    if (secondsLeft === 0) {
      onExpire();
    }
  }, [secondsLeft, onExpire]);

  const progress = secondsLeft / request.expiresInSeconds;

  // --- Flashing border (PRD §10.4.2) ---------------------------------
  // A continuous border-color pulse between the card's normal border and
  // the brand error color, for the whole time a request is showing — the
  // PRD's text ("Flashing borders, loud distinct ringtone") doesn't
  // describe the flash getting more urgent near the end of the countdown
  // the way the existing seconds/progress-bar color swap already does at
  // <=10s, so this deliberately doesn't try to layer a second urgency
  // curve on top of a simple continuous flash — one clear, constant signal
  // rather than two overlapping ones.
  const flash = useSharedValue(0);

  useEffect(() => {
    flash.value = withRepeat(withTiming(1, { duration: 550, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => {
      cancelAnimation(flash);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flashBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(flash.value, [0, 1], [theme.border, theme.error]),
  }));

  // --- Ringtone (PRD §10.4.2) -----------------------------------------
  // Deliberately uses `createAudioPlayer` + an explicit own-lifecycle
  // `useEffect` cleanup, NOT the `useAudioPlayer` hook, and pauses before
  // releasing — see the SDK 57 regression at
  // https://github.com/expo/expo/issues/47569, where `useAudioPlayer`'s
  // automatic release-on-unmount does not reliably pause playback first,
  // so a looping sound can keep playing after the component that started
  // it has unmounted. That bug is specifically about a *looping* player
  // continuing after unmount, which is exactly this component's use case
  // (loop on, unmounts the instant Accept/Reject/expire fires — see
  // `(tabs)/_layout.tsx`'s `incomingRequest ? <IncomingRequestModal ... />
  // : null}` conditional), so the safer, more-verbose pattern is used
  // here rather than the simpler hook. **Not verified against a real
  // device or even a real bundler** — see the module-level caveat in
  // `swipe-to-accept.tsx` and `HANDOFF.md` (tenth session) for why, and
  // what would need checking first on a machine with real Expo tooling.
  const [player] = useState<AudioPlayer>(() => createAudioPlayer(RINGTONE_SOURCE));

  useEffect(() => {
    let stopped = false;

    (async () => {
      try {
        // `playsInSilentMode: true` is the specific setting PRD §10.4.2 asks
        // for ("overrides silent mode if permission granted") — on iOS this
        // is the one that actually does that; on Android there's no
        // equivalent silent-mode concept for media playback, so this option
        // is a no-op there rather than needing an Android-specific branch.
        // Deliberately not setting `shouldPlayInBackground` — this ringtone
        // should stop the instant the app backgrounds, not keep ringing, and
        // leaving that option unset avoids requesting any background-audio
        // capability this app doesn't otherwise need (see
        // PROJECT_CONTEXT.md §7 on the existing "don't add speculatively"
        // rule for permissions/capabilities).
        await setAudioModeAsync({ playsInSilentMode: true });
      } catch {
        // Best-effort — if the native audio-mode call fails for any reason,
        // still attempt to play (at worst it's silenced by a device's mute
        // switch, not the app crashing).
      }
      if (stopped) return;
      player.loop = true;
      player.volume = 1.0;
      player.play();
    })();

    return () => {
      stopped = true;
      // Explicit pause-before-release, not just relying on unmount
      // auto-cleanup — see the doc comment above for why.
      try {
        player.pause();
        player.release();
      } catch {
        // Best-effort cleanup — if the native player is already gone there's
        // nothing further to do.
      }
    };
  }, [player]);

  return (
    <View style={styles.backdrop} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.card,
          flashBorderStyle,
          {
            backgroundColor: theme.backgroundElement,
            marginBottom: insets.bottom + Spacing.four,
          },
        ]}>
        <View style={styles.countdownRow}>
          <ThemedText type="caption" themeColor="textSecondary">
            NEW DELIVERY REQUEST
          </ThemedText>
          <ThemedText type="h3" themeColor={secondsLeft <= 10 ? 'error' : 'text'}>
            {secondsLeft}s
          </ThemedText>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: secondsLeft <= 10 ? theme.error : theme.primary,
              },
            ]}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" themeColor="textSecondary">
            PICKUP
          </ThemedText>
          <ThemedText type="h3">{request.shopName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {request.shopAddress}
          </ThemedText>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.section}>
          <ThemedText type="caption" themeColor="textSecondary">
            DROP-OFF
          </ThemedText>
          <ThemedText type="h3">{request.dropoffArea}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {request.itemsSummary}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <ThemedText type="h2" themeColor="primary">
              ₹{request.estimatedPayout}
            </ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Est. payout
            </ThemedText>
          </View>
          <View style={[styles.divider, styles.verticalDivider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <ThemedText type="h2">{request.distanceKm} km</ThemedText>
            <ThemedText type="caption" themeColor="textSecondary">
              Distance
            </ThemedText>
          </View>
        </View>

        {/* Stacked, not side-by-side like the old two-button row: a swipe
            track needs real travel distance to feel usable, and squeezing it
            into a half-width `flex: 1` slot (the old Accept button's slot)
            would make the swipe distance too short to be practical on
            narrower phones. Reject stays a normal button, on top, since the
            PRD pairs "swipe to accept" with "button to reject" as two
            different affordances, not two halves of one row. */}
        <View style={styles.actions}>
          <View style={styles.rejectButton}>
            <Button label="Reject" variant="outline" onPress={onReject} />
          </View>
          <SwipeToAccept onAccept={onAccept} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4, 6, 12, 0.6)',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing.four,
    marginHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  countdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack: { height: 4, borderRadius: Radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: Radius.pill },
  section: { gap: Spacing.half },
  divider: { height: 1 },
  verticalDivider: { width: 1, height: 36 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.four },
  stat: { alignItems: 'center', gap: Spacing.half },
  actions: { gap: Spacing.two, marginTop: Spacing.one },
  rejectButton: { alignSelf: 'stretch' },
});
