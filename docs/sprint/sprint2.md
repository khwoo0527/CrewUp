# Sprint 2: DB 스키마 + 동호회 CRUD

**Goal:** 동호회의 데이터 모델(sport_categories, clubs, club_members, join_requests)을 구축하고, 동호회 생성/목록/상세/내 동호회 화면을 구현하여 "동호회를 만들고 찾을 수 있는" 상태를 만든다.

**Architecture:** Supabase Cloud에 마이그레이션으로 4개 테이블 + RLS 정책을 배포한다. `supabase gen types`로 DB 타입을 재생성하고, `src/features/club/` 폴더에 쿼리 함수 + react-query 훅 + UI 컴포넌트를 구현한다. 동호회 생성 시 생성자가 자동으로 owner로 등록되며, 목록은 공개 동호회를 카드 그리드로 표시한다.

**Tech Stack:** TypeScript, Expo Router, Supabase (PostgreSQL + Auth + RLS), NativeWind, react-hook-form + zod, @tanstack/react-query, @shopify/flash-list
**적용 규칙:** `rules/typescript.md`, `rules/react-native.md`, `rules/supabase.md`

**Sprint 기간:** 2026-03-26 ~ (사용자 검토 후 구현)
**이전 스프린트:** Sprint 1 (인증 시스템 구축 완료, commit 1f00523)

---

## 사전 준비 (Sprint 시작 전 필수)

### 1. Supabase Cloud 접속 확인
- Supabase Cloud 프로젝트에 접속 가능한지 확인
- `SUPABASE_ACCESS_TOKEN` 환경변수가 설정되어 있는지 확인 (`npx supabase db push` 시 필요)

### 2. Supabase CLI 프로젝트 링크 확인
```bash
npx supabase link --project-ref {project-ref}   # 이미 되어있으면 생략
```

> 도커 없이 Supabase Cloud를 사용하므로, `npx supabase db reset` 대신 `npx supabase db push`로 마이그레이션을 적용합니다.

---

## 아키텍처 원칙

```
app/(tabs)/home.tsx          → 동호회 탐색 (공개 목록, 검색)
app/(tabs)/my-clubs.tsx      → 내 동호회 목록 (가입된 동호회)
app/club/create.tsx          → 동호회 생성 폼
app/club/[id]/index.tsx      → 동호회 상세/소개 (비회원용 공개 페이지)

src/features/club/
  ├── types.ts               → 동호회 관련 타입 (DB 타입에서 추출)
  ├── constants.ts            → 동호회 관련 상수
  ├── hooks/
  │   ├── useClubs.ts         → 동호회 목록 조회 훅 (react-query)
  │   ├── useClubDetail.ts    → 동호회 상세 조회 훅
  │   ├── useCreateClub.ts    → 동호회 생성 mutation 훅
  │   └── useMyClubs.ts       → 내 동호회 목록 훅
  ├── components/
  │   ├── ClubCard.tsx        → 동호회 카드 (목록 아이템)
  │   ├── ClubForm.tsx        → 동호회 생성 폼
  │   └── ClubDetailHeader.tsx → 동호회 상세 헤더
  └── index.ts                → re-export

src/services/supabase/
  ├── database.ts             → DB 쿼리 함수 (새로 생성)
  └── types.ts                → DB 타입 (재생성)
```

- `app/` 화면은 라우팅 + 레이아웃만, 비즈니스 로직은 `src/features/club/hooks/`에
- DB 쿼리 함수는 `src/services/supabase/database.ts`에 모아두고, 훅에서 호출
- 컴포넌트에서 직접 supabase 클라이언트를 호출하지 않음
- 동호회 생성 시 clubs INSERT + club_members INSERT (owner) 는 하나의 함수에서 순차 처리

---

## 코드 컨벤션 (rules 참조)

> 상세 규칙은 `rules/{tech}.md` 원본을 참조한다. 여기에는 이 Sprint에서 특히 중요한 핵심만 발췌.

