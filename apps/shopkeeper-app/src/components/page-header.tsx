import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from './ui/text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  style?: ViewStyle;
}

export function PageHeader({ title, subtitle, action, showBack, onBack, style }: PageHeaderProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {showBack && (
        <View style={styles.backRow}>
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <AppText variant="h2" style={{ color: theme.text, fontWeight: '800', lineHeight: 28 }}>
              ←
            </AppText>
          </Pressable>
        </View>
      )}

      <View style={styles.headerBodyRow}>
        <View style={styles.titleWrapper}>
          <AppText variant="h2" style={styles.titleText}>
            {title}
          </AppText>
          {Boolean(subtitle) && (
            <AppText variant="caption" style={{ color: theme.textSecondary, marginTop: Spacing.one, lineHeight: 18 }}>
              {subtitle}
            </AppText>
          )}
        </View>
        {Boolean(action) && <View style={styles.actionWrapper}>{action}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.one,
    gap: Spacing.one,
    width: '100%',
  },
  backRow: {
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  backBtn: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: Spacing.two,
  },
  headerBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
    width: '100%',
  },
  titleWrapper: {
    flex: 1,
  },
  titleText: {
    fontWeight: '800',
  },
  actionWrapper: {
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
});
