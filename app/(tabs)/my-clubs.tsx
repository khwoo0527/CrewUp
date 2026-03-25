import { SafeAreaView } from 'react-native';
import { EmptyState } from '@/shared/components';

export default function MyClubsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <EmptyState
        icon="👥"
        title="가입된 동호회가 없습니다"
        description="홈에서 동호회를 찾아 가입해보세요"
        actionLabel="둘러보기"
        onAction={() => {}}
      />
    </SafeAreaView>
  );
}
