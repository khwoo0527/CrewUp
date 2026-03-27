import { supabase } from './client';
import type { CreateClubInput, ClubWithDetails } from '@/features/club/types';
import { MEMBER_ROLES } from '@/features/club/constants';

/**
 * 공개 동호회 목록 조회 (sport_category 조인)
 */
export async function fetchClubs(): Promise<ClubWithDetails[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      sport_category:sport_categories(*)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`동호회 목록 조회 실패: ${error.message}`);

  return (data ?? []).map((club) => ({
    ...club,
    sport_category: club.sport_category as ClubWithDetails['sport_category'],
    member_count: 0,
  }));
}

/**
 * 동호회 단건 조회
 */
export async function fetchClubById(clubId: string): Promise<ClubWithDetails> {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      sport_category:sport_categories(*)
    `)
    .eq('id', clubId)
    .single();

  if (error) throw new Error(`동호회 조회 실패: ${error.message}`);

  return {
    ...data,
    sport_category: data.sport_category as ClubWithDetails['sport_category'],
    member_count: 0,
  };
}

/**
 * 동호회 이름 검색 (부분 일치)
 */
export async function searchClubs(query: string): Promise<ClubWithDetails[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      sport_category:sport_categories(*)
    `)
    .eq('is_public', true)
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`동호회 검색 실패: ${error.message}`);

  return (data ?? []).map((club) => ({
    ...club,
    sport_category: club.sport_category as ClubWithDetails['sport_category'],
    member_count: 0,
  }));
}

/**
 * 동호회 생성
 */
export async function createClub(
  input: CreateClubInput,
  ownerId: string,
): Promise<ClubWithDetails> {
  // 1. clubs INSERT
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .insert({
      ...input,
      owner_id: ownerId,
    })
    .select(`
      *,
      sport_category:sport_categories(*)
    `)
    .single();

  if (clubError) throw new Error(`동호회 생성 실패: ${clubError.message}`);

  // 2. 생성자를 owner로 등록
  const { error: memberError } = await supabase
    .from('club_members')
    .insert({
      club_id: club.id,
      user_id: ownerId,
      role: MEMBER_ROLES.OWNER,
    });

  if (memberError) throw new Error(`멤버 등록 실패: ${memberError.message}`);

  return {
    ...club,
    sport_category: club.sport_category as ClubWithDetails['sport_category'],
    member_count: 1,
  };
}

/**
 * 멤버 등록
 */
export async function createClubMember(
  clubId: string,
  userId: string,
  role: string = 'member',
): Promise<void> {
  const { error } = await supabase
    .from('club_members')
    .insert({
      club_id: clubId,
      user_id: userId,
      role,
    });

  if (error) throw new Error(`멤버 등록 실패: ${error.message}`);
}

/**
 * 내가 가입한 동호회 목록
 */
export async function fetchMyClubs(userId: string): Promise<ClubWithDetails[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select(`
      club:clubs(
        *,
        sport_category:sport_categories(*)
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw new Error(`내 동호회 조회 실패: ${error.message}`);

  return (data ?? [])
    .map((row) => {
      const club = row.club as unknown as Record<string, unknown>;
      if (!club) return null;
      return {
        ...club,
        sport_category: club.sport_category as ClubWithDetails['sport_category'],
        member_count: 0,
      } as ClubWithDetails;
    })
    .filter((club): club is ClubWithDetails => club !== null);
}
