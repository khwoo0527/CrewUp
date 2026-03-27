# Sprint 1: 인증 시스템

**Goal:** 카카오/네이버 소셜 로그인, 온보딩(프로필 설정), 세션 관리를 구축하여 이후 모든 기능의 사용자 식별 기반을 마련한다.

**Architecture:** Supabase Auth OAuth → 세션 자동 관리(AsyncStorage) → useAuth 훅으로 전역 상태 감지 → _layout.tsx에서 인증 가드. 프로필은 auth.users 확장 테이블(profiles)로 관리.

**Tech Stack:** TypeScript, Expo Router, Supabase Auth + Storage, NativeWind
**적용 규칙:** `rules/typescript.md`, `rules/react-native.md`, `rules/supabase.md`

**Sprint 기간:** 2026-03-25 ~ 2026-03-26
**이전 스프린트:** Sprint 0 (프로젝트 기반 구축 완료)
**상태:** ✅ 완료 (네이버 로그인 미구현 → Google OAuth로 대체, 카카오 키 미등록 → backlog)

---

## 아키텍처 원칙

```
app/_layout.tsx (인증 가드)
  ├→ 미로그인 → app/(auth)/login.tsx
  ├→ 로그인 + 프로필 미완성 → app/(auth)/onboarding.tsx
  └→ 로그인 + 프로필 완성 → app/(tabs)/

Supabase Auth
  └→ onAuthStateChange → useAuth 훅 → 전역 상태
       └→ profiles 테이블 (auth.users 확장)
```

- 인증 상태는 `useAuth` 훅 하나로 관리 — 컴포넌트에서 직접 Supabase Auth 호출 금지
- 세션은 Supabase가 자동 관리 — 직접 토큰 저장/관리하지 않음
- 프로필 완성 여부로 온보딩 분기 — `profiles.nickname`이 null이면 온보딩으로

## 코드 컨벤션 (rules 참조)

> 상세 규칙은 rules 원본이 기준. Sprint 1 핵심 포인트만 발췌.

**Supabase 규칙:** DB 타입은 `supabase gen types`로 자동 생성. 수동 타입 정의 금지. RLS 모든 테이블 필수. `service_role` 키 클라이언트 금지.

**인증 규칙:** `onAuthStateChange`로 전역 감지. polling 금지. 로그아웃 시 로컬 캐시(react-query) 초기화.

**컴포넌트 규칙:** Props는 interface 정의. `Pressable` 사용. NativeWind 클래스 기반. 상수는 constants/에 정의.

**타입 안전성:** `any` 금지, `as` 지양, `!` 금지. 환경 변수는 `src/config/env.ts`로 접근.

---

## 사전 준비 (Sprint 시작 전 필수)

### 1. Supabase CLI 설치 확인
```bash
npx supabase --version   # 버전 출력되면 OK
# 안 되면: npm install -g supabase
```

### 2. 카카오 개발자 앱 등록
1. https://developers.kakao.com 접속 → 로그인
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름: `CrewUp`
4. "앱 키" 탭 → **REST API 키** 복사
5. "카카오 로그인" → 활성화 ON
6. "Redirect URI" 추가:
   - 로컬: `http://127.0.0.1:54321/auth/v1/callback`
   - 프로덕션(나중에): `https://{project}.supabase.co/auth/v1/callback`
7. "동의항목" → 닉네임, 프로필 사진 (선택), 이메일 설정

### 3. 네이버 개발자 앱 등록
1. https://developers.naver.com 접속 → 로그인
2. "Application" → "애플리케이션 등록"
3. 앱 이름: `CrewUp`, 사용 API: "네이버 로그인(네아로)"
4. 환경: "PC웹" + "모바일웹"
5. 서비스 URL: `http://localhost:8082` (로컬)
6. Callback URL:
   - 로컬: `http://127.0.0.1:54321/auth/v1/callback`
   - 프로덕션(나중에): `https://{project}.supabase.co/auth/v1/callback`
7. **Client ID**와 **Client Secret** 복사

### 4. Supabase 로컬에 OAuth Provider 등록
- `supabase/config.toml`에 추가 (Task 1에서 supabase init 후):
  ```toml
  [auth.external.kakao]
  enabled = true
  client_id = "(카카오 REST API 키)"
  secret = "(카카오에서는 REST API 키를 secret으로도 사용)"
  redirect_uri = ""

  [auth.external.naver]
  enabled = true
  client_id = "(네이버 Client ID)"
  secret = "(네이버 Client Secret)"
  redirect_uri = ""
  ```
