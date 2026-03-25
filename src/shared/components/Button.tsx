import { Pressable, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '@/shared/constants';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string; spinner: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-dark',
    text: 'text-white',
    spinner: COLORS.WHITE,
  },
  secondary: {
    container: 'bg-white border border-gray-200 active:bg-gray-50',
    text: 'text-gray-700',
    spinner: COLORS.GRAY_700,
  },
  danger: {
    container: 'bg-white border border-error active:bg-red-50',
    text: 'text-error',
    spinner: COLORS.ERROR,
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-primary',
    spinner: COLORS.PRIMARY,
  },
};

const SIZE_STYLES: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'py-2 px-4', text: 'text-sm' },
  md: { container: 'py-3 px-6', text: 'text-base' },
  lg: { container: 'py-4 px-8', text: 'text-lg' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      className={`
        rounded-full items-center justify-center flex-row
        ${variantStyle.container}
        ${sizeStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variantStyle.spinner} />
      ) : (
        <Text className={`font-semibold ${variantStyle.text} ${sizeStyle.text}`}>{title}</Text>
      )}
    </Pressable>
  );
}
