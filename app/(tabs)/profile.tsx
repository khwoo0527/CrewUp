import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/features/auth';
import type { ProfileUpdateData } from '@/features/auth';
import { ProfileCard } from '@/features/auth/components/ProfileCard';
import { Button, DropdownPicker } from '@/shared/components';
import { APP_VERSION, NICKNAME_MIN_LENGTH, NICKNAME_MAX_LENGTH, COLORS, REGIONS, REGION_CITIES, MAX_FORM_WIDTH } from '@/shared/constants';
import { supabase } from '@/services/supabase';

interface ProfileForm extends ProfileUpdateData {
  city?: string | null;
}

export default function ProfileScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      nickname: profile?.nickname ?? '',
      region: profile?.region ?? '',
      city: profile?.city ?? '',
      bio: profile?.bio ?? '',
    },
  });

  const selectedRegion = watch('region');
  const districts = selectedRegion ? REGIONS[selectedRegion] ?? [] : [];

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
      city: profile?.city ?? '',
      bio: profile?.bio ?? '',
    });
    setNicknameError('');
    setIsEditVisible(true);
  };

  const onSubmitEdit = async (form: ProfileForm) => {
    setIsSubmitting(true);
    setNicknameError('');

    try {
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
        city: form.city || null,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
      <ScrollView contentContainerStyle={{ padding: 16, maxWidth: MAX_FORM_WIDTH, width: '100%', alignSelf: 'center' }}>
        <Text className="text-2xl font-bold text-text-primary mb-4">프로필</Text>

        <ProfileCard profile={profile} />

        <View style={{ marginTop: 24, gap: 12 }}>
          <Button title="프로필 수정" onPress={openEdit} variant="secondary" fullWidth />
          <Button title="로그아웃" onPress={handleSignOut} variant="danger" fullWidth />
        </View>

        <Text className="text-xs text-text-hint text-center mt-8">
          앱 버전 {APP_VERSION}
        </Text>
      </ScrollView>

      <Modal visible={isEditVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER }}>
            <Pressable onPress={() => setIsEditVisible(false)}>
              <Text style={{ fontSize: 16, color: COLORS.TEXT_SECONDARY }}>취소</Text>
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY }}>프로필 수정</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 16, maxWidth: MAX_FORM_WIDTH, width: '100%', alignSelf: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>닉네임</Text>
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
                    label="활동 지역"
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

            <View style={{ marginBottom: 24 }}>
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

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>소개</Text>
              <Controller
                control={control}
                name="bio"
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
                      minHeight: 100,
                    }}
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
