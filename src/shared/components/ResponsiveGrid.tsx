import React from 'react';
import { View } from 'react-native';
import type { PropsWithChildren } from 'react';

interface ResponsiveGridProps extends PropsWithChildren {
  className?: string;
}

export function ResponsiveGrid({ children, className = '' }: ResponsiveGridProps) {
  return (
    <View className={`flex-col md:flex-row md:flex-wrap ${className}`}>
      {React.Children.map(children, (child) => (
        <View className="w-full md:w-1/2 lg:w-1/3 p-2">{child}</View>
      ))}
    </View>
  );
}