**1. DB 타입은 자동 생성만 사용**
```typescript
// Good: gen types에서 추출
type Club = Database['public']['Tables']['clubs']['Row'];
// Bad: 수동 타입 정의
interface Club { id: string; name: string; ... }
```

**2. 쿼리 함수에서 error 체크 필수**
```typescript
// Good
const { data, error } = await supabase.from('clubs').select('*');
if (error) throw new AppError(error.message, 'FETCH_CLUBS', '동호회 목록을 불러올 수 없습니다.');
// Bad: error 무시
const { data } = await supabase.from('clubs').select('*');
```

**3. react-query로 서버 상태 관리**
```typescript
// Good: useQuery + 쿼리 함수
const { data, isLoading } = useQuery({ queryKey: ['clubs'], queryFn: fetchClubs });
// Bad: useEffect + useState로 직접 fetch
```

**4. 폼 검증은 react-hook-form + zod**
```typescript
// Good: zod 스키마 정의 → useForm에 resolver로 전달
const schema = z.object({ name: z.string().min(2).max(30) });
// Bad: onSubmit에서 수동 검증
```

**5. 하드코딩 금지 — 상수 파일 사용**
```typescript
// Good: 상수 참조
import { MAX_CLUB_MEMBERS, CLUB_TYPES } from './constants';
// Bad: 매직 넘버
if (members > 50) { ... }
```

**6. 컴포넌트에서 직접 라우터 사용 금지 (화면만)**
```typescript
// Good: 화면에서 onPress 콜백으로 네비게이션
<ClubCard club={club} onPress={() => router.push(`/club/${club.id}`)} />
// Bad: ClubCard 내부에서 useRouter 호출
```

**7. 리스트 아이템은 React.memo**
```typescript
// Good: memo로 불필요한 리렌더 방지
const ClubCard = React.memo(function ClubCard({ club, onPress }: ClubCardProps) { ... });
```

**8. insert 후 .select() 필수**
```typescript
// Good: 생성된 행 반환
const { data } = await supabase.from('clubs').insert(input).select().single();
// Bad: insert만 하고 데이터 안 받기
await supabase.from('clubs').insert(input);
```

---

## 제외 범위

- 가입 신청/승인/거절 처리 (Sprint 3)
- 멤버 관리 (역할 변경, 강퇴) (Sprint 3)
- 동호회 내부 화면 (일정, 멤버 목록, 통계, 관리) (Sprint 3~5)
- 동호회 대표 이미지 업로드 (Sprint 3 — Storage 연동)
- 동호회 삭제 (Sprint 3)
- 동호회 정보 수정 (Sprint 3)
- 필터 (지역, 종목, 모집중) (Sprint 3 또는 이후)
- 무한 스크롤 / 페이지네이션 (MVP 초기 데이터가 적으므로 전체 조회, 추후 추가)

---

## 실행 플랜

의존성 그래프:
```
Task 1 (DB 스키마 + 시드 + 타입) → Task 2 (쿼리 함수 + 타입) → Task 3 (동호회 생성)
                                                              → Task 4 (목록 + 상세)
                                                              → Task 5 (내 동호회)
```

### Phase 1 (순차)
| Task | 설명 | 대상 | skill |
|------|------|------|-------|
| Task 1 | DB 스키마 마이그레이션 + 시드 + 타입 생성 | Supabase | -- |
| Task 2 | 쿼리 함수 + club 타입/상수 정의 | 서비스 레이어 | -- |

### Phase 2 (병렬 가능)
| Task | 설명 | 대상 | skill |
|------|------|------|-------|
| Task 3 | 동호회 생성 화면 + API | club/create | -- |
| Task 4 | 동호회 목록 + 상세 화면 | home + club/[id] | -- |

### Phase 3 (순차)
| Task | 설명 | 대상 | skill |
|------|------|------|-------|
| Task 5 | 내 동호회 목록 화면 | my-clubs | -- |
| Task 6 | 통합 검증 + 더미 데이터 제거 | 전체 | -- |

