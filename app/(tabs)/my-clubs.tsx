import { SafeAreaView, View } from 'react-native';
import { EmptyState } from '@/shared/components';
import { MAX_CONTENT_WIDTH } from '@/shared/constants';

export default function MyClubsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={{ flex: 1, maxWidth: MAX_CONTENT_WIDTH, width: '100%', alignSelf: 'center' }}>
        <EmptyState
          icon="👥"
          title="가입된 동호회가 없습니다"
          description="홈에서 동호회를 찾아 가입해보세요"
          actionLabel="둘러보기"
          onAction={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}
