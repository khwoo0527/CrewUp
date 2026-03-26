import { SafeAreaView, View } from 'react-native';
import { EmptyState } from '@/shared/components';
import { MAX_CONTENT_WIDTH } from '@/shared/constants';

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={{ flex: 1, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' }}>
        <EmptyState
          icon="🔔"
          title="새로운 알림이 없습니다"
          description="동호회 활동이 시작되면 알림이 도착합니다"
        />
      </View>
    </SafeAreaView>
  );
}
