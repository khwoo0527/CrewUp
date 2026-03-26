import { supabase } from '../client';
import { fetchClubs, fetchClubById, searchClubs } from '../database';

// supabase is mocked in jest.setup.ts

describe('database query functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchClubs', () => {
    it('should throw error when supabase returns error', async () => {
      const mockFrom = supabase.from as jest.Mock;
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'DB 연결 실패' },
            }),
          }),
        }),
      });

      await expect(fetchClubs()).rejects.toThrow('동호회 목록 조회 실패');
    });

    it('should return empty array when no data', async () => {
      const mockFrom = supabase.from as jest.Mock;
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await fetchClubs();
      expect(result).toEqual([]);
    });
  });

  describe('fetchClubById', () => {
    it('should throw error when supabase returns error', async () => {
      const mockFrom = supabase.from as jest.Mock;
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: '존재하지 않는 동호회' },
            }),
          }),
        }),
      });

      await expect(fetchClubById('invalid-id')).rejects.toThrow('동호회 조회 실패');
    });
  });

  describe('searchClubs', () => {
    it('should throw error when supabase returns error', async () => {
      const mockFrom = supabase.from as jest.Mock;
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: { message: '검색 실패' },
              }),
            }),
          }),
        }),
      });

      await expect(searchClubs('테스트')).rejects.toThrow('동호회 검색 실패');
    });

    it('should return empty array when no results', async () => {
      const mockFrom = supabase.from as jest.Mock;
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            ilike: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await searchClubs('없는동호회');
      expect(result).toEqual([]);
    });
  });
});
