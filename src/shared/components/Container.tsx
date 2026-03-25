import { View } from 'react-native';
import type { PropsWithChildren } from 'react';

interface ContainerProps extends PropsWithChildren {
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <View className={`flex-1 px-4 md:px-8 lg:max-w-content lg:mx-auto lg:px-12 ${className}`}>
      {children}
    </View>
  );
}
