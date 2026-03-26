import { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/features/auth';
import { Button, DropdownPicker } from '@/shared/components';
import { NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH, COLORS, REGIONS, REGION_CITIES, MAX_FORM_WIDTH } from '@/shared/constants';
import { supabase } from '@/services/supabase';

const onboardingSchema = z.object({
  nickname: z
    .string()
    .min(NICKNAME_MIN_LENGTH, `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`)
    .max(NICKNAME_MAX_LENGTH, `닉네임은 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다.`),
  region: z.string().optional(),
  city: z.string().optional(),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingScreen() {
  const { updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OnboardingForm>({
    defaultValues: { nickname: '', region: '', city: '' },
  });

  const selectedRegion = watch('region');
  const districts = selectedRegion ? REGIONS[selectedRegion] ?? [] : [];

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
        city: form.city || null,
      });
    } catch {
      Alert.alert('오류', '프로필 설정 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, maxWidth: MAX_FORM_WIDTH, width: '100%', alignSelf: 'center' }}>
        <Text className="text-2xl font-bold text-text-primary mb-2">
          프로필을 설정해주세요
        </Text>
        <Text className="text-base text-text-secondary mb-8">
          동호회에서 사용할 닉네임을 정해주세요.
        </Text>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>
            닉네임 <Text style={{ color: COLORS.ERROR }}>*</Text>
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
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.BORDER,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: COLORS.TEXT_PRIMARY,
                  backgroundColor: COLORS.SURFACE,
                }}
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
          {(errors.nickname || nicknameError) ? (
            <Text style={{ color: COLORS.ERROR, fontSize: 13, marginTop: 4 }}>
              {errors.nickname?.message ?? nicknameError}
            </Text>
          ) : null}
        </View>

        <View style={{ marginBottom: 16 }}>
          <Controller
            control={control}
            name="region"
            render={({ field: { value } }) => (
              <DropdownPicker
                label="활동 지역 (선택)"
                placeholder="시/도 선택"
                items={REGION_CITIES}
                value={value ?? ''}
                onSelect={(v) => {
                  setValue('region', v);
                  setValue('city', '');
                }}
              />
            )}
          />
        </View>

        <View style={{ marginBottom: 32 }}>
          <Controller
            control={control}
            name="city"
            render={({ field: { value } }) => (
              <DropdownPicker
                placeholder="구/군 선택"
                items={districts}
                value={value ?? ''}
                onSelect={(v) => setValue('city', v)}
                disabled={!selectedRegion}
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
      </View>
    </SafeAreaView>
  );
}