- 등록 후 `npx supabase stop && npx supabase start`로 재시작

> 사전 준비가 안 되면 Task 2(소셜 로그인)를 진행할 수 없습니다.
> Task 1 작업 중 사용자에게 사전 준비 완료 여부를 확인합니다.

---

## 제외 범위

- 동호회 CRUD (Sprint 2)
- 멤버 관리 (Sprint 3)
- 이메일/비밀번호 로그인 (MVP 제외 — 소셜만)
- 비밀번호 찾기/재설정 (소셜 로그인이라 불필요)
- 프로필 이미지 업로드 (Sprint 1에서는 텍스트 프로필만 — 이미지는 Sprint 2 이후)

---

## 실행 플랜

### Phase 1 (순차)
| Task | 설명 | 예상 시간 | skill |
|------|------|----------|-------|
| Task 1 | Supabase 로컬 초기화 + profiles 마이그레이션 + RLS + 타입 생성 | 1~2시간 | — |
| Task 2 | 소셜 로그인 (카카오/네이버) + useAuth 훅 + 세션 관리 | 1~2시간 | — |

### Phase 2 (순차)
| Task | 설명 | 예상 시간 | skill |
|------|------|----------|-------|
| Task 3 | 로그인 화면 + 온보딩 화면 + 인증 가드 | 1~2시간 | — |
| Task 4 | 프로필 화면 + 수정 + 로그아웃 + 최종 검증 | 1~2시간 | — |

---

### Task 1: Supabase 로컬 초기화 + profiles 마이그레이션 + RLS + 타입

**Files:**
- Create: `supabase/` (supabase init)
- Create: `supabase/migrations/00000000000000_create_profiles.sql`
- Create: `supabase/seed.sql`
- Create: `src/services/supabase/types.ts` (gen types 자동 생성)
- Modify: `.env.local` (실제 로컬 키 반영)

**Step 1: Supabase 로컬 초기화**
- `npx supabase init` → `supabase/` 폴더 생성
- `npx supabase start` → 로컬 Supabase 시작
- 출력된 `anon key`와 `API URL`을 `.env.local`에 반영

**Step 2: profiles 테이블 마이그레이션**
- `npx supabase migration new create_profiles` → 마이그레이션 파일 생성
- SQL 작성:
  ```sql
  -- profiles: auth.users 확장 프로필
  CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    region TEXT,
    city TEXT,
    push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  );

  -- 닉네임 길이 제약
  ALTER TABLE profiles ADD CONSTRAINT nickname_length
    CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 12);

  -- RLS 활성화
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- 누구나 프로필 조회 가능 (동호회 멤버 목록 등에서 필요)
  CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

  -- 본인 프로필만 수정 가능
  CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  -- 본인 프로필만 삽입 가능
  CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

  -- 인덱스
  CREATE INDEX idx_profiles_nickname ON profiles(nickname);

  -- updated_at 자동 갱신 트리거
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

  -- 새 유저 가입 시 profiles 자동 생성 트리거
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
  ```

**Step 3: 시드 데이터**
- `supabase/seed.sql`: 빈 파일 (Sprint 1에서는 시드 불필요)

**Step 4: 마이그레이션 적용 + 타입 생성**
- `npx supabase db reset` → 마이그레이션 + 시드 적용
- `npx supabase gen types typescript --local > src/services/supabase/types.ts`

**Step 5: Supabase 클라이언트에 Database 타입 적용**
- `src/services/supabase/client.ts` 수정: `createClient<Database>` 제네릭 추가

