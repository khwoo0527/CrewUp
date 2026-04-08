# Sprint 0: 프로젝트 기반 구축

> **⚠️ 디자인 변경 안내 (2026-04-07):** 이 Sprint에서 구축한 디자인 토큰(녹색 #2e7d32 기반)은 이후 Cal.com 모노크롬 디자인 시스템(`/DESIGN.md`)으로 전환되었습니다. 코드 예시의 색상값은 당시 기준이며, 현재 디자인 기준은 DESIGN.md를 참조하세요.

**Goal:** Expo 프로젝트를 초기화하고, Supabase 연동, 네비게이션 골격, 공통 컴포넌트/테마를 구축하여 이후 모든 Sprint의 기반을 마련한다.

**Architecture:** Expo Router(파일 기반 라우팅) + NativeWind(Tailwind) + Supabase 클라이언트 싱글톤. 모바일 퍼스트 반응형 기반을 이 Sprint에서 확립한다.

**Tech Stack:** TypeScript, Expo SDK 52+, Expo Router v4, NativeWind v4, Supabase JS, Zustand, React Query
**적용 규칙:** `rules/tech/typescript.md`, `rules/tech/react-native.md`, `rules/tech/supabase.md`

**Sprint 기간:** 2026-03-25 ~ 2026-03-25
**이전 스프린트:** 없음 (최초 Sprint)
**상태:** ✅ 완료

---

## 아키텍처 원칙

```
app/                    ← 라우팅만 (비즈니스 로직 금지)
  └→ src/features/      ← 기능별 비즈니스 로직 (훅, 컴포넌트, 타입)
       └→ src/shared/   ← 2개+ 기능에서 공유하는 것만
            └→ src/services/  ← 외부 서비스 연동 (Supabase 등)
```

- **관심사 분리**: app/ = 라우팅, features/ = 비즈니스 로직, shared/ = 공통, services/ = 외부 연동
- **단방향 의존**: app → features → shared → services (역방향 의존 금지)
- **co-location**: 관련 파일(컴포넌트, 훅, 타입)은 같은 기능 폴더에
- **싱글톤 서비스**: Supabase 클라이언트는 `services/supabase/client.ts` 한 곳에서만 생성

## 코드 컨벤션 (rules 참조)

> **상세 규칙은 rules 원본이 기준이다.** 여기에는 Sprint 0에서 특히 중요한 핵심만 발췌.
> - `rules/tech/typescript.md` — 타입 안전성, 네이밍, 코드 구조, 안티패턴
> - `rules/tech/react-native.md` — 컴포넌트 설계, 훅 규칙, 스타일링, 반응형
> - `rules/tech/supabase.md` — 클라이언트 싱글톤, 환경 변수 보안

### Sprint 0 핵심 포인트

**하드코딩 금지:**
```typescript
// Bad
<View style={{ backgroundColor: '#2e7d32' }}><Text>CrewUp</Text></View>
// Good
<View className="bg-primary"><Text>{APP_NAME}</Text></View>
```

**상수 관리:** 모든 상수는 `src/shared/constants/`에 분리. 매직 넘버/문자열 절대 금지.

**타입 안전성:** `any` 금지, `as` 단언 지양, `!` non-null 금지. 환경 변수는 `src/config/env.ts`로 타입 안전 접근.

**컴포넌트:** 함수형 + 훅, Props는 interface 정의, `Pressable` 사용(TouchableOpacity X), NativeWind 클래스 기반, 100줄 초과 시 분리.

**스타일링:** NativeWind 클래스 기본, 색상 하드코딩 금지 → 테마 토큰, 모바일 퍼스트 반응형(`md:`, `lg:`).

**네이밍:** 컴포넌트 PascalCase, 훅 `use~`, 상수 UPPER_SNAKE, boolean `is/has/can/should`, 핸들러 `handle~`.

---

## 제외 범위

- 인증/로그인 (Sprint 1)
- DB 테이블 생성 — profiles, clubs 등 (Sprint 1~2)
- 비즈니스 로직 — 동호회 생성, 가입, 일정 등 (Sprint 2+)
- 실제 데이터 연동 (Sprint 1+)
- 다크모드/테마 전환 (Phase 6 이후)

---

## 실행 플랜

### Phase 1 (순차)
| Task | 설명 | 예상 시간 | skill |
|------|------|----------|-------|
| Task 1 | Expo 프로젝트 생성 + TypeScript + 의존성 + 린트 | 1~2시간 | — |
| Task 2 | NativeWind + Supabase 클라이언트 + 환경 설정 | 1~2시간 | — |

### Phase 2 (순차)
| Task | 설명 | 예상 시간 | skill |
|------|------|----------|-------|
| Task 3 | 디자인 토큰 + 공통 컴포넌트 (Button, Card, Badge) | 1~2시간 | — |
| Task 4 | 네비게이션 + 나머지 컴포넌트 + 반응형 + 최종 검증 | 1~2시간 | — |

---

### Task 1: Expo 프로젝트 생성 + TypeScript + 의존성 + 린트

**Files:**
- Create: 프로젝트 전체 (`create-expo-app`으로 생성)
- Move: `index.html`, `main.html`, `schedule.html`, `detail.html`, `create.html`, `member.html`, `stats.html` → `docs/mockup/`
- Modify: `tsconfig.json` (strict 옵션 강화 + path alias)
- Create: `.env.local` (환경 변수)
- Modify: `package.json` (추가 의존성)
- Modify: `.gitignore` (Expo + 환경 변수)
- Create: `.prettierrc` (포맷팅 설정)

**Step 1: Expo 프로젝트 생성**
- `npx create-expo-app@latest . --template blank-typescript`
  - 현재 디렉토리에 생성 (기존 `.claude/`, `CLAUDE.md`, `ROADMAP.md`, `docs/` 보존)
  - 충돌 파일 있으면 Expo 기본 파일 우선, 기존 프로젝트 파일 보존
- 기존 HTML 목업 파일 7개를 `docs/mockup/`으로 이동:
  ```bash
  mkdir -p docs/mockup
  mv index.html main.html schedule.html detail.html create.html member.html stats.html docs/mockup/
  ```

**Step 2: TypeScript 설정 강화**
- `tsconfig.json` 수정 (rules/tech/typescript.md의 권장 설정):
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      "forceConsistentCasingInFileNames": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```
- Expo의 `extends`는 유지 (`expo/tsconfig.base`)

**Step 3: 핵심 의존성 설치**
- Expo SDK 모듈 (반드시 `npx expo install` 사용 — 호환 버전 보장):
  ```bash
  npx expo install expo-router expo-linking expo-constants expo-status-bar expo-splash-screen
  npx expo install expo-image expo-secure-store
  npx expo install @shopify/flash-list
  ```
- 상태 관리 + 서버 상태:
  ```bash
  npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
  npx expo install zustand @tanstack/react-query
  ```
- 폼 + 검증:
  ```bash
  npx expo install react-hook-form zod @hookform/resolvers
  ```
- 아이콘:
  ```bash
  npx expo install @expo/vector-icons
  ```

**Step 4: 환경 변수 설정**
- `.env.local` 생성:
  ```
  EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  EXPO_PUBLIC_SUPABASE_ANON_KEY=placeholder_will_be_set_in_task2
  ```
- `.gitignore`에 추가:
  ```
  .env.local
  .env.production
  ```

**Step 5: ESLint + Prettier 설정**
- Expo 기본 ESLint 활용 (`npx expo lint` 동작 확인)
- `.prettierrc` 생성:
  ```json
  {
    "printWidth": 100,
    "singleQuote": true,
    "trailingComma": "all",
    "semi": true,
    "tabWidth": 2,
    "bracketSpacing": true,
    "jsxSingleQuote": false
  }
  ```

**Step 6: 상수 파일 기반 구축**
- `src/shared/constants/app.ts` 생성:
  ```typescript
  export const APP_NAME = 'CrewUp';
  export const APP_SCHEME = 'allclub';
  export const APP_VERSION = '0.1.0';
  ```
- `src/shared/constants/limits.ts` 생성:
  ```typescript
  export const DEFAULT_PAGE_SIZE = 20;
  export const MAX_CLUB_MEMBERS = 50;
  export const MAX_EVENT_PARTICIPANTS = 20;
  export const MIN_EVENT_PARTICIPANTS = 2;
  export const NICKNAME_MIN_LENGTH = 2;
  export const NICKNAME_MAX_LENGTH = 12;
  ```
- `src/shared/constants/index.ts` 생성: re-export

**Step 7: app.json 기본 설정**
- `app.json` 수정:
  ```json
  {
    "expo": {
      "name": "CrewUp",
      "slug": "allclub",
      "scheme": "allclub",
      "version": "0.1.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "userInterfaceStyle": "light",
      "web": {
        "bundler": "metro",
        "favicon": "./assets/favicon.png"
      },
      "plugins": ["expo-router", "expo-secure-store"]
    }
  }
  ```

- 검증: `npx expo start --web` → Expo 기본 화면 표시
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: `npx expo lint` → 린트 통과
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint0): Expo 프로젝트 초기화 + TypeScript strict + 의존성 + 상수 기반 + 린트"
```

**완료 기준:**
- [x] `npx expo start --web` 정상 실행
- [x] `npx tsc --noEmit` 타입 에러 없음
- [x] `npx expo lint` 린트 통과
- [x] 기존 파일 (CLAUDE.md, ROADMAP.md, .claude/, docs/) 보존 확인
- [x] HTML 목업 7개 → `docs/mockup/` 이동 완료
- [x] `.env.local` 생성 + `.gitignore` 반영
- [x] `src/shared/constants/` 상수 파일 생성 (app.ts, limits.ts)

---

### Task 2: NativeWind + Supabase 클라이언트 + 환경 설정

**Files:**
- Create: `tailwind.config.js`
- Create: `global.css`
- Modify: `babel.config.js` (NativeWind 프리셋)
- Modify: `metro.config.js` (NativeWind CSS)
- Create: `src/services/supabase/client.ts`
- Create: `src/services/supabase/index.ts`
- Create: `src/config/env.ts`
- Create: `supabase/config.toml` (supabase init)
- Modify: `.env.local` (실제 로컬 Supabase 키)
- Modify: `app/_layout.tsx` (global CSS import)

**Step 1: NativeWind 설치 + 설정**
- 설치:
  ```bash
  npx expo install nativewind tailwindcss
  ```
- `tailwind.config.js` 생성:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
      extend: {
        colors: {
          primary: { DEFAULT: '#2e7d32', dark: '#1b5e20', light: '#e8f5e9' },
          error: '#e53935',
          warning: '#f57c00',
          info: '#1565c0',
          surface: '#ffffff',
          background: '#f0f2f5',
        },
      },
    },
    plugins: [],
  };
  ```
- `global.css` 생성:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- `babel.config.js` 수정 — NativeWind 프리셋 추가
- `metro.config.js` 수정 — NativeWind CSS 설정 (withNativeWind)
- `app/_layout.tsx`에서 `import '../global.css'` 추가

**Step 2: NativeWind 동작 확인**
- `app/_layout.tsx`에 임시 테스트 UI:
  ```tsx
  <View className="flex-1 items-center justify-center bg-background">
    <Text className="text-2xl font-bold text-primary">🎾 CrewUp</Text>
    <Text className="text-sm text-gray-500 mt-2">테니스 동호회 관리 플랫폼</Text>
  </View>
  ```
- 웹 브라우저에서 색상, 폰트, 정렬 확인
- 반응형 테스트: `className="px-4 md:px-8 lg:px-16"` → 브레이크포인트 동작 확인

**Step 3: Supabase 로컬 환경 초기화**
- `npx supabase init` → `supabase/` 폴더 생성
- `npx supabase start` → 로컬 Supabase 시작
- 출력된 `anon key`와 `API URL`을 `.env.local`에 반영:
  ```
  EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...(로컬 키)
  ```

**Step 4: 환경 변수 타입 안전 접근**
- `src/config/env.ts`:
  ```typescript
  function getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
    }
    return value;
  }

  export const env = {
    supabaseUrl: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  } as const;
  ```

**Step 5: Supabase 클라이언트 싱글톤**
- `src/services/supabase/client.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { env } from '@/config/env';

  export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  ```
  - 제네릭 `Database` 타입은 Sprint 1에서 테이블 생성 후 `supabase gen types`로 추가
- `src/services/supabase/index.ts`: `export { supabase } from './client';`

**Step 6: 연결 확인**
- `app/_layout.tsx`에서 앱 시작 시 Supabase 연결 테스트:
  ```typescript
  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Supabase 연결 실패:', error.message);
      else console.log('Supabase 연결 성공');
    });
  }, []);
  ```
- 웹 콘솔에서 "Supabase 연결 성공" 확인

- 검증: `npx expo start --web` → NativeWind 스타일 + "Supabase 연결 성공" 콘솔
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint0): NativeWind 테마 설정 + Supabase 클라이언트 연동 + 환경 변수"
```