> "Phase 2를 팀으로 실행해줘"라고 요청하면 Task 3, Task 4를 병렬로 구현합니다.

---

### Task 1: DB 스키마 마이그레이션 + 시드 + 타입 생성

**Files:**
- Create: `supabase/migrations/{timestamp}_create_sport_categories.sql`
- Create: `supabase/migrations/{timestamp}_create_clubs.sql`
- Create: `supabase/migrations/{timestamp}_create_club_members.sql`
- Create: `supabase/migrations/{timestamp}_create_join_requests.sql`
- Modify: `supabase/seed.sql` (sport_categories 시드 추가)
- Modify: `src/services/supabase/types.ts` (gen types 재생성)

**Step 1: sport_categories 마이그레이션**
- `npx supabase migration new create_sport_categories`
- SQL 작성:
  - `sport_categories` 테이블 생성 (PRD 4.2 기준: id UUID PK, name TEXT NOT NULL UNIQUE, icon TEXT, description TEXT, is_active BOOLEAN DEFAULT true NOT NULL, display_order INTEGER DEFAULT 0 NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL)
  - RLS 활성화 + 누구나 조회 가능 정책
  - `update_updated_at()` 함수는 이미 존재하므로 재정의하지 않음
- 검증: SQL 문법 확인

**Step 2: clubs 마이그레이션**
- `npx supabase migration new create_clubs`
- SQL 작성 (PRD 4.3 기준):
  - `clubs` 테이블: id UUID DEFAULT gen_random_uuid() PK, name TEXT NOT NULL, description TEXT, owner_id UUID NOT NULL REFERENCES profiles(id), sport_category_id UUID NOT NULL REFERENCES sport_categories(id), region TEXT, city TEXT, district TEXT, club_type TEXT NOT NULL DEFAULT 'regular' CHECK (club_type IN ('regular', 'lightning', 'league')), max_members INTEGER NOT NULL DEFAULT 50, is_public BOOLEAN NOT NULL DEFAULT true, is_recruiting BOOLEAN NOT NULL DEFAULT true, tags TEXT[], cover_image_url TEXT, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  - 이름 길이 제약: CHECK (char_length(name) >= 2 AND char_length(name) <= 30)
  - RLS 활성화
  - 정책: 공개 동호회는 누구나 SELECT 가능, 인증된 사용자가 본인을 owner로 INSERT 가능, owner만 UPDATE 가능
  - 인덱스: idx_clubs_sport_category_id, idx_clubs_owner_id, idx_clubs_region, idx_clubs_is_public_recruiting (복합)
  - updated_at 트리거 (기존 update_updated_at 함수 재사용)

**Step 3: club_members 마이그레이션**
- `npx supabase migration new create_club_members`
- SQL 작성 (PRD 4.4 기준):
  - `club_members` 테이블: id UUID DEFAULT gen_random_uuid() PK, club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')), status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')), joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, attendance_count INTEGER NOT NULL DEFAULT 0, attendance_rate DECIMAL
  - UNIQUE(club_id, user_id) 제약
  - RLS 활성화
  - 정책: 동호회 멤버는 같은 동호회 멤버 목록 SELECT 가능, 공개 동호회의 멤버 수는 누구나 count 가능, 시스템(owner 자동 등록)을 위해 인증된 사용자 INSERT 가능 (본인만)
  - 인덱스: idx_club_members_user_id, idx_club_members_club_status (club_id + status 복합)

**Step 4: join_requests 마이그레이션**
- `npx supabase migration new create_join_requests`
- SQL 작성 (PRD 4.5 기준):
  - `join_requests` 테이블: id UUID DEFAULT gen_random_uuid() PK, club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, message TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), reviewed_by UUID REFERENCES profiles(id), reviewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  - RLS 활성화
  - 정책: 본인 신청 내역 SELECT 가능, 동호회 owner/admin은 해당 동호회 신청 SELECT 가능, 인증된 사용자 INSERT 가능 (본인만)
  - 인덱스: idx_join_requests_club_status (club_id + status 복합), idx_join_requests_user_id

