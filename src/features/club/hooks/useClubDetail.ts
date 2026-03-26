import { useQuery } from '@tanstack/react-query';
import { fetchClubById } from '@/services/supabase/database';

export function useClubDetail(clubId: string) {
  const { data: club, isLoading, error } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => fetchClubById(clubId),
    enabled: !!clubId,
  });

  return { club, isLoading, error };
}
