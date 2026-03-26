import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MAX_FORM_WIDTH, COLORS } from '@/shared/constants';
import { LoadingSpinner, EmptyState } from '@/shared/components';
import { useClubDetail } from '@/features/club/hooks/useClubDetail';
import { ClubDetailHeader } from '@/features/club/components/ClubDetailHeader';

export default function ClubDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { club, isLoading, error } = useClubDetail(id ?? '');

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !club) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
        <EmptyState
          icon="⚠️"
          title="동호회를 찾을 수 없습니다"
          description={error?.message ?? '존재하지 않거나 삭제된 동호회입니다.'}
          actionLabel="홈으로"
          onAction={() => router.replace('/(tabs)/home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          maxWidth: MAX_FORM_WIDTH,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </Pressable>
          <Text style={{ fontSize: 16, color: COLORS.TEXT_SECONDARY }}>
            동호회 소개
          </Text>
        </View>

        <ClubDetailHeader club={club} />
      </ScrollView>
    </SafeAreaView>
  );
}
