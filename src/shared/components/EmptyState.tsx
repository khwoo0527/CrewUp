import { View, Text, Pressable } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">{icon}</Text>
      <Text className="text-lg font-bold text-gray-900 mb-2 text-center">{title}</Text>
      <Text className="text-sm text-gray-500 text-center mb-6">{description}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          className="bg-primary px-6 py-3 rounded-full active:opacity-80"
        >
          <Text className="text-white font-semibold text-sm">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
