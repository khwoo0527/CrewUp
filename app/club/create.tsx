import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MAX_FORM_WIDTH, COLORS } from '@/shared/constants';
import { LoadingSpinner } from '@/shared/components';
import { useAuth } from '@/features/auth';
import { ClubForm } from '@/features/club/components/ClubForm';
import { useCreateClub } from '@/features/club/hooks/useCreateClub';
import { supabase } from '@/services/supabase';

export default function CreateClubScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createClub = useCreateClub();
  const [sportCategoryId, setSportCategoryId] = useState<string | null>(null);

  // MVP: 테니스 카테고리 ID를 가져옴
  useEffect(() => {
    supabase
      .from('sport_categories')
      .select('id')
      .eq('name', '테니스')
      .single()
      .then(({ data }) => {
        if (data) setSportCategoryId(data.id);
      });
  }, []);

  if (!user || !sportCategoryId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
        <LoadingSpinner />
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
        keyboardShouldPersistTaps="handled"
      >
        {/* 헤더 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY }}>
            동호회 만들기
          </Text>
        </View>

        {/* 폼 */}
        <ClubForm
          sportCategoryId={sportCategoryId}
          onSubmit={(input) => createClub.mutate(input)}
          isLoading={createClub.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
