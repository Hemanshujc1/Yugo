import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

export interface ScreenProps extends ViewProps {
  scrollable?: boolean;
  safeArea?: boolean;
  safeAreaEdges?: SafeAreaViewProps['edges'];
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollViewProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
  className?: string;
  children?: React.ReactNode;
}

export function Screen({
  scrollable = false,
  safeArea = true,
  safeAreaEdges = ['top', 'left', 'right'],
  style,
  contentContainerStyle,
  scrollViewProps,
  className,
  children,
  ...rest
}: ScreenProps) {
  const theme = useTheme();

  const Container = safeArea ? SafeAreaView : View;
  const containerProps = safeArea ? { edges: safeAreaEdges } : {};

  return (
    <Container
      style={[styles.container, { backgroundColor: theme.background }, style]}
      className={className}
      {...containerProps}
      {...rest}>
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}>
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
