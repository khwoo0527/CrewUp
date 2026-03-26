import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClubs, searchClubs } from '@/services/supabase/database';
import { useDebounce } from '@/shared/hooks/useDebounce';

export function useClubs() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const isSearching = debouncedQuery.trim().length > 0;

  const clubsQuery = useQuery({
    queryKey: ['clubs'],
    queryFn: fetchClubs,
    staleTime: 5 * 60 * 1000,
    enabled: !isSearching,
  });

  const searchQueryResult = useQuery({
    queryKey: ['clubs', 'search', debouncedQuery],
    queryFn: () => searchClubs(debouncedQuery.trim()),
    staleTime: 5 * 60 * 1000,
    enabled: isSearching,
  });

  const activeQuery = isSearching ? searchQueryResult : clubsQuery;

  return {
    clubs: activeQuery.data ?? [],
    isLoading: activeQuery.isLoading,
    error: activeQuery.error,
    refetch: activeQuery.refetch,
    searchQuery,
    setSearchQuery,
  };
}
