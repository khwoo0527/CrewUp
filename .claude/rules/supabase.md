---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/supabase/**"
  - ".env"
  - ".env.local"
---

# Supabase 개발 규칙

> 이 파일은 Supabase(PostgreSQL + Auth + Realtime + Storage)를 백엔드로 사용하는 프로젝트에 범용적으로 적용되는 시니어 수준 규칙입니다.
> TypeScript 기본 규칙은 `rules/typescript.md`, React Native 규칙은 `rules/react-native.md`를 참조합니다.
> 프로젝트별 설정, 테이블 스키마, RLS 정책은 `/CLAUDE.md`에 정의합니다.

## 핵심 원칙

- **RLS(Row Level Security) 필수**: 모든 테이블에 RLS를 활성화한다. RLS 없는 테이블은 전 세계에 공개된 것과 같다.
- **타입 안전성**: `supabase gen types`로 생성한 타입을 사용한다. 수동 타입 정의는 스키마와 불일치를 만든다.
- **서버 사이드 검증**: 클라이언트는 신뢰하지 않는다. 중요한 비즈니스 로직은 RLS 정책 또는 Edge Function에서 검증한다.
- **마이그레이션 기반 스키마 관리**: SQL을 직접 실행하지 않는다. 모든 스키마 변경은 마이그레이션 파일로 관리한다.
- **최소 권한 원칙**: 클라이언트에는 `anon` 키만 노출한다. `service_role` 키는 절대 클라이언트에 포함하지 않는다.

---

## 프로젝트 구조

```
src/
├── services/
│   └── supabase/
│       ├── client.ts           # Supabase 클라이언트 초기화 (싱글톤)
│       ├── types.ts            # supabase gen types로 생성된 DB 타입
│       ├── auth.ts             # 인증 관련 함수
│       ├── database.ts         # DB 쿼리 함수 (테이블별 또는 기능별)
│       ├── realtime.ts         # Realtime 구독 함수
│       ├── storage.ts          # Storage 파일 업로드/다운로드
│       └── index.ts            # re-export
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   │   └── useAuth.ts      # 인증 훅 (supabase/auth.ts 사용)
│   │   └── ...
│   └── schedule/
│       ├── hooks/
│       │   └── useScheduleEvents.ts  # react-query + supabase/database.ts
│       └── ...
supabase/
├── migrations/                 # 스키마 마이그레이션 파일
│   ├── 20260326000000_create_clubs.sql
│   ├── 20260326000001_create_members.sql
│   └── ...
├── seed.sql                    # 초기 데이터 (개발용)
├── config.toml                 # 로컬 개발 설정
└── functions/                  # Edge Functions (서버 사이드 로직)
    └── ...
```

### 구조 규칙

- Supabase 클라이언트는 **단일 파일**(`client.ts`)에서 초기화하고 export
- DB 쿼리 함수는 `services/supabase/`에 모아두고, 컴포넌트에서 직접 쿼리 작성 금지
- 컴포넌트 → 커스텀 훅 → DB 쿼리 함수 → Supabase 클라이언트 순서로 호출
- Edge Function은 `supabase/functions/`에 배치

---

## 네이밍 컨벤션

### 데이터베이스 (PostgreSQL)

| 종류 | 컨벤션 | 예시 |
|------|--------|------|
| 테이블명 | snake_case, 복수형 | `clubs`, `club_members`, `schedule_events` |
| 컬럼명 | snake_case | `created_at`, `club_id`, `max_participants` |
| 외래 키 | `{참조테이블_단수}_id` | `club_id`, `user_id`, `event_id` |
| 인덱스 | `idx_{테이블}_{컬럼}` | `idx_events_club_id`, `idx_members_user_id` |
| RLS 정책 | `{동작}_{대상}_{조건}` | `select_own_clubs`, `insert_club_admin_only` |
| Enum 타입 | snake_case | `user_role`, `event_status` |
| 함수/트리거 | snake_case, 동사로 시작 | `handle_new_user`, `update_member_count` |

### TypeScript 코드

| 종류 | 컨벤션 | 예시 |
|------|--------|------|
| 쿼리 함수 | `fetch`, `create`, `update`, `delete` + 대상 | `fetchClubMembers`, `createEvent`, `updateAttendance` |
| 구독 함수 | `subscribeTo` + 대상 | `subscribeToEventChanges`, `subscribeToClubNotifications` |
| 훅 | `use` + 대상 | `useClubMembers`, `useRealtimeEvents` |
| 타입 (DB 행) | PascalCase, `Row` 접미어 생략 | `Club`, `Member`, `ScheduleEvent` |
| 타입 (삽입) | `Create` + 대상 + `Input` | `CreateClubInput`, `CreateEventInput` |
| 타입 (수정) | `Update` + 대상 + `Input` | `UpdateClubInput`, `UpdateEventInput` |

---

## 클라이언트 초기화

```typescript
// services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,        // React Native에서 세션 유지
    autoRefreshToken: true,       // 토큰 자동 갱신
    persistSession: true,         // 세션 영속화
    detectSessionInUrl: false,    // React Native에서는 false
  },
});
```

### 클라이언트 규칙

- 클라이언트 인스턴스는 **앱 전체에서 1개만** 생성 (싱글톤)
- `supabaseUrl`과 `supabaseAnonKey`는 **환경 변수**로 관리
- `service_role` 키는 클라이언트 코드에 **절대 포함하지 않는다**
- `Database` 제네릭 타입을 반드시 전달하여 타입 안전성 확보
- React Native에서는 `AsyncStorage`를 auth storage로 설정

---

## 타입 생성 & 활용

```bash
# DB 타입 자동 생성 (스키마 변경 시마다 실행)
npx supabase gen types typescript --local > src/services/supabase/types.ts
```

```typescript
// 생성된 타입에서 테이블 타입 추출
import type { Database } from './types';

// Row 타입 (SELECT 결과)
type Club = Database['public']['Tables']['clubs']['Row'];
type Member = Database['public']['Tables']['club_members']['Row'];
type ScheduleEvent = Database['public']['Tables']['schedule_events']['Row'];

// Insert 타입 (INSERT 입력)
type CreateClubInput = Database['public']['Tables']['clubs']['Insert'];

// Update 타입 (UPDATE 입력)
type UpdateClubInput = Database['public']['Tables']['clubs']['Update'];

// 커스텀 타입 (조인 결과 등)
type EventWithAttendees = ScheduleEvent & {
  attendees: Member[];
  attendee_count: number;
};
```

### 타입 규칙

- DB 타입은 **항상 `supabase gen types`로 생성** — 수동 작성 금지
- 스키마 변경 후 타입 재생성을 잊지 않는다 (CI에서 자동화 권장)
- 조인/뷰 결과 등 생성 타입으로 커버 안 되는 경우만 커스텀 타입 작성
- 쿼리 함수의 반환 타입을 명시하여, 타입 변경 시 영향 범위를 즉시 파악

---

## 데이터베이스 쿼리

### 기본 CRUD

```typescript
// SELECT — 목록 조회
async function fetchClubEvents(clubId: string): Promise<ScheduleEvent[]> {
  const { data, error } = await supabase
    .from('schedule_events')
    .select('*')
    .eq('club_id', clubId)
    .order('date', { ascending: true });

  if (error) throw new AppError(error.message, 'FETCH_EVENTS', '일정을 불러올 수 없습니다.');
  return data;
}

// SELECT — 단건 조회
async function fetchEventById(eventId: string): Promise<EventWithAttendees> {
  const { data, error } = await supabase
    .from('schedule_events')
    .select(`
      *,
      attendees:event_attendees(
        *,
        member:club_members(*)
      )
    `)
    .eq('id', eventId)
    .single();

  if (error) throw new NotFoundError('일정', eventId);
  return data;
}

// INSERT
async function createEvent(input: CreateEventInput): Promise<ScheduleEvent> {
  const { data, error } = await supabase
    .from('schedule_events')
    .insert(input)
    .select()       // insert 후 생성된 행 반환
    .single();

  if (error) throw new AppError(error.message, 'CREATE_EVENT', '일정 생성에 실패했습니다.');
  return data;
}

// UPDATE
async function updateEvent(eventId: string, input: UpdateEventInput): Promise<ScheduleEvent> {
  const { data, error } = await supabase
    .from('schedule_events')
    .update(input)
    .eq('id', eventId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 'UPDATE_EVENT', '일정 수정에 실패했습니다.');
  return data;
}

// DELETE
async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('schedule_events')
    .delete()
    .eq('id', eventId);

  if (error) throw new AppError(error.message, 'DELETE_EVENT', '일정 삭제에 실패했습니다.');
}
```

### 쿼리 규칙

- **`select('*')` 지양**: 필요한 컬럼만 명시하여 네트워크/메모리 절약 (단, 초기 MVP에서는 `*` 허용)
- **`.single()`**: 단건 조회 시 반드시 사용 — 없으면 배열이 반환됨
- **`.select()` after insert/update**: 생성/수정된 행을 반환받으려면 반드시 추가
- **에러 처리**: `{ data, error }` 구조분해 후 error 체크 필수 — error를 무시하지 않는다
- **필터 체이닝**: `.eq()`, `.in()`, `.gte()`, `.lte()`, `.like()` 등 타입 안전한 필터 사용
- **페이지네이션**: `.range(from, to)` 사용 — 전체 조회 금지 (대용량 테이블)

### 조인 & 관계 쿼리

```typescript
// 관계 데이터 함께 조회 (foreign key 기반)
const { data } = await supabase
  .from('clubs')
  .select(`
    id,
    name,
    members:club_members(
      id,
      user_id,
      role,
      profile:profiles(name, avatar_url)
    )
  `)
  .eq('id', clubId)
  .single();

// 집계 (count)
const { count } = await supabase
  .from('club_members')
  .select('*', { count: 'exact', head: true })
  .eq('club_id', clubId);
```

---

## 인증 (Auth)

### 소셜 로그인 (카카오/네이버)

```typescript
// 소셜 로그인 시작
async function signInWithKakao(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: 'your-app-scheme://auth/callback',
      skipBrowserRedirect: true, // React Native에서 필수
    },
  });
  if (error) throw new AppError(error.message, 'AUTH_KAKAO', '카카오 로그인에 실패했습니다.');
}

// 세션 상태 감지 (앱 초기화 시)
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'SIGNED_IN':
      // 로그인 완료 처리
      break;
    case 'SIGNED_OUT':
      // 로그아웃 처리 (화면 전환 등)
      break;
    case 'TOKEN_REFRESHED':
      // 토큰 갱신됨 (보통 자동 처리)
      break;
  }
});
```

### 인증 훅 패턴

```typescript
// features/auth/hooks/useAuth.ts
function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session),
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session,
    signOut: () => supabase.auth.signOut(),
  };
}
```

### 인증 규칙

- 세션은 **Supabase가 자동 관리** — 직접 토큰을 저장/관리하지 않는다
- `onAuthStateChange`로 전역 인증 상태를 감지한다 — polling 하지 않는다
- 로그아웃 시 로컬 상태(react-query 캐시 등)를 초기화한다
- 인증이 필요한 화면은 `_layout.tsx`에서 가드 처리 (react-native.md 참조)
- `user.id`를 RLS 정책의 `auth.uid()`와 매칭하여 데이터 접근 제어

---

## Row Level Security (RLS)

### RLS 정책 작성 패턴

```sql
-- 모든 테이블에 RLS 활성화 (필수!)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- SELECT: 동호회 멤버만 조회 가능
CREATE POLICY "select_club_members_only"
  ON schedule_events FOR SELECT
  USING (
    club_id IN (
      SELECT club_id FROM club_members
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: 동호회 운영진만 생성 가능
CREATE POLICY "insert_club_admin_only"
  ON schedule_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_id = NEW.club_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );

-- UPDATE: 본인이 생성한 것만 수정 가능
CREATE POLICY "update_own_events"
  ON schedule_events FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- DELETE: 동호회 소유자만 삭제 가능
CREATE POLICY "delete_club_owner_only"
  ON schedule_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM club_members
      WHERE club_id = schedule_events.club_id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );
```

### RLS 규칙

- **모든 테이블**에 RLS를 활성화한다 — 예외 없음
- 정책은 **최소 권한 원칙**: 필요한 최소한의 데이터만 접근 허용
- `auth.uid()`로 현재 사용자를 식별한다
- `USING`은 기존 행 접근 (SELECT, UPDATE, DELETE), `WITH CHECK`는 새 행 검증 (INSERT, UPDATE)
- 복잡한 정책은 **PostgreSQL 함수**로 분리하여 재사용
- RLS 정책에 **성능 주의**: 서브쿼리가 모든 행마다 실행되므로, 인덱스 필수

---

## Realtime 구독

```typescript
// 테이블 변경 구독
function subscribeToEventChanges(clubId: string, callback: (event: ScheduleEvent) => void) {
  const channel = supabase
    .channel(`events:${clubId}`)
    .on(
      'postgres_changes',
      {
        event: '*',           // INSERT, UPDATE, DELETE 모두
        schema: 'public',
        table: 'schedule_events',
        filter: `club_id=eq.${clubId}`,
      },
      (payload) => {
        callback(payload.new as ScheduleEvent);
      },
    )
    .subscribe();

  // cleanup 함수 반환
  return () => {
    supabase.removeChannel(channel);
  };
}

// React 훅으로 감싸기
function useRealtimeEvents(clubId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToEventChanges(clubId, () => {
      // 변경 감지 시 react-query 캐시 무효화 → 자동 refetch
      queryClient.invalidateQueries({ queryKey: ['events', clubId] });
    });

    return unsubscribe;
  }, [clubId, queryClient]);
}
```

### Realtime 규칙

- 구독 시 반드시 **cleanup(unsubscribe)** 처리 — 메모리 릭 방지
- `filter`를 사용하여 **필요한 데이터만** 구독 — 전체 테이블 구독 금지
- 대량 업데이트가 예상되면 **디바운스** 적용
- Realtime은 **UI 갱신 트리거**로 사용 — 데이터 자체는 react-query가 관리
- 채널 이름에 고유 식별자 포함 (`events:${clubId}`)

---

## 마이그레이션

```bash
# 마이그레이션 생성
npx supabase migration new create_clubs

# 마이그레이션 적용 (로컬)
npx supabase db reset

# 마이그레이션 상태 확인
npx supabase migration list
```

```sql
-- supabase/migrations/20260326000000_create_clubs.sql

-- 테이블 생성
CREATE TABLE clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sport_type TEXT NOT NULL DEFAULT 'tennis',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_clubs_owner_id ON clubs(owner_id);
CREATE INDEX idx_clubs_sport_type ON clubs(sport_type);

-- RLS 활성화
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "select_public_clubs" ON clubs
  FOR SELECT USING (true);  -- 동호회 목록은 누구나 조회 가능

CREATE POLICY "insert_authenticated" ON clubs
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);
```

### 마이그레이션 규칙

- 모든 스키마 변경은 **마이그레이션 파일**로 관리 — 대시보드에서 직접 SQL 실행 금지 (프로덕션)
- 파일명: `YYYYMMDDHHMMSS_{설명}.sql` — Supabase CLI가 자동 생성
- **되돌릴 수 없는 변경**(컬럼 삭제, 타입 변경)은 별도 마이그레이션으로 분리하고 주석으로 경고
- 새 테이블 생성 시 반드시 포함: RLS 활성화 + 기본 정책 + 인덱스
- `ON DELETE CASCADE` vs `SET NULL` 결정을 명확히 — 데이터 삭제 영향 분석 필수
- 시드 데이터(`seed.sql`)는 개발 환경 전용 — 프로덕션에 적용하지 않는다

---

## Storage (파일 업로드)

```typescript
// 프로필 이미지 업로드
async function uploadProfileImage(userId: string, file: Blob): Promise<string> {
  const filePath = `profiles/${userId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw new AppError(error.message, 'UPLOAD', '이미지 업로드에 실패했습니다.');

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return data.publicUrl;
}
```

### Storage 규칙

- 버킷은 **용도별** 분리 (`avatars`, `club-images`, `documents`)
- 파일 경로에 **사용자 ID** 포함 — RLS 정책으로 본인 파일만 접근
- 업로드 시 **파일 크기, MIME 타입 검증** — Storage 정책에서 설정
- 이미지는 업로드 전 **리사이즈** (원본 4K 금지)
- Public 버킷과 Private 버킷을 구분 — 민감 파일은 Private + signed URL

---

## Edge Functions (서버 사이드 로직)

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // 서버에서만 service_role 사용
  );

  const { clubId, message } = await req.json();

  // 동호회 멤버 조회
  const { data: members } = await supabase
    .from('club_members')
    .select('push_token')
    .eq('club_id', clubId)
    .not('push_token', 'is', null);

  // 푸시 알림 발송 로직
  // ...

  return new Response(JSON.stringify({ sent: members?.length ?? 0 }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Edge Function 규칙

- `service_role` 키는 **Edge Function에서만** 사용 (클라이언트 금지)
- 클라이언트에서 직접 처리하면 안 되는 로직: 알림 발송, 결제 처리, 관리자 작업
- 입력값 검증 필수 (zod 등)
- 에러 응답은 일관된 형식: `{ error: { code, message } }`
- 타임아웃 고려 (Supabase Edge Function 기본 타임아웃: 60초)

---

## 안티패턴 (하지 말 것)

### 보안 관련

| 안티패턴 | 이유 | 대안 |
|---------|------|------|
| `service_role` 키를 클라이언트에 포함 | 모든 RLS를 우회 → 전체 DB 노출 | `anon` 키만 클라이언트에, `service_role`은 서버에서만 |
| RLS를 비활성화한 채 배포 | 모든 사용자가 모든 데이터에 접근 | 모든 테이블에 RLS 필수 |
| 클라이언트에서 `.rpc()` 없이 복잡한 비즈니스 로직 | 클라이언트 조작 가능 | Edge Function 또는 DB 함수 사용 |
| 토큰을 AsyncStorage에 저장 | 암호화 안 됨 | `expo-secure-store` 사용 |

### 쿼리 관련

| 안티패턴 | 이유 | 대안 |
|---------|------|------|
| `select('*')` 모든 곳에서 사용 | 불필요한 데이터 전송 | 필요한 컬럼만 지정 |
| `.single()` 없이 단건 조회 | 배열이 반환되어 혼란 | 단건은 `.single()` 필수 |
| error를 체크하지 않음 | 조용한 실패 → 디버깅 지옥 | `if (error) throw` 패턴 |
| 대시보드에서 직접 SQL 수정 (프로덕션) | 마이그레이션과 불일치 | 마이그레이션 파일 사용 |
| 인덱스 없이 `.eq()` 필터 | 대용량 테이블에서 풀 스캔 | 자주 쿼리하는 컬럼에 인덱스 |
| 전체 테이블 조회 (페이지네이션 없음) | 메모리 폭발, 느림 | `.range()` 또는 커서 페이지네이션 |

### AI가 흔히 생성하는 실수

| 실수 | 수정 방법 |
|------|----------|
| `createClient`를 컴포넌트마다 호출 | 싱글톤 `client.ts`에서 한번만 생성 |
| 타입을 수동 정의 | `supabase gen types`로 자동 생성 |
| RLS 정책 없이 테이블 생성 | 마이그레이션에 RLS 활성화 + 정책 포함 |
| `onAuthStateChange` cleanup 누락 | `return () => subscription.unsubscribe()` |
| Realtime 구독 cleanup 누락 | `return () => supabase.removeChannel(channel)` |
| insert 후 `select()` 빠뜨림 | `.insert(data).select().single()` |
| 환경 변수를 코드에 하드코딩 | `.env` + `EXPO_PUBLIC_` 접두어 |
| `service_role` 키를 프론트엔드에 사용 | `anon` 키만 프론트에서 사용 |

---

## 에러/예외 처리

```typescript
// Supabase 에러 래퍼
function handleSupabaseError(error: PostgrestError, context: string): never {
  // 일반적인 Supabase 에러 코드 매핑
  const errorMap: Record<string, string> = {
    '23505': '이미 존재하는 데이터입니다.',     // unique violation
    '23503': '참조하는 데이터가 존재하지 않습니다.', // foreign key violation
    '42501': '권한이 없습니다.',               // RLS policy violation
    'PGRST116': '데이터를 찾을 수 없습니다.',    // .single() no rows
  };

  const userMessage = errorMap[error.code] ?? '처리 중 문제가 발생했습니다.';

  throw new AppError(
    `[${context}] ${error.message} (code: ${error.code})`,
    error.code,
    userMessage,
  );
}

// 사용
async function fetchClub(clubId: string): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .single();

  if (error) handleSupabaseError(error, 'fetchClub');
  return data;
}
```

### 에러 처리 규칙

- Supabase의 `{ data, error }` 패턴을 항상 처리 — error 무시 금지
- PostgreSQL 에러 코드를 사용자 친화적 메시지로 변환
- 네트워크 에러 (오프라인)와 서버 에러를 구분
- react-query의 `onError`에서 일괄 에러 토스트 처리

---

## 보안

- **`anon` 키만 클라이언트에**: `service_role` 키는 Edge Function/서버에서만
- **환경 변수**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Expo 공개 접두어)
- **RLS 정책 테스트**: 마이그레이션 작성 후 다른 사용자로 접근 시도하여 검증
- **SQL Injection**: Supabase JS 클라이언트가 자동 파라미터화 — `.rpc()` 사용 시에도 안전
- **민감 데이터 암호화**: 비밀번호, 결제 정보 등은 DB에 평문 저장 금지
- **API Rate Limiting**: Supabase 대시보드에서 설정 가능 — 남용 방지

---

## 성능 최적화

### 쿼리 성능
- 자주 필터/정렬하는 컬럼에 **인덱스** 생성
- `select('*')` 대신 **필요한 컬럼만** 선택
- 대용량 조회는 **페이지네이션** 필수 (`.range()`)
- 관계 쿼리에서 **N+1 문제** 주의 — Supabase 관계 쿼리(`select('*, related(*)')`)는 자동으로 조인하므로 보통 안전

### Realtime 성능
- 구독은 **필요한 테이블/필터만** — 전체 구독 금지
- 대량 업데이트 시 **디바운스** 적용
- 컴포넌트 언마운트 시 **반드시 구독 해제**

### 연결 관리
- Supabase 클라이언트는 내부적으로 커넥션 풀 관리 — 직접 관리 불필요
- 앱이 백그라운드에 갈 때 Realtime 채널 정리 고려
- 네트워크 복구 시 자동 재연결 (Supabase 내장)

---

## 테스트

```typescript
// Supabase 클라이언트 모킹
jest.mock('@/services/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: mockClub,
      error: null,
    }),
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: mockSession },
        error: null,
      }),
    },
  },
}));

// 쿼리 함수 테스트
describe('fetchClub', () => {
  it('동호회 정보를 정상적으로 반환한다', async () => {
    const club = await fetchClub('club-123');
    expect(club.name).toBe('TenniSweet');
  });

  it('존재하지 않는 동호회는 에러를 던진다', async () => {
    mockSupabaseError('PGRST116');
    await expect(fetchClub('invalid')).rejects.toThrow(AppError);
  });
});
```

### 테스트 규칙

- Supabase 클라이언트는 **모킹** 처리 — 실제 DB 호출 금지 (유닛 테스트)
- RLS 정책 테스트는 **로컬 Supabase**에서 다른 사용자로 접근하여 검증
- 마이그레이션 테스트: `supabase db reset`으로 처음부터 적용 확인
- Edge Function 테스트: Deno 테스트 러너 사용

---

## 문서화 규칙

> TypeScript 기본 문서화(`typescript.md`)를 따른다.

### 마이그레이션 파일

```sql
-- Good: 마이그레이션에 목적과 주의사항 명시
-- 동호회 일정 테이블 생성
-- 참고: event_attendees와 1:N 관계, cascade 삭제
CREATE TABLE schedule_events ( ... );

-- Bad: 주석 없는 마이그레이션
CREATE TABLE schedule_events ( ... );
```

### 쿼리 함수

```typescript
// Good: 복잡한 쿼리에 비즈니스 규칙 설명
/**
 * 사용자가 참석 가능한 일정 목록 조회.
 * 이미 마감된 일정은 제외하고, 정원 미달인 일정만 반환한다.
 */
