import { useQuery } from '@tanstack/react-query';
import { fetchClubById, checkClubMembership } from '@/services/supabase/database';
import { useAuth } from '@/features/auth';

export function useClubDetail(clubId: string) {
  const { user } = useAuth();

  const { data: club, isLoading, error } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => fetchClubById(clubId),
    enabled: !!clubId,
  });

  const { data: membership } = useQuery({
    queryKey: ['club-membership', clubId, user?.id],
    queryFn: () => checkClubMembership(clubId, user!.id),
    enabled: !!clubId && !!user,
  });

  return {
    club,
    isLoading,
    error,
    isMember: membership?.isMember ?? false,
    memberRole: membership?.role ?? null,
  };
}
