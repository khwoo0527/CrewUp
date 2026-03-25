import { View, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '@/shared/constants';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      {message && <Text className="text-sm text-gray-500 mt-3">{message}</Text>}
    </View>
  );
}
