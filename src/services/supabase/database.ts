import { supabase } from './client';
import type { CreateClubInput, ClubWithDetails } from '@/features/club/types';
import { MEMBER_ROLES } from '@/features/club/constants';

/**
 * 동호회 ID 목록의 멤버 수 조회
 */
async function fetchMemberCounts(clubIds: string[]): Promise<Record<string, number>> {
  if (clubIds.length === 0) return {};
  const { data, error } = await supabase
    .from('club_members')
    .select('club_id')
    .in('club_id', clubIds)
    .eq('status', 'active');

  if (error) {
    console.error('[fetchMemberCounts] 에러:', error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.club_id] = (counts[row.club_id] ?? 0) + 1;
  }
  return counts;
}

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

  const clubIds = (data ?? []).map((c) => c.id);
  const counts = await fetchMemberCounts(clubIds);

  return (data ?? []).map((club) => ({
    ...club,
    sport_category: club.sport_category as ClubWithDetails['sport_category'],
    member_count: counts[club.id] ?? 0,
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

  const counts = await fetchMemberCounts([clubId]);

  return {
    ...data,
    sport_category: data.sport_category as ClubWithDetails['sport_category'],
    member_count: counts[clubId] ?? 0,
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

  const clubIds = (data ?? []).map((c) => c.id);
  const counts = await fetchMemberCounts(clubIds);

  return (data ?? []).map((club) => ({
    ...club,
    sport_category: club.sport_category as ClubWithDetails['sport_category'],
    member_count: counts[club.id] ?? 0,
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
      status: 'active',
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
 * 특정 동호회의 멤버 여부 확인
 */
export async function checkClubMembership(
  clubId: string,
  userId: string,
): Promise<{ isMember: boolean; role: string | null }> {
  const { data, error } = await supabase
    .from('club_members')
    .select('role')
    .eq('club_id', clubId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('[checkClubMembership] 에러:', error.message);
    return { isMember: false, role: null };
  }

  return { isMember: !!data, role: data?.role ?? null };
}

/**
 * 내가 가입한 동호회 목록
 */
export async function fetchMyClubs(userId: string): Promise<ClubWithDetails[]> {
  // 1단계: 내가 가입한 club_id 목록 조회
  const { data: members, error: memberError } = await supabase
    .from('club_members')
    .select('club_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (memberError) throw new Error(`내 동호회 조회 실패: ${memberError.message}`);
  if (!members || members.length === 0) return [];

  const clubIds = members.map((m) => m.club_id);

  // 2단계: club_id로 동호회 정보 조회
  const { data, error } = await supabase
    .from('clubs')
    .select(`
      *,
      sport_category:sport_categories(*)
    `)
    .in('id', clubIds)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`내 동호회 조회 실패: ${error.message}`);

  const counts = await fetchMemberCounts(clubIds);

  return (data ?? []).map((club) => ({
    ...club,
    sport_category: club.sport_category as ClubWithDetails['sport_category'],
    member_count: counts[club.id] ?? 0,
  }));
}
