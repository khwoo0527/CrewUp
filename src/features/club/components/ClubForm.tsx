import { useState } from 'react';
import { View, Text, TextInput, Switch, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Button, DropdownPicker } from '@/shared/components';
import {
  COLORS,
  REGIONS,
  REGION_CITIES,
  CLUB_NAME_MIN_LENGTH,
  CLUB_NAME_MAX_LENGTH,
  CLUB_DESCRIPTION_MAX_LENGTH,
} from '@/shared/constants';
import type { CreateClubInput } from '../types';

const clubSchema = z.object({
  name: z
    .string()
    .min(CLUB_NAME_MIN_LENGTH, `동호회 이름은 ${CLUB_NAME_MIN_LENGTH}자 이상이어야 합니다.`)
    .max(CLUB_NAME_MAX_LENGTH, `동호회 이름은 ${CLUB_NAME_MAX_LENGTH}자 이하여야 합니다.`),
  description: z
    .string()
    .max(CLUB_DESCRIPTION_MAX_LENGTH, `소개는 ${CLUB_DESCRIPTION_MAX_LENGTH}자 이하여야 합니다.`)
    .optional()
    .or(z.literal('')),
  region: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  max_members: z.number().min(10).max(100),
  is_public: z.boolean(),
  is_recruiting: z.boolean(),
});

type ClubFormData = z.infer<typeof clubSchema>;

interface ClubFormProps {
  sportCategoryId: string;
  onSubmit: (input: CreateClubInput, imageUri?: string) => void;
  isLoading: boolean;
}

export function ClubForm({ sportCategoryId, onSubmit, isLoading }: ClubFormProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: '',
      description: '',
      region: '',
      city: '',
      max_members: 30,
      is_public: true,
      is_recruiting: true,
    },
  });

  const selectedRegion = watch('region');
  const districts = selectedRegion ? REGIONS[selectedRegion] ?? [] : [];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleFormSubmit = (data: ClubFormData) => {
    onSubmit(
      {
        ...data,
        sport_category_id: sportCategoryId,
        club_type: 'regular',
        description: data.description || undefined,
        region: data.region || undefined,
        city: data.city || undefined,
      },
      imageUri ?? undefined,
    );
  };

  return (
    <View style={{ gap: 20 }}>
      {/* 대표 이미지 */}
      <View>
        <Text style={styles.label}>대표 이미지</Text>
        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              contentFit="cover"
            />
          ) : (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Ionicons name="camera-outline" size={32} color={COLORS.TEXT_HINT} />
              <Text style={{ fontSize: 13, color: COLORS.TEXT_HINT }}>
                탭하여 이미지 선택
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* 동호회 이름 */}
      <View>
        <Text style={styles.label}>
          동호회 이름 <Text style={{ color: COLORS.ERROR }}>*</Text>
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="2~30자"
              placeholderTextColor={COLORS.TEXT_HINT}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={CLUB_NAME_MAX_LENGTH}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      </View>

      {/* 소개 */}
      <View>
        <Text style={styles.label}>소개</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="동호회를 소개해주세요 (선택)"
              placeholderTextColor={COLORS.TEXT_HINT}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              maxLength={CLUB_DESCRIPTION_MAX_LENGTH}
              multiline
            />
          )}
        />
        {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}
      </View>

      {/* 활동 지역 */}
      <View>
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
      <View>
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

      {/* 최대 멤버 수 */}
      <View>
        <Text style={styles.label}>최대 멤버 수</Text>
        <Controller
          control={control}
          name="max_members"
          render={({ field: { value } }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable
                onPress={() => setValue('max_members', Math.max(10, value - 10))}
                style={styles.stepButton}
              >
                <Text style={styles.stepButtonText}>-</Text>
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.TEXT_PRIMARY, minWidth: 40, textAlign: 'center' }}>
                {value}
              </Text>
              <Pressable
                onPress={() => setValue('max_members', Math.min(100, value + 10))}
                style={styles.stepButton}
              >
                <Text style={styles.stepButtonText}>+</Text>
              </Pressable>
              <Text style={{ fontSize: 13, color: COLORS.TEXT_SECONDARY }}>명</Text>
            </View>
          )}
        />
      </View>

      {/* 공개 여부 */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>공개 동호회</Text>
        <Controller
          control={control}
          name="is_public"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: COLORS.PRIMARY, false: COLORS.BORDER }}
            />
          )}
        />
      </View>

      {/* 모집 여부 */}
      <View style={styles.switchRow}>
        <Text style={styles.label}>모집 중</Text>
        <Controller
          control={control}
          name="is_recruiting"
          render={({ field: { value, onChange } }) => (
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ true: COLORS.PRIMARY, false: COLORS.BORDER }}
            />
          )}
        />
      </View>

      {/* 제출 */}
      <View style={{ marginTop: 8 }}>
        <Button
          title="동호회 만들기"
          onPress={handleSubmit(handleFormSubmit)}
          isLoading={isLoading}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = {
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.SURFACE,
  },
  error: {
    color: COLORS.ERROR,
    fontSize: 13,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: COLORS.SURFACE,
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.TEXT_PRIMARY,
  },
  imagePicker: {
    width: '100%' as const,
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderStyle: 'dashed' as const,
    backgroundColor: COLORS.SURFACE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
};
