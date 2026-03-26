import type { Database } from '@/services/supabase/types';

// DB Row 타입 추출
export type Club = Database['public']['Tables']['clubs']['Row'];
export type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
export type ClubUpdate = Database['public']['Tables']['clubs']['Update'];
export type ClubMember = Database['public']['Tables']['club_members']['Row'];
export type ClubMemberInsert = Database['public']['Tables']['club_members']['Insert'];
export type JoinRequest = Database['public']['Tables']['join_requests']['Row'];
export type SportCategory = Database['public']['Tables']['sport_categories']['Row'];

// 목록/상세에서 사용할 확장 타입
export type ClubWithDetails = Club & {
  member_count: number;
  sport_category: SportCategory;
};

// 동호회 생성 폼 입력 타입
export interface CreateClubInput {
  name: string;
  description?: string;
  sport_category_id: string;
  region?: string;
  city?: string;
  district?: string;
  club_type: string;
  max_members: number;
  is_public: boolean;
  is_recruiting: boolean;
}