**Step 5: 시드 데이터 업데이트**
- `supabase/seed.sql` 수정:
  - sport_categories에 테니스 추가: ('테니스', 'tennis-ball 이모지', '테니스 동호회', true, 1)
  - 추후 확장 종목 주석으로 표시 (축구, 골프 등은 주석으로만)

**Step 6: 마이그레이션 적용 + 타입 생성**
- `npx supabase db push` → Supabase Cloud에 마이그레이션 적용
- `npx supabase gen types typescript --project-id {project-ref} > src/services/supabase/types.ts` (Cloud 기반 타입 생성)
  - 또는 `npx supabase gen types typescript --linked > src/services/supabase/types.ts`
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 예상: 성공

**Step 7: 커밋**
```
git add supabase/migrations/ supabase/seed.sql src/services/supabase/types.ts
git commit -m "feat(sprint2): DB 스키마 마이그레이션 — sport_categories, clubs, club_members, join_requests + RLS + 타입 생성"
```

**완료 기준:**
- [ ] 4개 테이블 생성 완료 (Supabase 대시보드에서 확인)
- [ ] 모든 테이블에 RLS 활성화 + 정책 적용
- [ ] sport_categories에 '테니스' 시드 데이터 존재
- [ ] `src/services/supabase/types.ts`에 새 테이블 타입 포함
- [ ] `npx tsc --noEmit` 통과

---

### Task 2: 쿼리 함수 + club 타입/상수 정의

**Files:**
- Create: `src/features/club/types.ts`
- Create: `src/features/club/constants.ts`
- Create: `src/services/supabase/database.ts`
- Modify: `src/services/supabase/index.ts` (database.ts re-export 추가)
- Modify: `src/shared/constants/limits.ts` (동호회 관련 상수 추가)

**Step 1: 동호회 관련 상수 정의**
- `src/shared/constants/limits.ts`에 추가:
  - `CLUB_NAME_MIN_LENGTH = 2`
  - `CLUB_NAME_MAX_LENGTH = 30`
  - `CLUB_DESCRIPTION_MAX_LENGTH = 500`
  - `MAX_CLUBS_PER_USER = 10` (한 사용자가 생성할 수 있는 동호회 수)
- `src/features/club/constants.ts`:
  - `CLUB_TYPES` 상수 객체: `{ REGULAR: 'regular', LIGHTNING: 'lightning', LEAGUE: 'league' } as const`
  - `CLUB_TYPE_LABELS`: `{ regular: '정기 모임', lightning: '번개 모임', league: '리그' } as const`
  - `MEMBER_ROLES`: `{ OWNER: 'owner', ADMIN: 'admin', MEMBER: 'member' } as const`
  - `MEMBER_ROLE_LABELS`: `{ owner: '클럽장', admin: '운영진', member: '회원' } as const`
  - `MEMBER_STATUS`: `{ ACTIVE: 'active', INACTIVE: 'inactive', BANNED: 'banned' } as const`
  - `JOIN_REQUEST_STATUS`: `{ PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' } as const`

**Step 2: club 타입 정의**
- `src/features/club/types.ts`:
  - `Database` 타입에서 추출: `Club`, `ClubInsert`, `ClubUpdate`, `ClubMember`, `ClubMemberInsert`, `JoinRequest`, `SportCategory`
  - `ClubWithDetails` 타입: Club + member_count(number) + sport_category(SportCategory) (목록/상세에서 사용)
  - `CreateClubInput` 타입: 폼에서 사용할 입력 타입 (name, description, sport_category_id, region, city, district, club_type, max_members, is_public, is_recruiting)

