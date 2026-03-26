import { View, Text } from 'react-native';
import { Badge, Button } from '@/shared/components';
import { COLORS } from '@/shared/constants';
import { CLUB_TYPE_LABELS } from '../constants';
import type { ClubWithDetails } from '../types';

interface ClubDetailHeaderProps {
  club: ClubWithDetails;
}

export function ClubDetailHeader({ club }: ClubDetailHeaderProps) {
  return (
    <View style={{ gap: 16 }}>
      {/* 이름 + 뱃지 */}
      <View>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY, marginBottom: 8 }}>
          {club.name}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {club.is_recruiting && <Badge text="모집중" variant="success" />}
          <Badge text={CLUB_TYPE_LABELS[club.club_type] ?? club.club_type} variant="neutral" />
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
        <InfoRow label="모임 유형" value={CLUB_TYPE_LABELS[club.club_type] ?? club.club_type} />
        <InfoRow label="멤버" value={`${club.member_count} / ${club.max_members}명`} />
        <InfoRow label="공개 여부" value={club.is_public ? '공개' : '비공개'} />
      </View>

      {/* 가입 신청 버튼 — Sprint 3에서 활성화 */}
      <Button
        title="가입 신청"
        onPress={() => {}}
        fullWidth
        size="lg"
        disabled
      />
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
