import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Profile } from '../types';
import { COLORS } from '@/shared/constants';

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View className="bg-surface rounded-2xl p-6 border border-border">
      {/* 아바타 + 닉네임 */}
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-full bg-primary-light items-center justify-center mr-4">
          <Ionicons name="person" size={28} color={COLORS.PRIMARY} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-text-primary">
            {profile.nickname ?? '닉네임 미설정'}
          </Text>
          {profile.region && (
            <Text className="text-sm text-text-secondary mt-1">
              {profile.region}
            </Text>
          )}
        </View>
      </View>

      {/* 정보 */}
      {profile.bio && (
        <Text className="text-sm text-text-secondary mb-3">{profile.bio}</Text>
      )}

      <View className="flex-row items-center">
        <Ionicons name="calendar-outline" size={14} color={COLORS.TEXT_HINT} />
        <Text className="text-xs text-text-hint ml-1">
          {joinDate} 가입
        </Text>
      </View>
    </View>
  );
}
