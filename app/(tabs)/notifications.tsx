import { SafeAreaView } from 'react-native';
import { EmptyState } from '@/shared/components';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <EmptyState
        icon="🔔"
        title="새로운 알림이 없습니다"
        description="동호회 활동이 시작되면 알림이 도착합니다"
      />
    </SafeAreaView>
  );
}
