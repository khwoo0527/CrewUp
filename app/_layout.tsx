import '../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/features/auth';
import { LoadingSpinner } from '@/shared/components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated, isOnboarded } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0];
    const inAuthGroup = firstSegment === '(auth)';
    const secondSegment = segments.at(1);

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && !isOnboarded && secondSegment !== 'onboarding') {
      router.replace('/(auth)/onboarding');
    } else if (isAuthenticated && isOnboarded && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [isLoading, isAuthenticated, isOnboarded, segments, router]);

  if (isLoading) {
    return <LoadingSpinner message="로딩 중..." />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGuard>
    </QueryClientProvider>
  );
}