**완료 기준:**
- [x] NativeWind 클래스 웹 + 모바일에서 동작 (색상, 폰트, 정렬)
- [x] 테마 색상 (primary #2e7d32 등) tailwind.config.js에 반영
- [x] 반응형 브레이크포인트 (md:, lg:) 동작 확인
- [x] `npx supabase start` → 로컬 Supabase 정상 실행
- [x] 앱에서 Supabase 연결 성공 (콘솔 로그)
- [x] 환경 변수 타입 안전 접근 (`src/config/env.ts`)

---

### Task 3: 디자인 토큰 + 공통 컴포넌트 (Button, Card, Badge)

**Files:**
- Create: `src/shared/styles/theme.ts`
- Create: `src/shared/styles/typography.ts`
- Create: `src/shared/components/Button.tsx`
- Create: `src/shared/components/Card.tsx`
- Create: `src/shared/components/Badge.tsx`
- Create: `src/shared/components/index.ts`

**Step 1: 디자인 토큰 정의**
- `src/shared/styles/theme.ts`:
  ```typescript
  // tailwind.config.js와 동기화 — JS에서 직접 참조할 때 사용
  export const colors = {
    primary: { DEFAULT: '#2e7d32', dark: '#1b5e20', light: '#e8f5e9' },
    error: '#e53935',
    warning: '#f57c00',
    info: '#1565c0',
    surface: '#ffffff',
    background: '#f0f2f5',
    text: { primary: '#333333', secondary: '#777777', hint: '#aaaaaa' },
    border: '#e0e0e0',
    gray: { 50: '#fafafa', 100: '#f5f5f5', 200: '#eeeeee', 500: '#9e9e9e', 700: '#616161', 900: '#212121' },
  } as const;

  export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
  export const borderRadius = { sm: 6, md: 8, lg: 12, xl: 16, pill: 9999 } as const;
  ```
- `src/shared/styles/typography.ts`:
  ```typescript
  export const typography = {
    heading: { size: 'text-xl', weight: 'font-bold' },
    subheading: { size: 'text-lg', weight: 'font-semibold' },
    body: { size: 'text-base', weight: 'font-normal' },
    caption: { size: 'text-sm', weight: 'font-normal' },
    small: { size: 'text-xs', weight: 'font-normal' },
  } as const;
  ```

**Step 2: Button 컴포넌트**
- Props:
  ```typescript
  interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
  }
  ```
- NativeWind 클래스 기반, `Pressable` 사용 (TouchableOpacity X)
- variant별 스타일:
  - primary: `bg-primary text-white`
  - secondary: `bg-white text-gray-700 border border-gray-200`
  - danger: `bg-white text-error border border-error`
  - ghost: `bg-transparent text-primary`
- size별: sm(`py-2 px-4 text-sm`), md(`py-3 px-6 text-base`), lg(`py-4 px-8 text-lg`)
- 로딩 시 `ActivityIndicator` 표시 + 버튼 비활성화
- `pressed` 상태 시 약간 어둡게 (`active:opacity-80`)
- `pill` 모양: `rounded-full` (목업 기반)
- `accessibilityRole="button"` 설정

**Step 3: Card 컴포넌트**
- Props:
  ```typescript
  interface CardProps extends PropsWithChildren {
    onPress?: () => void;
    className?: string;
  }
  ```
- 목업 기반 스타일: `bg-white rounded-xl border border-gray-200 p-6`
- `onPress` 있으면 `Pressable`, 없으면 `View`
- hover/pressed 스타일: `active:opacity-95 web:hover:shadow-md`
- 그림자: `shadow-sm` (Platform.select로 iOS/Android/Web 분기)

**Step 4: Badge 컴포넌트**
- Props:
  ```typescript
  interface BadgeProps {
    text: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    size?: 'sm' | 'md';
  }
  ```
- variant별 스타일:
  - success: `bg-primary text-white`
  - warning: `bg-gray-500 text-white`
  - error: `bg-error text-white`
  - info: `bg-info text-white`
  - neutral: `bg-gray-200 text-gray-700`
- `rounded-full px-3 py-1 text-xs font-semibold`

**Step 5: re-export**
- `src/shared/components/index.ts`:
  ```typescript
  export { Button } from './Button';
  export { Card } from './Card';
  export { Badge } from './Badge';
  ```

- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: `app/_layout.tsx`에서 Button, Card, Badge 임시 렌더링 → 스타일 확인
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint0): 디자인 토큰 + 공통 컴포넌트 (Button, Card, Badge)"
```

**완료 기준:**
- [x] Button: 4 variant × 3 size 조합 정상 렌더링
- [x] Button: isLoading 시 스피너 표시
- [x] Card: onPress 있을 때 Pressable, 없을 때 View
- [x] Badge: 5 variant 정상 렌더링
- [x] 디자인 토큰이 tailwind.config.js와 동기화
- [x] 모든 컴포넌트 NativeWind 클래스 기반
- [x] `npx tsc --noEmit` 통과

---

### Task 4: 네비게이션 + 나머지 컴포넌트 + 반응형 + 최종 검증

**Files:**
- Modify: `app/_layout.tsx` (루트 레이아웃 — Provider 감싸기)
- Create: `app/index.tsx` (진입점 → 탭으로 리다이렉트)
- Create: `app/(tabs)/_layout.tsx` (탭 네비게이션)
- Create: `app/(tabs)/home.tsx` (홈 플레이스홀더)
- Create: `app/(tabs)/my-clubs.tsx` (내 동호회 플레이스홀더)
- Create: `app/(tabs)/notifications.tsx` (알림 플레이스홀더)
- Create: `app/(tabs)/profile.tsx` (프로필 플레이스홀더)
- Create: `src/shared/components/Container.tsx`
- Create: `src/shared/components/LoadingSpinner.tsx`
- Create: `src/shared/components/EmptyState.tsx`
- Create: `src/shared/hooks/useDeviceType.ts`
- Create: `src/shared/components/ResponsiveGrid.tsx`
- Modify: `src/shared/components/index.ts` (re-export 추가)

**Step 1: 나머지 공통 컴포넌트**

`Container`:
- 반응형 max-width + 가운데 정렬 + 패딩
- `className="flex-1 px-4 md:px-8 lg:max-w-[1200px] lg:mx-auto lg:px-12"`
- `children`을 감싸는 래퍼

`LoadingSpinner`:
- 화면 중앙 `ActivityIndicator` + 선택적 메시지
- `className="flex-1 items-center justify-center"`

`EmptyState`:
- Props: `icon` (이모지), `title`, `description`, `actionLabel?`, `onAction?`
- 중앙 정렬, 아이콘 + 제목 + 설명 + 선택적 CTA 버튼
- 예: `<EmptyState icon="🎾" title="동호회가 없습니다" description="동호회를 탐색해보세요" actionLabel="둘러보기" />`

**Step 2: 반응형 훅 + 그리드**

`useDeviceType`:
```typescript
import { useWindowDimensions } from 'react-native';

