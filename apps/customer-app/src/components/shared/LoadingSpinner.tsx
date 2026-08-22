import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { YuGoColors } from '@/constants/theme';

type LoadingSpinnerProps = {
  message?: string;
  fullScreen?: boolean;
};

export function LoadingSpinner({ message, fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View className={`items-center justify-center ${fullScreen ? 'flex-1' : 'py-8'}`}>
      <ActivityIndicator size="large" color={YuGoColors.primary} />
      {message && (
        <ThemedText type="small" themeColor="textSecondary" className="mt-3">
          {message}
        </ThemedText>
      )}
    </View>
  );
}
