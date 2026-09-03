import { useCallback, useState } from 'react';
import { StyleSheet, View, type AccessibilityActionEvent, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SwipeToAcceptProps = {
  /** Label shown inside the track, fades out as the thumb approaches the end. */
  label?: string;
  onAccept: () => void;
  disabled?: boolean;
};

const THUMB_SIZE = MinTouchTarget; // 48 — matches Button's own min touch target.
const TRACK_PADDING = 4;
/** Fraction of the available travel distance the thumb must cross before a release counts as an accept. */
const ACCEPT_THRESHOLD = 0.72;

/**
 * PRD §10.4.2's "swipe to accept" action for the incoming-request overlay
 * (Master PRD, screen 7) — see `PROJECT_CONTEXT.md` §7 for why this didn't
 * exist until the tenth session. Uses `react-native-gesture-handler`'s
 * `Gesture.Pan()` + `react-native-reanimated`'s shared values, both already
 * project dependencies (see `package.json`) — no new packages needed for
 * this half of the incoming-request-overlay gap, unlike the ringtone half
 * (see `incoming-request-modal.tsx`).
 *
 * Deliberately still exposes a full `accessibilityRole="button"` +
 * `accessibilityActions`/`onAccessibilityAction` path so screen-reader users
 * get an ordinary double-tap-to-activate affordance instead of being
 * required to perform a drag gesture — a plain "swipe-only" control with no
 * tap fallback would be a real accessibility regression versus the button
 * it replaces. This mirrors how the PRD's own text pairs "swipe to accept"
 * with a still-tappable "button to reject" alongside it, rather than
 * removing all tap affordances from the accept side.
 *
 * **Not verified against a real compiler or device** — this project has had
 * zero real `tsc`/`expo start` coverage for four sessions running (see
 * `HANDOFF.md`). Reviewed carefully by hand (worklet functions kept to
 * simple arithmetic/interpolation, no nested closures capturing stale
 * values, `runOnJS` used only for the final `onAccept` call as required by
 * the Reanimated/Gesture-Handler docs), but that's not a substitute for a
 * real build.
 */
export function SwipeToAccept({ label = 'Swipe to accept', onAccept, disabled = false }: SwipeToAcceptProps) {
  const theme = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const isAccepted = useSharedValue(false);

  const maxTranslate = Math.max(trackWidth - THUMB_SIZE - TRACK_PADDING * 2, 1);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  }, []);

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'activate' && !disabled) onAccept();
    },
    [disabled, onAccept]
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onChange((event) => {
      'worklet';
      if (isAccepted.value) return;
      const next = translateX.value + event.changeX;
      translateX.value = Math.min(Math.max(next, 0), maxTranslate);
    })
    .onEnd(() => {
      'worklet';
      if (isAccepted.value) return;
      if (translateX.value >= maxTranslate * ACCEPT_THRESHOLD) {
        isAccepted.value = true;
        translateX.value = withTiming(maxTranslate, { duration: 150 }, (finished) => {
          if (finished) runOnJS(onAccept)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, Math.max(maxTranslate * 0.6, 1)], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View
      onLayout={handleLayout}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="Swipe right, or double tap, to accept this delivery request"
      accessibilityState={{ disabled }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={handleAccessibilityAction}
      style={[
        styles.track,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: disabled ? 0.5 : 1 },
      ]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, fillStyle, { backgroundColor: theme.primary, opacity: 0.18 }]}
      />
      <Animated.View style={[styles.labelWrap, labelStyle]} pointerEvents="none">
        <ThemedText type="bodyBold" themeColor="text">
          {label}
        </ThemedText>
        <ThemedText type="body" themeColor="textSecondary">
          {'  →'}
        </ThemedText>
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.thumb, thumbStyle, { backgroundColor: theme.primary }]}>
          <ThemedText type="h3" style={{ color: theme.onPrimary }}>
            ✓
          </ThemedText>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE + TRACK_PADDING * 2,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Radius.pill,
  },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    marginHorizontal: TRACK_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