- 검증: `npx supabase db reset` → 에러 없음
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: Supabase Studio (`http://127.0.0.1:54323`)에서 profiles 테이블 확인
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint1): profiles 테이블 마이그레이션 + RLS + 타입 생성"
```

**완료 기준:**
- [x] `npx supabase start` 정상 실행
- [x] profiles 테이블 생성 + RLS 정책 활성화
- [x] `supabase gen types` → `types.ts` 생성
- [x] 클라이언트에 `Database` 제네릭 적용
- [x] `npx tsc --noEmit` 통과

---

### Task 2: 소셜 로그인 (카카오/네이버) + useAuth 훅 + 세션 관리

**Files:**
- Create: `src/features/auth/hooks/useAuth.ts`
- Create: `src/features/auth/types.ts`
- Create: `src/features/auth/index.ts`
- Modify: `src/services/supabase/client.ts` (Database 타입 import)

**Step 1: auth 타입 정의**
- `src/features/auth/types.ts`:
  ```typescript
  import type { Session, User } from '@supabase/supabase-js';

  interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isOnboarded: boolean; // nickname이 있으면 true
  }
  ```

**Step 2: useAuth 훅 구현**
- `src/features/auth/hooks/useAuth.ts`:
  - `supabase.auth.getSession()` → 초기 세션 로드
  - `supabase.auth.onAuthStateChange()` → 상태 변경 감지
  - 세션 있으면 → profiles 테이블에서 프로필 조회
  - `isOnboarded`: `profile?.nickname`이 null이 아니면 true
  - `signInWithKakao()`: Supabase OAuth (카카오)
  - `signInWithNaver()`: Supabase OAuth (네이버)
  - `signOut()`: 로그아웃 + react-query 캐시 초기화
  - cleanup: `subscription.unsubscribe()` 반드시 처리

**Step 3: 소셜 로그인 함수**
- 카카오/네이버 OAuth는 Supabase Auth가 처리
- 웹: `supabase.auth.signInWithOAuth({ provider: 'kakao' })` → 리다이렉트 방식
- 네이티브(향후): `expo-auth-session` 또는 `expo-web-browser`로 처리
- MVP 웹에서는 리다이렉트 방식이 가장 간단

**Step 4: re-export**
- `src/features/auth/index.ts`: `export { useAuth } from './hooks/useAuth';`

- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint1): useAuth 훅 + 카카오/네이버 소셜 로그인 함수"
```

**완료 기준:**
- [x] `useAuth` 훅이 세션 상태를 정확히 반영
- [x] `signInWithGoogle`, `signInWithKakao`, `signOut` 함수 정의
- [ ] `signInWithNaver` — ❌ 미구현 (네이버 개발자 앱 미등록)
- [x] `onAuthStateChange` cleanup 처리
- [x] `isOnboarded` (닉네임 존재 여부) 정상 판단
- [x] `npx tsc --noEmit` 통과

---

### Task 3: 로그인 화면 + 온보딩 화면 + 인증 가드

