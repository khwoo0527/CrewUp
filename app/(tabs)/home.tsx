import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { Card, Badge } from '@/shared/components';
import { APP_NAME, MAX_CONTENT_WIDTH } from '@/shared/constants';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          maxWidth: MAX_CONTENT_WIDTH,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
          🎾 {APP_NAME}
        </Text>
        <Text style={{ fontSize: 14, color: '#777', textAlign: 'center', marginTop: 4, marginBottom: 24 }}>
          관심 있는 테니스 동호회를 찾아보세요
        </Text>

        <View style={{ gap: 12 }}>
          {DUMMY_CLUBS.map((club) => (
            <Card key={club.id}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }}>
                🎾 {club.name}
              </Text>
              <Text style={{ fontSize: 14, color: '#777', marginBottom: 12 }}>{club.desc}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: '#999' }}>👥 {club.members}명</Text>
                <Text style={{ fontSize: 12, color: '#999' }}>📍 {club.region}</Text>
              </View>
              <Badge text="모집중" variant="success" />
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
