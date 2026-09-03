import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StatusToggleProps = {
  online: boolean;
  onToggle: () => void;
};

/**
 * Full-width Online/Offline switch for the Home dashboard (PRD §10.4.1).
 * No backend "go online" endpoint exists yet — the caller owns `online` as
 * local UI state (see `(tabs)/index.tsx`). Swapping in a real
 * POST /partner/status call later only touches the caller's `onToggle`.
 */
export function StatusToggle({ online, onToggle }: StatusToggleProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: online }}
      accessibilityLabel={online ? "You're online" : "You're offline"}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: online ? theme.success : theme.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={styles.textCol}>
        <View style={styles.statusLine}>
          <View
            style={[styles.dot, { backgroundColor: online ? theme.success : theme.textSecondary }]}
          />
          <ThemedText type="h3">{online ? "You're online" : "You're offline"}</ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {online ? 'Accepting delivery requests nearby' : 'Go online to start receiving requests'}
        </ThemedText>
      </View>

      <View style={[styles.track, { backgroundColor: online ? theme.success : theme.border }]}>
        <View
          style={[
            styles.thumb,
            { backgroundColor: theme.backgroundElement },
            online ? styles.thumbOn : styles.thumbOff,
          ]}
        />
      </View>
    </Pressable>
  );
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 26;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.three,
    minHeight: MinTouchTarget,
  },
  textCol: { flex: 1, gap: Spacing.half },
  statusLine: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 8, height: 8, borderRadius: Radius.pill },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.pill,
  },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },
});