**Step 3: DB 쿼리 함수 구현**
- `src/services/supabase/database.ts`:
  - `fetchClubs()`: 공개 동호회 목록 조회 — clubs + sport_categories 조인, member_count 집계
  - `fetchClubById(clubId)`: 단건 조회 — clubs + sport_categories 조인, member_count 포함
  - `searchClubs(query)`: 이름 부분 일치 검색 — `.ilike('name', '%query%')`
  - `createClub(input)`: 동호회 생성 (clubs INSERT) — `.insert(input).select().single()`
  - `createClubMember(clubId, userId, role)`: 멤버 등록 (club_members INSERT)
  - `fetchMyClubs(userId)`: 내가 가입한 동호회 목록 — club_members에서 user_id로 필터 → clubs 조인
  - `fetchClubMemberCount(clubId)`: 멤버 수 조회 — count 집계
  - 모든 함수에 에러 처리 패턴 적용: `if (error) throw new Error(...)` (AppError는 추후 도입)
- `src/services/supabase/index.ts` 수정: `export * from './database';` 추가

**Step 4: re-export**
- `src/features/club/index.ts` 생성: 타입, 상수, 훅을 re-export

- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 예상: 성공

**Step 5: 커밋**
```
git add src/features/club/ src/services/supabase/database.ts src/services/supabase/index.ts src/shared/constants/limits.ts
git commit -m "feat(sprint2): 동호회 타입/상수 + DB 쿼리 함수 구현"
```

**완료 기준:**
- [ ] `src/features/club/types.ts`에 DB 타입에서 추출한 타입 정의
- [ ] `src/features/club/constants.ts`에 club_type, role, status 상수
- [ ] `src/services/supabase/database.ts`에 CRUD 쿼리 함수 (fetchClubs, fetchClubById, searchClubs, createClub, createClubMember, fetchMyClubs)
- [ ] 모든 쿼리 함수에 에러 처리 포함
- [ ] `npx tsc --noEmit` 통과

---

### Task 3: 동호회 생성 화면 + API

**skill:** `feature-dev:feature-dev` (기존 auth 훅, supabase client, shared components, database.ts 등 3개+ 파일과 통합)

**Files:**
- Create: `app/club/create.tsx`
- Create: `app/club/_layout.tsx`
- Create: `src/features/club/hooks/useCreateClub.ts`
- Create: `src/features/club/components/ClubForm.tsx`

**Step 1: club 라우트 레이아웃**
- `app/club/_layout.tsx`: Stack 네비게이터 (headerShown: false)

**Step 2: useCreateClub 훅 구현**
- `src/features/club/hooks/useCreateClub.ts`:
  - `useMutation` 사용
  - mutationFn: `createClub(input)` 호출 → 생성된 club 받기 → `createClubMember(club.id, userId, 'owner')` 호출 (생성자를 owner로 자동 등록)
  - onSuccess: react-query 캐시 무효화 (`['clubs']`, `['my-clubs']`), 토스트 메시지 "동호회가 생성되었습니다!", `/club/{id}` 또는 `/(tabs)/my-clubs`로 이동
  - onError: 에러 토스트

**Step 3: ClubForm 컴포넌트 구현**
- `src/features/club/components/ClubForm.tsx`:
  - react-hook-form + zod resolver
  - 폼 필드:
    - 동호회 이름 (필수, 2~30자) — TextInput
    - 소개 (선택, 최대 500자) — TextInput multiline
    - 종목 (자동: 테니스 — MVP에서 sport_category_id를 고정, 선택 UI는 이후)
    - 활동 지역 — region (시/도 TextInput), city (시/군/구 TextInput)
    - 모임 유형 — club_type 선택 (정기/번개/리그 — 3개 버튼 또는 Picker)
    - 최대 멤버 수 — NumberInput 또는 Picker (기본 50, 10~100 범위)
    - 공개 여부 — Switch (기본 true)
    - 모집중 여부 — Switch (기본 true)
  - 하단 "동호회 만들기" 버튼 (Button 컴포넌트 사용, isLoading 상태)
  - 스타일: 기존 온보딩 폼 패턴 참고 — Card 안에 폼 배치, 모바일 풀스크린, 데스크톱 가운데 카드

