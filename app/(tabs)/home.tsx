import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { APP_NAME, MAX_CONTENT_WIDTH, COLORS } from '@/shared/constants';
import { LoadingSpinner, EmptyState } from '@/shared/components';
import { useClubs } from '@/features/club/hooks/useClubs';
import { ClubCard } from '@/features/club/components/ClubCard';
import { ClubSearchBar } from '@/features/club/components/ClubSearchBar';
import type { ClubWithDetails } from '@/features/club/types';

export default function HomeScreen() {
  const router = useRouter();
  const { clubs, isLoading, searchQuery, setSearchQuery } = useClubs();

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
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY }}>
                {APP_NAME}
              </Text>
              <Text style={{ fontSize: 14, color: COLORS.TEXT_SECONDARY, marginTop: 2 }}>
                관심 있는 동호회를 찾아보세요
              </Text>
            </View>
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

          {/* 검색 */}
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <ClubSearchBar value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </View>

        {/* 목록 */}
        {isLoading ? (
          <LoadingSpinner />
        ) : clubs.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={searchQuery ? '검색 결과가 없습니다' : '등록된 동호회가 없습니다'}
            description={
              searchQuery
                ? '다른 키워드로 검색해보세요.'
                : '첫 번째 동호회를 만들어보세요!'
            }
            actionLabel={searchQuery ? undefined : '동호회 만들기'}
            onAction={searchQuery ? undefined : () => router.push('/club/create')}
          />
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 10, paddingBottom: 16 }}>
            <FlashList
              data={clubs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
