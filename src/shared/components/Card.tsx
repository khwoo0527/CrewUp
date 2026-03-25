import { View, Pressable, type ViewProps } from 'react-native';
import type { PropsWithChildren } from 'react';

interface CardProps extends PropsWithChildren {
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const baseStyle = `bg-white rounded-xl border border-gray-200 p-6 ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseStyle} active:opacity-95`}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View className={baseStyle}>{children}</View>;
}
