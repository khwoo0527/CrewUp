import React from 'react';
import { render } from '@testing-library/react-native';
import { ClubCard } from '../components/ClubCard';
import type { ClubWithDetails } from '../types';

const mockClub: ClubWithDetails = {
  id: 'test-club-id',
  name: '테스트 동호회',
  description: '테스트 설명입니다',
  owner_id: 'owner-id',
  sport_category_id: 'category-id',
  region: '서울',
  city: '강남구',
  district: null,
  club_type: 'regular',
  max_members: 50,
  is_public: true,
  is_recruiting: true,
  tags: null,
  cover_image_url: null,
  created_at: '2026-03-26T00:00:00Z',
  updated_at: '2026-03-26T00:00:00Z',
  member_count: 12,
  sport_category: {
    id: 'category-id',
    name: '테니스',
    icon: null,
    description: null,
    is_active: true,
    display_order: 0,
    created_at: '2026-03-26T00:00:00Z',
  },
};

describe('ClubCard', () => {
  it('should render without crashing', () => {
    const { toJSON } = render(
      <ClubCard club={mockClub} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render without crashing when not recruiting', () => {
    const nonRecruitingClub = { ...mockClub, is_recruiting: false };
    const { toJSON } = render(
      <ClubCard club={nonRecruitingClub} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render without crashing when no description', () => {
    const noDescClub = { ...mockClub, description: null };
    const { toJSON } = render(
      <ClubCard club={noDescClub} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render without crashing when no region', () => {
    const noRegionClub = { ...mockClub, region: null, city: null };
    const { toJSON } = render(
      <ClubCard club={noRegionClub} onPress={jest.fn()} />,
    );
    expect(toJSON()).toBeTruthy();
  });
});
