export const CLUB_TYPES = {
  REGULAR: 'regular',
  LIGHTNING: 'lightning',
  LEAGUE: 'league',
} as const;

export const CLUB_TYPE_LABELS: Record<string, string> = {
  regular: '정기 모임',
  lightning: '번개 모임',
  league: '리그',
};

export const MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  owner: '클럽장',
  admin: '운영진',
  member: '회원',
};

export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
} as const;

export const JOIN_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;
