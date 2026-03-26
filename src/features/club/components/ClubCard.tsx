import React from 'react';
import { View, Text } from 'react-native';
import { Card, Badge } from '@/shared/components';
import { COLORS } from '@/shared/constants';
import { CLUB_TYPE_LABELS } from '../constants';
import type { ClubWithDetails } from '../types';

interface ClubCardProps {
  club: ClubWithDetails;
  onPress: () => void;
}

export const ClubCard = React.memo(function ClubCard({ club, onPress }: ClubCardProps) {
  return (
    <Card onPress={onPress}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY, marginBottom: 4 }}>
        {club.name}
      </Text>
      {club.description ? (
        <Text
          style={{ fontSize: 14, color: COLORS.TEXT_SECONDARY, marginBottom: 12 }}
          numberOfLines={2}
        >
          {club.description}
        </Text>
      ) : (
        <View style={{ marginBottom: 12 }} />
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Text style={{ fontSize: 12, color: COLORS.TEXT_HINT }}>
          👥 {club.member_count}명
        </Text>
        {club.region && (
          <Text style={{ fontSize: 12, color: COLORS.TEXT_HINT }}>
            📍 {club.region}{club.city ? ` ${club.city}` : ''}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {club.is_recruiting && <Badge text="모집중" variant="success" />}
        <Badge text={CLUB_TYPE_LABELS[club.club_type] ?? club.club_type} variant="neutral" />
      </View>
    </Card>
  );
});