**Files:**
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(auth)/onboarding.tsx`
- Modify: `app/_layout.tsx` (인증 가드 추가)

**Step 1: 인증 그룹 레이아웃**
- `app/(auth)/_layout.tsx`: Stack 네비게이터 (headerShown: false)

**Step 2: 로그인 화면**
- `app/(auth)/login.tsx`:
  - CrewUp 로고 + 앱 소개 텍스트
  - "카카오로 시작하기" 버튼 (노란색 배경 `bg-[#FEE500]` — 카카오 공식 색상은 상수로)
  - "네이버로 시작하기" 버튼 (녹색 배경 `bg-[#03C75A]` — 네이버 공식 색상은 상수로)
  - 하단 이용약관/개인정보 처리방침 링크 (텍스트만, 향후 연결)
  - 모바일 중앙 정렬, 데스크톱에서도 카드 형태로 가운데

**Step 3: 온보딩 화면**
- `app/(auth)/onboarding.tsx`:
  - "프로필을 설정해주세요" 제목
  - 닉네임 입력 (필수, 2~12자, 중복 체크 — 상수 `NICKNAME_MIN_LENGTH`, `NICKNAME_MAX_LENGTH` 참조)
  - 활동 지역 선택 (선택 — 드롭다운 또는 텍스트 입력)
  - "시작하기" 버튼 → profiles 테이블 업데이트 → 메인 화면 이동
  - react-hook-form + zod 검증

**Step 4: 인증 가드 (_layout.tsx 수정)**
- `app/_layout.tsx`에서 `useAuth` 훅 사용:
  ```
  isLoading → LoadingSpinner
  !isAuthenticated → Redirect to /(auth)/login
  !isOnboarded → Redirect to /(auth)/onboarding
  isOnboarded → (tabs) 표시
  ```

- 검증: `npx expo start --web` → 로그인 화면 표시 확인
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint1): 로그인 화면 + 온보딩 화면 + 인증 가드"
```

**완료 기준:**
- [x] 앱 시작 시 로그인 화면 표시 (미로그인 상태)
- [x] Google/카카오 로그인 버튼 표시 (공식 색상)
- [ ] 네이버 로그인 버튼 — ❌ 미구현
- [x] 온보딩 화면에 닉네임 입력 + 지역 선택
- [x] 인증 가드: 미로그인 → 로그인, 프로필 미완성 → 온보딩
- [x] `npx tsc --noEmit` 통과
- [x] 모바일 + 데스크톱 반응형 정상

---

### Task 4: 프로필 화면 + 수정 + 로그아웃 + 최종 검증

**Files:**
- Modify: `app/(tabs)/profile.tsx` (프로필 화면 구현)
- Create: `src/features/auth/components/ProfileCard.tsx`
- Create: `src/shared/constants/auth.ts` (소셜 로그인 색상 등)

**Step 1: auth 상수 정의**
- `src/shared/constants/auth.ts`:
  ```typescript
  export const KAKAO_BRAND_COLOR = '#FEE500';
  export const KAKAO_TEXT_COLOR = '#000000';
  export const NAVER_BRAND_COLOR = '#03C75A';
  export const NAVER_TEXT_COLOR = '#ffffff';
  ```
- `src/shared/constants/index.ts`에 re-export 추가

**Step 2: 프로필 화면 구현**
- `app/(tabs)/profile.tsx`:
  - 프로필 카드 (닉네임, 지역, 가입일)
  - "프로필 수정" 버튼 → 수정 모달 또는 화면
  - "로그아웃" 버튼 → 확인 팝업 → `signOut()` → 로그인 화면으로
  - 앱 버전 표시 (`APP_VERSION` 상수)

**Step 3: 프로필 수정**
- 닉네임 변경 (중복 체크)
- 활동 지역 변경
- profiles 테이블 UPDATE
- 수정 완료 → 토스트 메시지

**Step 4: 로그아웃**
- `signOut()` 호출 → Supabase 세션 삭제
- react-query 캐시 전체 초기화 (`queryClient.clear()`)
- 로그인 화면으로 리다이렉트

**Step 5: 최종 검증**
- 전체 플로우 테스트:
  1. 앱 시작 → 로그인 화면
  2. 카카오/네이버 로그인 (Supabase 대시보드에서 테스트 유저 생성하여 테스트)
  3. 온보딩 → 닉네임 설정
  4. 메인 화면 진입
  5. 프로필 탭 → 정보 확인
  6. 프로필 수정 → 저장
  7. 로그아웃 → 로그인 화면
  8. 앱 재시작 → 세션 유지 (자동 로그인)

- 검증: `npx expo start --web` → 전체 플로우 정상
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint1): 프로필 화면 + 수정 + 로그아웃 + 인증 플로우 완성"
```

**완료 기준:**
- [x] 프로필 탭에 닉네임/지역/가입일 표시
- [x] 프로필 수정 → DB 반영
- [x] 로그아웃 → 세션 삭제 + 로그인 화면 이동
- [x] 앱 재시작 시 세션 유지 (자동 로그인)
- [x] 전체 인증 플로우 (로그인 → 온보딩 → 메인 → 프로필 → 로그아웃) 정상
- [x] `npx tsc --noEmit` 통과

---

## 최종 검증 계획

| 검증 항목 | 명령/방법 | 예상 결과 |
|-----------|-----------|-----------|
| 타입 체크 | `npx tsc --noEmit` | ✅ 에러 없음 |
| Supabase 로컬 | `npx supabase start` | ✅ 정상 실행 |
| profiles 테이블 | Supabase Studio에서 확인 | ✅ 테이블 + RLS + 트리거 |
| DB 타입 | `src/services/supabase/types.ts` 존재 | ✅ 자동 생성됨 |
| 로그인 화면 | 앱 시작 시 표시 | ✅ Google/카카오 버튼 (네이버 미구현) |
| 소셜 로그인 | Google/카카오 로그인 | ✅ 세션 생성 + profiles 자동 생성 |
| 온보딩 | 닉네임 설정 | ✅ profiles 업데이트 |
| 인증 가드 | 미로그인 → 로그인 화면 | ✅ 리다이렉트 |
| 프로필 | 프로필 탭에 정보 표시 | ✅ 닉네임/지역/가입일 |
| 로그아웃 | 로그아웃 → 로그인 화면 | ✅ 세션 삭제 |
| 세션 유지 | 앱 재시작 | ✅ 자동 로그인 |
| 반응형 | 모바일/데스크톱 | ✅ 로그인/온보딩/프로필 반응형 |
| 사용자 테스트 가능 | 직접 로그인/로그아웃 | ✅ 전체 플로우 동작 |