export function useDeviceType() {
  const { width } = useWindowDimensions();
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  } as const;
}
```

`ResponsiveGrid`:
- `children`을 모바일 1열 / 태블릿 2열 / 데스크톱 3열로 배치
- NativeWind 반응형 클래스: `w-full md:w-1/2 lg:w-1/3`
- Props: `children`, `className?`

**Step 3: 루트 레이아웃 (Provider 구성)**
- `app/_layout.tsx`:
  ```typescript
  import '../global.css';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { Stack } from 'expo-router';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, retry: 1 },
    },
  });

  export default function RootLayout() {
    return (
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </QueryClientProvider>
    );
  }
  ```
- Task 2의 임시 테스트 UI와 Supabase 연결 테스트 코드 제거

**Step 4: 탭 네비게이션**
- `app/(tabs)/_layout.tsx`:
  - 4개 탭: 홈, 내 동호회, 알림, 프로필
  - 아이콘: `@expo/vector-icons/Ionicons`
    - 홈: `home-outline` / `home`
    - 내 동호회: `people-outline` / `people`
    - 알림: `notifications-outline` / `notifications`
    - 프로필: `person-outline` / `person`
  - 탭 바 스타일: `tabBarActiveTintColor: '#2e7d32'`
  - 탭 라벨: 홈, 내 동호회, 알림, 프로필

**Step 5: 탭 화면 플레이스홀더**
- 각 화면에 `Container` + `EmptyState` 조합:
  - `home.tsx`: `<EmptyState icon="🎾" title="동호회를 탐색해보세요" description="관심 있는 테니스 동호회를 찾아보세요" />`
  - `my-clubs.tsx`: `<EmptyState icon="👥" title="가입된 동호회가 없습니다" description="홈에서 동호회를 찾아 가입해보세요" />`
  - `notifications.tsx`: `<EmptyState icon="🔔" title="새로운 알림이 없습니다" description="동호회 활동이 시작되면 알림이 도착합니다" />`
  - `profile.tsx`: `<EmptyState icon="👤" title="로그인이 필요합니다" description="카카오 또는 네이버로 시작하세요" />`

**Step 6: 반응형 동작 검증**
- `home.tsx`에 더미 Card 6개를 ResponsiveGrid로 배치:
  ```tsx
  <Container>
    <Text className="text-xl font-bold mb-4">인기 동호회</Text>
    <ResponsiveGrid>
      {dummyClubs.map((club) => (
        <Card key={club.id}>
          <Text className="font-semibold">{club.name}</Text>
          <Text className="text-sm text-gray-500">{club.description}</Text>
          <Badge text="모집중" variant="success" />
        </Card>
      ))}
    </ResponsiveGrid>
  </Container>
  ```
- 웹 브라우저 크기 조절 → 1열/2열/3열 전환 확인

**Step 7: re-export 업데이트**
- `src/shared/components/index.ts`에 Container, LoadingSpinner, EmptyState, ResponsiveGrid 추가
- `src/shared/hooks/index.ts` 생성: `export { useDeviceType } from './useDeviceType';`

- 검증: `npx expo start --web` → 탭 전환 + 반응형 그리드 동작
- 검증: `npx tsc --noEmit` → 타입 에러 없음
- 검증: `npx expo lint` → 린트 통과
- 검증: 모바일 너비 → Card 1열, 데스크톱 → 3열
- 예상: 성공

**커밋:**
```
git add -A
git commit -m "feat(sprint0): 네비게이션 구조 + 공통 컴포넌트 + 반응형 그리드 + 최종 검증"
```

**완료 기준:**
- [x] 4개 탭 (홈, 내 동호회, 알림, 프로필) 전환 정상
- [x] 각 탭에 EmptyState 플레이스홀더 표시
- [x] Container: 반응형 max-width 동작
- [x] LoadingSpinner: 중앙 스피너 표시
- [x] EmptyState: 아이콘 + 제목 + 설명 + CTA 버튼
- [x] ResponsiveGrid: 모바일 1열, 태블릿 2열, 데스크톱 3열
- [x] useDeviceType: isMobile/isTablet/isDesktop 정상
- [x] React Query Provider 정상 동작
- [x] home.tsx에 더미 카드 6개 반응형 표시
- [x] `npx expo start --web` 정상
- [x] `npx tsc --noEmit` 통과
- [x] `npx expo lint` 통과

---

## 최종 검증 계획

| 검증 항목 | 명령/방법 | 예상 결과 |
|-----------|-----------|-----------|
| Expo 웹 실행 | `npx expo start --web` | ✅ 정상 실행, 탭 전환 |
| 타입 체크 | `npx tsc --noEmit` | ✅ 에러 없음 |
| 린트 | `npx expo lint` | ✅ 통과 |
| Supabase 로컬 | `npx supabase start` | ✅ 정상 실행 |
| Supabase 연결 | 앱에서 연결 확인 | ✅ 콘솔 "연결 성공" |
| NativeWind | Tailwind 클래스 적용 | ✅ 색상, 폰트, 정렬 |
| 반응형 | 브라우저 리사이즈 | ✅ 1열 → 2열 → 3열 |
| 탭 네비게이션 | 4개 탭 전환 | ✅ 정상 전환 + 아이콘 |
| Button | variant × size 조합 | ✅ 정상 렌더링 |
| Card + Badge | 더미 데이터 렌더링 | ✅ 정상 표시 |
| EmptyState | 플레이스홀더 화면 | ✅ 아이콘 + 메시지 |
| 디자인 토큰 | primary 색상 적용 | ✅ #2e7d32 반영 |
