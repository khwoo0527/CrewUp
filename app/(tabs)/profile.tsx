import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/features/auth';
import type { ProfileUpdateData } from '@/features/auth';
import { ProfileCard } from '@/features/auth/components/ProfileCard';
import { Button } from '@/shared/components';
import { APP_VERSION, NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH, COLORS } from '@/shared/constants';
import { supabase } from '@/services/supabase';

export default function ProfileScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ProfileUpdateData>({
    defaultValues: {
      nickname: profile?.nickname ?? '',
      region: profile?.region ?? '',
      bio: profile?.bio ?? '',
    },
  });

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const openEdit = () => {
    reset({
      nickname: profile?.nickname ?? '',
      region: profile?.region ?? '',
      bio: profile?.bio ?? '',
    });
    setNicknameError('');
    setIsEditVisible(true);
  };

  const onSubmitEdit = async (form: ProfileUpdateData) => {
    setIsSubmitting(true);
    setNicknameError('');

    try {
      // 닉네임이 변경된 경우만 중복 체크
      if (form.nickname !== profile?.nickname) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('nickname', form.nickname as string)
          .maybeSingle();

        if (data) {
          setNicknameError('이미 사용 중인 닉네임입니다.');
          return;
        }
      }

      await updateProfile({
        nickname: form.nickname,
        region: form.region || null,
        bio: form.bio || null,
      });
      setIsEditVisible(false);
      Alert.alert('완료', '프로필이 수정되었습니다.');
    } catch {
      Alert.alert('오류', '프로필 수정 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="p-4 md:max-w-lg md:mx-auto">
        <Text className="text-2xl font-bold text-text-primary mb-4">프로필</Text>

        <ProfileCard profile={profile} />

        <View className="mt-6 gap-3">
          <Button title="프로필 수정" onPress={openEdit} variant="secondary" fullWidth />
          <Button title="로그아웃" onPress={handleSignOut} variant="danger" fullWidth />
        </View>

        <Text className="text-xs text-text-hint text-center mt-8">
          앱 버전 {APP_VERSION}
        </Text>
      </ScrollView>

      {/* 프로필 수정 모달 */}
      <Modal visible={isEditVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-row items-center justify-between p-4 border-b border-border">
            <Pressable onPress={() => setIsEditVisible(false)}>
              <Text className="text-base text-text-secondary">취소</Text>
            </Pressable>
            <Text className="text-lg font-bold text-text-primary">프로필 수정</Text>
            <View className="w-10" />
          </View>

          <ScrollView
            contentContainerClassName="p-4 md:max-w-lg md:mx-auto"
            keyboardShouldPersistTaps="handled"
          >
            {/* 닉네임 */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text-primary mb-2">닉네임</Text>
              <Controller
                control={control}
                name="nickname"
                rules={{
                  required: '닉네임을 입력해주세요.',
                  minLength: { value: NICKNAME_MIN_LENGTH, message: `${NICKNAME_MIN_LENGTH}자 이상 입력해주세요.` },
                  maxLength: { value: NICKNAME_MAX_LENGTH, message: `${NICKNAME_MAX_LENGTH}자 이하로 입력해주세요.` },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-xl px-4 py-3 text-base text-text-primary bg-surface"
                    value={value ?? ''}
                    onChangeText={(text) => {
                      onChange(text);
                      setNicknameError('');
                    }}
                    onBlur={onBlur}
                    maxLength={NICKNAME_MAX_LENGTH}
                    placeholderTextColor={COLORS.TEXT_HINT}
                  />
                )}
              />
              {(errors.nickname || nicknameError) && (
                <Text className="text-error text-sm mt-1">
                  {errors.nickname?.message ?? nicknameError}
                </Text>
              )}
            </View>

            {/* 활동 지역 */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text-primary mb-2">활동 지역</Text>
              <Controller
                control={control}
                name="region"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-xl px-4 py-3 text-base text-text-primary bg-surface"
                    placeholder="예: 서울 강남구"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholderTextColor={COLORS.TEXT_HINT}
                  />
                )}
              />
            </View>

            {/* 소개 */}
            <View className="mb-8">
              <Text className="text-sm font-medium text-text-primary mb-2">소개</Text>
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border border-border rounded-xl px-4 py-3 text-base text-text-primary bg-surface min-h-[100px]"
                    placeholder="자기소개를 입력해주세요"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.TEXT_HINT}
                  />
                )}
              />
            </View>

            <Button
              title="저장"
              onPress={handleSubmit(onSubmitEdit)}
              isLoading={isSubmitting}
              fullWidth
              size="lg"
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