async function fetchAvailableEvents(clubId: string): Promise<ScheduleEvent[]> { ... }

// Bad: 단순 CRUD에 불필요한 주석
/** 동호회 조회 */
async function fetchClub(id: string): Promise<Club> { ... }
```

---

## 빌드 & 설정

### 환경 변수

```
# .env.local (개발)
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...local-anon-key

# .env.production (프로덕션)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...production-anon-key
```

- `EXPO_PUBLIC_` 접두어: 클라이언트에 노출되는 환경 변수 (Expo 규칙)
- `service_role` 키는 환경 변수에도 `EXPO_PUBLIC_` 접두어를 쓰지 않는다 — 서버 전용
- `.env.local`은 `.gitignore`에 포함

### 로컬 개발

```bash
# Supabase 로컬 시작
npx supabase start

# 로컬 Studio 접속
# http://127.0.0.1:54323

# 마이그레이션 적용
npx supabase db reset

# 타입 재생성
npx supabase gen types typescript --local > src/services/supabase/types.ts
```

---

## 자주 쓰는 라이브러리/도구

### 권장

| 용도 | 라이브러리 | 이유 |
|------|-----------|------|
| Supabase 클라이언트 | **@supabase/supabase-js** | 공식 클라이언트, 타입 안전 |
| 서버 상태 관리 | **@tanstack/react-query** | Supabase 쿼리 결과 캐싱/갱신 자동화 |
| 세션 저장 (RN) | **@react-native-async-storage/async-storage** | Supabase Auth 세션 영속화 |
| 보안 저장 | **expo-secure-store** | 민감 토큰 저장 (AsyncStorage 대신) |
| 스키마 검증 | **zod** | Edge Function 입력 검증, 폼 검증 |
| 로컬 개발 | **supabase CLI** | 로컬 DB, 마이그레이션, 타입 생성 |
| 실시간 동기화 | **Supabase Realtime** (내장) | 별도 라이브러리 불필요 |

### 피해야 할 것

| 라이브러리/방식 | 이유 | 대안 |
|---------------|------|------|
| 직접 PostgreSQL 드라이버 | Supabase 클라이언트가 RLS/Auth 자동 처리 | `@supabase/supabase-js` |
| Firebase와 혼용 | 인증/DB 이중 관리 혼란 | Supabase로 통일 |
| ORM (Prisma 등) 클라이언트에서 | 클라이언트에서 DB 직접 접근은 보안 위험 | Supabase JS 클라이언트 사용 |
| 수동 JWT 관리 | Supabase Auth가 자동 관리 | `supabase.auth` 사용 |

---

## 프로젝트별 확장 포인트

> 아래 항목들은 프로젝트마다 다르므로 `/CLAUDE.md`에서 정의합니다:
> - Supabase 프로젝트 URL, anon key (환경 변수)
> - 테이블 스키마 설계
> - RLS 정책 상세
> - Edge Function 목록과 역할
> - Storage 버킷 구성
> - Realtime 구독 대상 테이블
> - 소셜 로그인 프로바이더 설정 (카카오, 네이버 등)
> - 로컬/스테이징/프로덕션 환경 설정
