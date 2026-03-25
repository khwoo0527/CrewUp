import { SafeAreaView } from 'react-native';
import { EmptyState } from '@/shared/components';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <EmptyState
        icon="👤"
        title="로그인이 필요합니다"
        description="카카오 또는 네이버로 시작하세요"
        actionLabel="로그인"
        onAction={() => {}}
      />
    </SafeAreaView>
  );
}
