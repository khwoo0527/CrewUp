import { useQuery } from '@tanstack/react-query';
import { fetchMyClubs } from '@/services/supabase/database';
import { useAuth } from '@/features/auth';

export function useMyClubs() {
  const { user } = useAuth();

  const { data: myClubs, isLoading, error } = useQuery({
    queryKey: ['my-clubs', user?.id],
    queryFn: () => fetchMyClubs(user!.id),
    enabled: !!user?.id,
  });

  return { myClubs: myClubs ?? [], isLoading, error };
}