**Step 4: 동호회 생성 화면**
- `app/club/create.tsx`:
  - SafeAreaView + ScrollView 기본 레이아웃
  - 상단 "동호회 만들기" 제목 + 뒤로가기 버튼
  - ClubForm 컴포넌트 배치
  - useCreateClub 훅으로 제출 처리
  - useAuth에서 현재 사용자 ID 확인

- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: `npx expo start --web` → 동호회 생성 폼 렌더링 확인
- 예상: 성공

**Step 5: 커밋**
```
git add app/club/ src/features/club/hooks/useCreateClub.ts src/features/club/components/ClubForm.tsx
git commit -m "feat(sprint2): 동호회 생성 화면 + useCreateClub 훅"
```

**완료 기준:**
- [ ] `/club/create` 경로에서 동호회 생성 폼 표시
- [ ] zod 검증 동작 (이름 2~30자 등)
- [ ] 생성 시 clubs + club_members(owner) 동시 등록
- [ ] 생성 완료 후 캐시 무효화 + 화면 이동
- [ ] 모바일/데스크톱 반응형 정상
- [ ] `npx tsc --noEmit` 통과

---

### Task 4: 동호회 목록 + 상세 화면

**skill:** `feature-dev:feature-dev` (기존 home.tsx, shared components, database.ts 등 3개+ 파일과 통합)

**Files:**
- Modify: `app/(tabs)/home.tsx` (더미 데이터 → 실제 Supabase 조회로 교체)
- Create: `app/club/[id]/index.tsx`
- Create: `app/club/[id]/_layout.tsx`
- Create: `src/features/club/hooks/useClubs.ts`
- Create: `src/features/club/hooks/useClubDetail.ts`
- Create: `src/features/club/components/ClubCard.tsx`
- Create: `src/features/club/components/ClubDetailHeader.tsx`
- Create: `src/features/club/components/ClubSearchBar.tsx`

**Step 1: useClubs 훅 구현**
- `src/features/club/hooks/useClubs.ts`:
  - `useQuery`로 `fetchClubs()` 호출
  - queryKey: `['clubs']`
  - staleTime: 5분
  - 검색어 state 관리: searchQuery → `searchClubs(query)` 호출
  - 검색 디바운스 적용 (300ms)
  - 반환: `{ clubs, isLoading, error, refetch, searchQuery, setSearchQuery }`

**Step 2: ClubCard 컴포넌트**
- `src/features/club/components/ClubCard.tsx`:
  - Props: `ClubWithDetails` + `onPress`
  - React.memo 적용
  - 기존 home.tsx의 카드 스타일을 기반으로:
    - 동호회 이름 (font-bold)
    - 소개 한 줄 (text-gray-500, numberOfLines=2)
    - 멤버 수 + 활동 지역 (아이콘 + 텍스트)
    - 모집중 Badge (is_recruiting이 true일 때)
    - 모임 유형 Badge (club_type 레이블)
  - Card 컴포넌트를 감싸서 사용
  - onPress로 네비게이션 콜백 전달 (ClubCard 내부에서 useRouter 사용하지 않음)

**Step 3: ClubSearchBar 컴포넌트**
- `src/features/club/components/ClubSearchBar.tsx`:
  - TextInput + 검색 아이콘 (Ionicons search-outline)
  - 입력 시 onChangeText로 상위에 전달
  - NativeWind 스타일: bg-gray-100 rounded-xl px-4 py-3
  - 플레이스홀더: "동호회 이름으로 검색"

**Step 4: home.tsx 수정 (더미 → 실제 데이터)**
- `app/(tabs)/home.tsx` 수정:
  - DUMMY_CLUBS 제거
  - useClubs 훅으로 실제 데이터 조회
  - 검색 UI 추가 (ClubSearchBar)
  - 로딩/에러/빈 상태 처리 (LoadingSpinner, EmptyState)
  - FlashList로 교체 (10개 이상 동호회 대비)
  - 동호회 카드 탭 → `/club/{id}`로 이동 (useRouter)
  - 반응형 그리드 유지 (모바일 1열, 태블릿 2열, 데스크톱 3열 — ResponsiveGrid 활용)
  - 우상단 "동호회 만들기" 버튼 또는 FAB (FloatingActionButton) → `/club/create`로 이동

