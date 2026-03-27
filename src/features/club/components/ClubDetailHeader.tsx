import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Badge, Button } from '@/shared/components';
import { COLORS } from '@/shared/constants';
import type { ClubWithDetails } from '../types';

interface ClubDetailHeaderProps {
  club: ClubWithDetails;
  isMember?: boolean;
  memberRole?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  owner: '동호회장',
  admin: '운영진',
  member: '회원',
};

export function ClubDetailHeader({ club, isMember, memberRole }: ClubDetailHeaderProps) {
  return (
    <View style={{ gap: 16 }}>
      {/* 대표 이미지 */}
      {club.cover_image_url ? (
        <Image
          source={{ uri: club.cover_image_url }}
          style={{ width: '100%', height: 200, borderRadius: 12 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 160,
            backgroundColor: COLORS.PRIMARY_LIGHT,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 48 }}>🎾</Text>
        </View>
      )}

      {/* 이름 + 뱃지 */}
      <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>
          {club.name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {club.is_recruiting && <Badge text="모집중" variant="success" />}
        </View>
      </View>

      {/* 소개 */}
      {club.description && (
        <Text style={{ fontSize: 15, color: COLORS.TEXT_SECONDARY, lineHeight: 22 }}>
          {club.description}
        </Text>
      )}

      {/* 정보 */}
      <View
        style={{
          backgroundColor: COLORS.SURFACE,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.BORDER,
          padding: 16,
          gap: 12,
        }}
      >
        <InfoRow label="종목" value={club.sport_category?.name ?? '-'} />
        <InfoRow
          label="활동 지역"
          value={
            club.region
              ? `${club.region}${club.city ? ` ${club.city}` : ''}`
              : '미정'
          }
        />
        <InfoRow label="멤버" value={`${club.member_count} / ${club.max_members}명`} />
        <InfoRow label="공개 여부" value={club.is_public ? '공개' : '비공개'} />
      </View>

      {/* 가입 상태에 따른 버튼 */}
      {isMember ? (
        <View
          style={{
            backgroundColor: COLORS.PRIMARY_LIGHT,
            borderRadius: 20,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: COLORS.PRIMARY }}>
            {ROLE_LABELS[memberRole ?? 'member'] ?? '회원'}으로 가입되어 있습니다
          </Text>
        </View>
      ) : (
        <Button
          title={club.is_recruiting ? '가입 신청' : '모집 마감'}
          onPress={() => {}}
          fullWidth
          size="lg"
          disabled={!club.is_recruiting}
        />
      )}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 14, color: COLORS.TEXT_SECONDARY }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '500', color: COLORS.TEXT_PRIMARY }}>{value}</Text>
    </View>
  );
}
