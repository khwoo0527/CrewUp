import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Card } from '@/shared/components';
import { Badge } from '@/shared/components';
import { APP_NAME } from '@/shared/constants';

const DUMMY_CLUBS = [
  { id: '1', name: 'TenniSweet', desc: '강남 저녁 모임, 20~40대 환영', members: 32, region: '강남/서초' },
  { id: '2', name: '한강 테니스 모임', desc: '주민 한강 테니스', members: 18, region: '여의도' },
  { id: '3', name: '주말 테니스 크루', desc: '주말 정기 게임, 실력 무관', members: 24, region: '서울 전역' },
  { id: '4', name: '잠실 나이트 테니스', desc: '퇴근 후 야간 테니스', members: 28, region: '잠실/송파' },
  { id: '5', name: '판교 테니스 랠리', desc: 'IT 직장인 주말 모임', members: 16, region: '판교/분당' },
  { id: '6', name: '테니스 초보 클럽', desc: '입문자 전용, 부담 없이', members: 40, region: '서울' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="px-4 pt-6 pb-2 md:px-8 lg:max-w-content lg:mx-auto">
          <Text className="text-2xl font-bold text-gray-900 text-center">
            🎾 {APP_NAME}
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-1 mb-6">
            관심 있는 테니스 동호회를 찾아보세요
          </Text>

          <View className="flex-col md:flex-row md:flex-wrap">
            {DUMMY_CLUBS.map((club) => (
              <View key={club.id} className="w-full md:w-1/2 lg:w-1/3 p-2">
                <Card>
                  <Text className="text-base font-bold text-gray-900 mb-1">
                    🎾 {club.name}
                  </Text>
                  <Text className="text-sm text-gray-500 mb-3">{club.desc}</Text>
                  <View className="flex-row items-center gap-3 mb-3">
                    <Text className="text-xs text-gray-400">👥 {club.members}명</Text>
                    <Text className="text-xs text-gray-400">📍 {club.region}</Text>
                  </View>
                  <Badge text="모집중" variant="success" />
                </Card>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
