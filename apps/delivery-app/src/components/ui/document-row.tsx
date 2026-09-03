import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchTarget, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type DocumentRowProps = {
  label: string;
  hint?: string;
  status: 'pending' | 'uploading' | 'uploaded';
  onPress: () => void;
};

export function DocumentRow({ label, hint, status, onPress }: DocumentRowProps) {
  const theme = useTheme();
  const uploaded = status === 'uploaded';
  const uploading = status === 'uploading';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: uploading }}
      disabled={uploading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: uploaded ? theme.success : theme.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}>
      <View style={styles.textCol}>
        <ThemedText type="bodyBold">{label}</ThemedText>
        {hint ? (
          <ThemedText type="small" themeColor="textSecondary">
            {hint}
          </ThemedText>
        ) : null}
      </View>
      {uploading ? (
        <ActivityIndicator color={theme.primary} />
      ) : (
        <View
          style={[
            styles.badge,
            { backgroundColor: uploaded ? theme.success : theme.backgroundSelected },
          ]}>
          <ThemedText type="caption" style={{ color: uploaded ? theme.onPrimary : theme.textSecondary }}>
            {uploaded ? 'Uploaded' : 'Upload'}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.three,
    minHeight: MinTouchTarget,
  },
  textCol: { flex: 1, gap: Spacing.half, paddingRight: Spacing.two },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
});
