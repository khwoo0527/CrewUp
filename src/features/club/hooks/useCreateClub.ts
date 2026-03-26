import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { createClub } from '@/services/supabase/database';
import { useAuth } from '@/features/auth';
import type { CreateClubInput } from '../types';

export function useCreateClub() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateClubInput) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      return createClub(input, user.id);
    },
    onSuccess: (club) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['my-clubs'] });
      Alert.alert('완료', '동호회가 생성되었습니다!');
      router.replace(`/club/${club.id}`);
    },
    onError: (error: Error) => {
      Alert.alert('생성 실패', error.message);
    },
  });
}
