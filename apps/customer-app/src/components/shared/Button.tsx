import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: '#30F2C2', text: '#090C14' },
  secondary: { bg: '#7A5AF8', text: '#FFFFFF' },
  outline: { bg: 'transparent', text: '#30F2C2', border: '#30F2C2' },
  ghost: { bg: 'transparent', text: '#30F2C2' },
};

const sizeStyles: Record<ButtonSize, { paddingH: number; paddingV: number; fontSize: 'small' | 'smallBold' | 'default' }> = {
  sm: { paddingH: 16, paddingV: 8, fontSize: 'small' },
  md: { paddingH: 24, paddingV: 12, fontSize: 'smallBold' },
  lg: { paddingH: 32, paddingV: 16, fontSize: 'smallBold' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...rest
}: ButtonProps) {
  const vStyle = variantStyles[variant];
  const sStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`rounded-2xl items-center justify-center flex-row ${fullWidth ? 'w-full' : ''}`}
      style={[{
        backgroundColor: vStyle.bg,
        paddingHorizontal: sStyle.paddingH,
        paddingVertical: sStyle.paddingV,
        borderWidth: vStyle.border ? 1.5 : 0,
        borderColor: vStyle.border,
        opacity: isDisabled ? 0.5 : 1,
      }]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={vStyle.text}
        />
      ) : (
        <ThemedText
          type={sStyle.fontSize}
          style={{ color: vStyle.text }}
        >
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}
