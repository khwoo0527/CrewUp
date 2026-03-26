import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { MAX_CONTENT_WIDTH, COLORS } from '@/shared/constants';
import { LoadingSpinner, EmptyState } from '@/shared/components';
import { useMyClubs } from '@/features/club/hooks/useMyClubs';
import { ClubCard } from '@/features/club/components/ClubCard';
import type { ClubWithDetails } from '@/features/club/types';

export default function MyClubsScreen() {
  const router = useRouter();
  const { myClubs, isLoading } = useMyClubs();

  const renderItem = ({ item }: { item: ClubWithDetails }) => (
    <View style={{ padding: 6 }}>
      <ClubCard club={item} onPress={() => router.push(`/club/${item.id}`)} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <View
        style={{
          flex: 1,
          maxWidth: MAX_CONTENT_WIDTH,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* 헤더 */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY }}>
              내 동호회
            </Text>
            <Pressable
              onPress={() => router.push('/club/create')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: COLORS.PRIMARY,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="동호회 만들기"
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* 목록 */}
        {isLoading ? (
          <LoadingSpinner />
        ) : myClubs.length === 0 ? (
          <EmptyState
            icon="👥"
            title="가입된 동호회가 없습니다"
            description="홈에서 동호회를 찾아 가입해보세요"
            actionLabel="동호회 찾기"
            onAction={() => router.replace('/(tabs)/home')}
          />
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 10, paddingBottom: 16 }}>
            <FlashList
              data={myClubs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