**Step 5: useClubDetail 훅 구현**
- `src/features/club/hooks/useClubDetail.ts`:
  - `useQuery`로 `fetchClubById(clubId)` 호출
  - queryKey: `['club', clubId]`
  - enabled: `!!clubId`
  - 반환: `{ club, isLoading, error }`

**Step 6: ClubDetailHeader 컴포넌트**
- `src/features/club/components/ClubDetailHeader.tsx`:
  - Props: `ClubWithDetails`
  - 동호회 이름 (큰 텍스트, font-bold)
  - 소개 (텍스트 블록)
  - 정보 섹션: 종목, 활동 지역, 모임 유형, 멤버 수/최대, 모집 여부
  - "가입 신청" 버튼 (Sprint 3에서 구현 — 여기서는 비활성 또는 placeholder)

**Step 7: 동호회 상세 화면**
- `app/club/[id]/_layout.tsx`: Stack 레이아웃
- `app/club/[id]/index.tsx`:
  - `useLocalSearchParams<{ id: string }>()`로 ID 받기
  - useClubDetail 훅으로 데이터 조회
  - 로딩/에러/빈 상태 처리
  - ClubDetailHeader 표시
  - 비회원/비멤버용 공개 소개 페이지 (내부 콘텐츠는 Sprint 3 이후)
  - 상단 뒤로가기 버튼

- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: `npx expo start --web` → 동호회 목록 + 상세 화면 렌더링 확인
- 예상: 성공

**Step 8: 커밋**
```
git add app/(tabs)/home.tsx app/club/[id]/ src/features/club/hooks/useClubs.ts src/features/club/hooks/useClubDetail.ts src/features/club/components/
git commit -m "feat(sprint2): 동호회 목록 (검색, 카드 그리드) + 동호회 상세 화면"
```

**완료 기준:**
- [ ] 홈 화면에서 Supabase 실제 데이터로 동호회 목록 표시
- [ ] 이름 검색 동작 (디바운스 적용)
- [ ] 카드 탭 → 동호회 상세 페이지 이동
- [ ] 상세 페이지에 동호회 정보 표시 (이름, 소개, 지역, 멤버 수 등)
- [ ] 로딩/에러/빈 상태 처리
- [ ] 반응형 그리드 (모바일 1열, 데스크톱 3열)
- [ ] `npx tsc --noEmit` 통과

---

### Task 5: 내 동호회 목록 화면

**Files:**
- Modify: `app/(tabs)/my-clubs.tsx` (EmptyState → 실제 데이터)
- Create: `src/features/club/hooks/useMyClubs.ts`

**Step 1: useMyClubs 훅 구현**
- `src/features/club/hooks/useMyClubs.ts`:
  - `useQuery`로 `fetchMyClubs(userId)` 호출
  - queryKey: `['my-clubs', userId]`
  - enabled: `!!userId`
  - useAuth에서 user.id를 가져와 전달
  - 반환: `{ myClubs, isLoading, error }`

**Step 2: my-clubs.tsx 수정**
- `app/(tabs)/my-clubs.tsx`:
  - useAuth에서 user 가져오기
  - useMyClubs 훅으로 내 동호회 목록 조회
  - 상태 처리: 로딩(LoadingSpinner) / 빈 상태(EmptyState "가입된 동호회가 없습니다" + "동호회 찾기" 버튼) / 정상
  - ClubCard 재사용하여 목록 표시
  - 카드 탭 → `/club/{id}`로 이동
  - 상단에 "동호회 만들기" 버튼 (또는 + 아이콘) → `/club/create`
  - 반응형 그리드 (ResponsiveGrid 활용)

- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: `npx expo start --web` → 내 동호회 화면 렌더링 확인
- 예상: 성공

**Step 3: 커밋**
```
git add app/(tabs)/my-clubs.tsx src/features/club/hooks/useMyClubs.ts
git commit -m "feat(sprint2): 내 동호회 목록 화면 — 가입된 동호회 표시"
```

**완료 기준:**
- [ ] 가입된 동호회가 없으면 EmptyState 표시 (CTA "동호회 찾기")
- [ ] 가입된 동호회가 있으면 ClubCard 목록 표시
- [ ] 카드 탭 → 동호회 상세 이동
- [ ] "동호회 만들기" 버튼 → `/club/create` 이동
- [ ] `npx tsc --noEmit` 통과

---

### Task 6: 통합 검증 + 정리

**Files:**
- Modify: `src/features/club/index.ts` (최종 re-export 정리)
- Modify: `app/_layout.tsx` (club 라우트 등록 확인)

**Step 1: re-export 정리**
- `src/features/club/index.ts`에 모든 훅, 타입, 상수, 컴포넌트 re-export 확인

**Step 2: 라우팅 확인**
- `app/_layout.tsx`에서 `club` Stack.Screen 등록 확인 (Expo Router 파일 기반이므로 자동일 수 있으나, 명시적 등록 필요 여부 확인)

**Step 3: 전체 플로우 검증**
1. 앱 시작 → 로그인 → 메인 화면
2. 홈 탭: 동호회 목록 표시 (처음에는 없음 → EmptyState)
3. "동호회 만들기" → 생성 폼 → 정보 입력 → 생성
4. 홈 탭: 생성한 동호회 카드 표시
5. 카드 탭 → 동호회 상세 화면 (이름, 소개, 멤버 1명)
6. 내 동호회 탭: 생성한 동호회 표시
7. 검색: 동호회 이름으로 검색 → 결과 표시
8. 뒤로가기 → 정상 네비게이션

**Step 4: 커밋**
```
git add -A
git commit -m "feat(sprint2): 동호회 CRUD 통합 검증 + 정리"
```

**완료 기준:**
- [ ] 전체 플로우 (생성 → 목록 → 상세 → 내 동호회) 정상
- [ ] 더미 데이터 완전 제거
- [ ] 빌드 성공 (`npx tsc --noEmit`)
- [ ] 로딩/에러/빈 상태 모두 처리
- [ ] 반응형 정상 (모바일 + 데스크톱)

---

## 최종 검증 계획

| 검증 항목 | 명령/방법 | 예상 결과 |
|-----------|-----------|-----------|
| 타입 체크 | `npx tsc --noEmit` | 성공 |
| 린트 | `npx expo lint` | 통과 |
| DB 스키마 | Supabase 대시보드에서 4개 테이블 확인 | 테이블 + RLS + 인덱스 존재 |
| DB 타입 | `src/services/supabase/types.ts`에 새 테이블 포함 | 자동 생성됨 |
| 시드 데이터 | Supabase 대시보드에서 sport_categories 확인 | '테니스' 행 존재 |
| 동호회 생성 | 생성 폼 입력 → 제출 | clubs + club_members 생성, 홈 목록에 표시 |
| 동호회 목록 | 홈 탭에서 카드 표시 | 실제 DB 데이터로 카드 렌더링 |
| 검색 | 이름 입력 | 부분 일치 결과 표시 |
| 동호회 상세 | 카드 탭 | 상세 정보 표시 (이름, 소개, 지역, 멤버 수) |
| 내 동호회 | 내 동호회 탭 | 내가 생성한/가입한 동호회 표시 |
| 빈 상태 | 동호회 없는 상태 | EmptyState + CTA 표시 |
| 반응형 | 브라우저 리사이즈 | 모바일 1열 / 데스크톱 3열 |
| RLS | 비로그인 상태에서 clubs 접근 | 공개 동호회만 조회 가능 |
