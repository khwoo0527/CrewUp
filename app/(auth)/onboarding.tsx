import { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components';
import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH, COLORS } from '@/shared/constants';
import { supabase } from '@/services/supabase';

const onboardingSchema = z.object({
  nickname: z
    .string()
    .min(NICKNAME_MIN_LENGTH, `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`)
    .max(NICKNAME_MAX_LENGTH, `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다.`),
  region: z.string().optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingScreen() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<OnboardingForm>({
    defaultValues: { nickname: '', region: '' },
  });

  const checkNicknameDuplicate = async (nickname: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .maybeSingle();
    return Boolean(data);
  };

  const onSubmit = async (form: OnboardingForm) => {
    setIsSubmitting(true);
    setNicknameError('');

    try {
      const isDuplicate = await checkNicknameDuplicate(form.nickname);
      if (isDuplicate) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        return;
      }

      await updateProfile({
        nickname: form.nickname,
        region: form.region || null,
      });
    } catch {
      Alert.alert('오류', '프로필 설정 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 justify-center px-6 md:max-w-md md:mx-auto"
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-text-primary mb-2">
            프로필을 설정해주세요
          </Text>
          <Text className="text-base text-text-secondary mb-8">
            동호회에서 사용할 닉네임을 정해주세요.
          </Text>

          {/* 닉네임 */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-text-primary mb-2">
              닉네임 <Text className="text-error">*</Text>
            </Text>
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
                  placeholder="2~12자"
                  placeholderTextColor={COLORS.TEXT_HINT}
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    setNicknameError('');
                  }}
                  onBlur={onBlur}
                  maxLength={NICKNAME_MAX_LENGTH}
                  autoFocus
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
          <View className="mb-8">
            <Text className="text-sm font-medium text-text-primary mb-2">
              활동 지역 (선택)
            </Text>
            <Controller
              control={control}
              name="region"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="border border-border rounded-xl px-4 py-3 text-base text-text-primary bg-surface"
                  placeholder="예: 서울 강남구"
                  placeholderTextColor={COLORS.TEXT_HINT}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>

          <Button
            title="시작하기"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
