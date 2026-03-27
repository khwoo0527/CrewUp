import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { createClub } from '@/services/supabase/database';
import { uploadClubImage } from '@/services/supabase/storage';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/features/auth';
import type { CreateClubInput } from '../types';

export function useCreateClub() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ input, imageUri }: { input: CreateClubInput; imageUri?: string }) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      const club = await createClub(input, user.id);

      if (imageUri) {
        const imageUrl = await uploadClubImage(club.id, imageUri);
        await supabase
          .from('clubs')
          .update({ cover_image_url: imageUrl })
          .eq('id', club.id);
        return { ...club, cover_image_url: imageUrl };
      }

      return club;
    },
    onSuccess: (club) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      queryClient.invalidateQueries({ queryKey: ['my-clubs'] });
      Alert.alert('완료', '동호회가 생성되었습니다!');
      router.replace(`/club/${club.id}`);
    },
    onError: (error: Error) => {
      console.error('[CreateClub] 생성 실패:', error);
      Alert.alert('생성 실패', error.message);
    },
  });
}
