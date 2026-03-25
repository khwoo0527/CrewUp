import { Text, View } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-primary text-white',
  warning: 'bg-gray-500 text-white',
  error: 'bg-error text-white',
  info: 'bg-info text-white',
  neutral: 'bg-gray-200 text-gray-700',
};

export function Badge({ text, variant = 'neutral' }: BadgeProps) {
  return (
    <View className={`rounded-full px-3 py-1 self-start ${VARIANT_STYLES[variant]}`}>
      <Text className="text-xs font-semibold">{text}</Text>
    </View>
  );
}
