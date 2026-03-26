import {
  CLUB_TYPES,
  CLUB_TYPE_LABELS,
  MEMBER_ROLES,
  MEMBER_ROLE_LABELS,
  MEMBER_STATUS,
  JOIN_REQUEST_STATUS,
} from '../constants';

describe('club constants', () => {
  describe('CLUB_TYPES', () => {
    it('should have all club types', () => {
      expect(CLUB_TYPES.REGULAR).toBe('regular');
      expect(CLUB_TYPES.LIGHTNING).toBe('lightning');
      expect(CLUB_TYPES.LEAGUE).toBe('league');
    });

    it('should have matching labels for all types', () => {
      Object.values(CLUB_TYPES).forEach((type) => {
        expect(CLUB_TYPE_LABELS[type]).toBeDefined();
        expect(typeof CLUB_TYPE_LABELS[type]).toBe('string');
      });
    });
  });

  describe('MEMBER_ROLES', () => {
    it('should have all member roles', () => {
      expect(MEMBER_ROLES.OWNER).toBe('owner');
      expect(MEMBER_ROLES.ADMIN).toBe('admin');
      expect(MEMBER_ROLES.MEMBER).toBe('member');
    });

    it('should have matching labels for all roles', () => {
      Object.values(MEMBER_ROLES).forEach((role) => {
        expect(MEMBER_ROLE_LABELS[role]).toBeDefined();
        expect(typeof MEMBER_ROLE_LABELS[role]).toBe('string');
      });
    });
  });

  describe('MEMBER_STATUS', () => {
    it('should have all statuses', () => {
      expect(MEMBER_STATUS.ACTIVE).toBe('active');
      expect(MEMBER_STATUS.INACTIVE).toBe('inactive');
      expect(MEMBER_STATUS.BANNED).toBe('banned');
    });
  });

  describe('JOIN_REQUEST_STATUS', () => {
    it('should have all request statuses', () => {
      expect(JOIN_REQUEST_STATUS.PENDING).toBe('pending');
      expect(JOIN_REQUEST_STATUS.APPROVED).toBe('approved');
      expect(JOIN_REQUEST_STATUS.REJECTED).toBe('rejected');
    });
  });
});
