---
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "app.json"
  - "app.config.ts"
  - "babel.config.js"
  - "metro.config.js"
---

# React Native + Expo 개발 규칙

> 이 파일은 React Native (Expo) 프로젝트에 범용적으로 적용되는 시니어 수준 규칙입니다.
> TypeScript 기본 규칙은 `rules/typescript.md`를 참조합니다. 여기서는 React Native/Expo 특화 규칙만 다룹니다.
> 프로젝트별 설정, 빌드 명령, 폴더 구조는 `/CLAUDE.md`에 정의합니다.

## 핵심 원칙

- **모바일 퍼스트**: 모바일 경험이 최우선. 웹은 보조 — 터치 영역, 스크롤 성능, 오프라인 대응을 항상 고려한다.
- **네이티브 느낌**: 웹을 모바일에 옮긴 것이 아니라, 네이티브 앱처럼 느껴져야 한다 (애니메이션, 제스처, 햅틱).
- **성능 = UX**: 60fps 유지가 기본. 렌더링 병목, 메모리 릭, 과도한 리렌더를 적극적으로 방지한다.
- **플랫폼 차이 인식**: iOS와 Android는 동작이 다르다. Platform.OS로 분기가 필요한 지점을 미리 파악한다.
- **Expo 생태계 우선**: 가능하면 Expo SDK 모듈을 사용한다. 네이티브 모듈이 꼭 필요한 경우만 개발 빌드(dev client)로 전환한다.

---

## 프로젝트 구조 (Expo Router 기반)

```
{project-root}/
├── app/                        # Expo Router — 파일 기반 라우팅
│   ├── _layout.tsx             #   루트 레이아웃 (네비게이션 설정)
│   ├── index.tsx               #   홈 화면
│   ├── (auth)/                 #   인증 관련 그룹
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 #   탭 네비게이션 그룹
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── schedule.tsx
│   │   └── profile.tsx
│   └── club/
│       └── [id].tsx            #   동적 라우트
├── src/
│   ├── features/               # 기능별 폴더 (typescript.md 참조)
│   │   ├── auth/
│   │   ├── club/
│   │   ├── schedule/
│   │   └── member/
│   ├── shared/
│   │   ├── components/         # 공유 UI 컴포넌트
│   │   ├── hooks/              # 공유 훅
│   │   ├── utils/              # 공유 유틸리티
│   │   ├── constants/          # 공유 상수
│   │   ├── types/              # 공유 타입
│   │   └── styles/             # 공유 스타일 (테마, 색상, 타이포그래피)
│   ├── services/               # 외부 서비스 연동 (API, 푸시 등)
│   └── config/                 # 앱 설정
├── assets/                     # 이미지, 폰트 등 정적 리소스
├── app.json                    # Expo 설정
├── app.config.ts               # Expo 동적 설정 (환경변수 활용 시)
├── babel.config.js
├── tsconfig.json
└── package.json
```

- `app/`: Expo Router 전용 — 라우팅(화면 정의)만 담당. 비즈니스 로직 넣지 않음
- `src/features/`: 각 기능의 컴포넌트, 훅, 타입, 유틸 — co-location 원칙
- `src/shared/`: 2개 이상 기능에서 공유하는 것만 여기에
- 컴포넌트가 1개 기능에서만 사용되면 `shared/`가 아닌 해당 `features/` 안에 배치

---

## 네이밍 컨벤션

> TypeScript 기본 네이밍은 `typescript.md` 참조. 여기서는 React Native 특화만.

| 종류 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 파일 | PascalCase | `ScheduleCard.tsx`, `MemberList.tsx` |
| 화면(스크린) 파일 | kebab-case (Expo Router) | `app/club/[id].tsx`, `app/(tabs)/schedule.tsx` |
| 훅 파일 | camelCase with `use` | `useAuth.ts`, `useClubMembers.ts` |
| 스타일 | camelCase | `containerStyle`, `headerWrapper` |
| 테스트 | 소스파일명 + `.test` | `ScheduleCard.test.tsx` |
| 이미지 에셋 | kebab-case | `club-logo.png`, `default-avatar.png` |

### 컴포넌트 네이밍 규칙

```typescript
// 컴포넌트: PascalCase, 역할이 드러나는 이름
export function ScheduleCard({ event }: ScheduleCardProps) { ... }
export function MemberListItem({ member }: MemberListItemProps) { ... }
export function EmptyScheduleView() { ... }

// 화면: ~Screen 접미어 (선택, 프로젝트에서 통일)
export default function ScheduleScreen() { ... }
export default function ClubDetailScreen() { ... }

// 레이아웃: ~Layout
export default function TabLayout() { ... }
export default function AuthLayout() { ... }
```

---

## 코드 포맷팅

> TypeScript 기본 포맷팅(`typescript.md`)을 따르되, 아래 React Native 특화 규칙을 추가 적용.

- JSX 속성이 3개 초과 시 줄바꿈
- JSX 내 삼항 연산자는 간단한 경우만 인라인, 복잡하면 변수로 추출
- `style` prop에 인라인 객체 사용 지양 → `StyleSheet.create` 또는 NativeWind 클래스

```typescript
// Good: 속성이 많으면 줄바꿈
<ScheduleCard
  event={event}
  onPress={handlePress}
  isAttending={isAttending}
  showBadge={true}
/>

// Bad: 한 줄에 다 넣기
<ScheduleCard event={event} onPress={handlePress} isAttending={isAttending} showBadge={true} />
```

---

## import/export 규칙

> TypeScript 기본 import 순서(`typescript.md`)를 따르되, React Native 특화 순서:

```typescript
// 1. React / React Native 코어
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, FlatList, Platform } from 'react-native';

// 2. Expo SDK
import * as Notifications from 'expo-notifications';
import { Image } from 'expo-image';

// 3. 외부 라이브러리
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

// 4. 내부 절대 경로
import { useAuth } from '@/features/auth';
import { colors, spacing } from '@/shared/styles/theme';

// 5. 상대 경로
import { ScheduleCard } from './components/ScheduleCard';
import type { ScheduleEvent } from './types';
```

---

## 파일 내부 코드 순서 (컴포넌트 파일)

```typescript
// 1. import 문

// 2. 타입 정의 (Props, 내부 타입)

// 3. 상수

// 4. 메인 컴포넌트
export function ScheduleCard({ event, onPress }: ScheduleCardProps) {
  // 4-1. 훅 (useState, useCallback, useMemo, 커스텀 훅)
  // 4-2. 파생 값 (computed values)
  // 4-3. 이벤트 핸들러
  // 4-4. 부수 효과 (useEffect) — 최소화
  // 4-5. 조기 반환 (로딩, 에러, 빈 상태)
  // 4-6. JSX 반환
}

// 5. 하위 컴포넌트 (이 파일 내에서만 사용)

// 6. 스타일 (StyleSheet.create 또는 NativeWind)
```

---

## 컴포넌트 설계 패턴

### 기본 컴포넌트

```typescript
interface ScheduleCardProps {
  event: ScheduleEvent;
  onPress: (eventId: string) => void;
  isAttending?: boolean;
}

export function ScheduleCard({ event, onPress, isAttending = false }: ScheduleCardProps) {
  const handlePress = useCallback(() => {
    onPress(event.id);
  }, [event.id, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.time}>{event.time}</Text>
      <Text style={styles.place}>{event.court}</Text>
      {isAttending && <Badge text="참석중" variant="success" />}
    </Pressable>
  );
}
```

### 컴포넌트 분리 기준

- **100줄 초과** → 하위 컴포넌트로 분리
- **재사용 가능** → `shared/components/`로 이동
- **조건부 렌더링이 복잡** → 별도 컴포넌트로 추출
- **리스트 아이템** → 반드시 별도 컴포넌트 (memo 적용 위해)

### 합성(Composition) 패턴

```typescript
// Good: 합성으로 유연한 구조
<Card>
  <Card.Header title="일정 상세" />
  <Card.Body>
    <EventInfo event={event} />
  </Card.Body>
  <Card.Footer>
    <AttendButton onPress={handleAttend} />
  </Card.Footer>
</Card>

// Bad: 하나의 거대한 컴포넌트에 모든 prop
<EventDetailCard
  title="일정 상세"
  event={event}
  onAttend={handleAttend}
  showHeader={true}
  showFooter={true}
  footerVariant="attend"
  // ... 20개 props
/>
```

### 조건부 렌더링

```typescript
// Good: early return으로 상태별 처리
export function ScheduleScreen() {
  const { data, isLoading, error } = useScheduleEvents();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} onRetry={refetch} />;
  if (!data?.length) return <EmptyScheduleView />;

  return <ScheduleList events={data} />;
}

// Bad: JSX 내 복잡한 중첩 삼항
return (
  <View>
    {isLoading ? <Spinner /> : error ? <Error /> : data ? <List /> : <Empty />}
  </View>
);
```

---

## 훅(Hooks) 규칙

### 기본 규칙
- 훅은 컴포넌트/훅의 **최상위**에서만 호출 (조건문/루프 안 금지)
- 커스텀 훅은 `use` 접두어 필수
- 하나의 훅은 **하나의 관심사**만 담당
- 훅이 3개 이상의 상태를 관리하면 커스텀 훅으로 추출

### useState

```typescript
// Good: 관련 상태는 객체로 묶기
const [form, setForm] = useState<CreateEventForm>({
  date: '',
  court: '',
  maxParticipants: 8,
  fee: 0,
});

// Bad: 관련 상태를 개별로 선언
const [date, setDate] = useState('');
const [court, setCourt] = useState('');
const [maxParticipants, setMaxParticipants] = useState(8);
const [fee, setFee] = useState(0);
```

### useEffect

```typescript
// useEffect는 최소화 — 꼭 필요한 경우만
// 데이터 fetching → useEffect 대신 react-query 사용
// 이벤트 구독 → useEffect OK (cleanup 필수)
// 파생 값 계산 → useEffect 대신 useMemo 또는 렌더링 중 계산

// Good: cleanup 포함
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(handleNotification);
  return () => subscription.remove();
}, []);

// Bad: cleanup 누락 (메모리 릭)
useEffect(() => {
  Notifications.addNotificationReceivedListener(handleNotification);
}, []);

// Bad: 데이터 fetching을 useEffect로
useEffect(() => {
  fetchEvents().then(setEvents);
}, []);
// → react-query의 useQuery로 대체
```

### useCallback / useMemo

```typescript
// useCallback: 자식 컴포넌트에 전달하는 콜백에만 (memo와 함께)
const handlePress = useCallback((id: string) => {
  router.push(`/event/${id}`);
}, [router]);

// useMemo: 비용이 큰 계산에만
const sortedEvents = useMemo(
  () => events.sort((a, b) => a.date.localeCompare(b.date)),
  [events],
);

// Bad: 모든 곳에 useCallback/useMemo 남용 — 오히려 성능 저하
const handlePress = useCallback(() => { ... }, []); // memo된 자식이 없으면 불필요
```

### 커스텀 훅 패턴

```typescript
// Good: 하나의 관심사, 명확한 반환 타입
function useClubMembers(clubId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['club-members', clubId],
    queryFn: () => fetchClubMembers(clubId),
    enabled: !!clubId,
  });

  return {
    members: data ?? [],
    isLoading,
    error,
    refetch,
  } as const;
}

// Good: 비즈니스 로직 캡슐화
function useAttendEvent() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: attendEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      showToast('참석 완료!');
    },
    onError: (error) => {
      showToast(error instanceof AppError ? error.userMessage : '참석 실패');
    },
  });

  return { attend: mutate, isAttending: isPending };
}
```

---

## 네비게이션 (Expo Router)

```typescript
// 타입 안전한 네비게이션
import { useRouter, useLocalSearchParams } from 'expo-router';

// 화면 이동
const router = useRouter();
router.push('/club/123');           // push
router.replace('/login');           // replace (뒤로가기 불가)
router.back();                      // 뒤로가기

// 파라미터 받기
const { id } = useLocalSearchParams<{ id: string }>();

// 딥링크 대응: app/ 폴더 구조 = URL 구조
// app/club/[id].tsx → /club/123
// app/(tabs)/schedule.tsx → /schedule
```

### 네비게이션 규칙

- 화면 컴포넌트에서만 `useRouter` 사용 — 하위 컴포넌트는 `onPress` 콜백으로 전달
- 딥링크를 고려한 라우트 설계 (의미 있는 URL 구조)
- 인증 필요 화면은 `_layout.tsx`에서 가드 처리
- 화면 전환 시 과도한 데이터를 파라미터로 넘기지 않기 — ID만 넘기고 화면에서 fetch

---

## 스타일링 (NativeWind / Tailwind)

### NativeWind 기본 규칙

```typescript
// Good: NativeWind 클래스로 스타일링
<View className="flex-1 bg-white px-4 py-6">
  <Text className="text-lg font-bold text-gray-900">일정 관리</Text>
  <Text className="text-sm text-gray-500 mt-1">TenniSweet</Text>
</View>

// 조건부 스타일
<Pressable
  className={`rounded-xl p-4 border ${
    isAttending ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
  }`}
>

// Bad: 인라인 style 객체
<View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 16 }}>
```

### 스타일 규칙

- NativeWind(Tailwind) 클래스를 기본으로 사용
- 복잡한 동적 스타일만 `StyleSheet.create` 사용
- 색상, 간격, 폰트 사이즈는 **테마 토큰** 사용 (하드코딩 금지)
- 반응형: 모바일 기본 → 태블릿/웹은 `md:`, `lg:` 접두어

### 테마/디자인 토큰

```typescript
// shared/styles/theme.ts
export const colors = {
  primary: '#2e7d32',
  primaryDark: '#1b5e20',
  error: '#e53935',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    500: '#9e9e9e',
    900: '#212121',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
```

- 색상 값을 컴포넌트에 직접 쓰지 않는다 → 테마 토큰 참조
- NativeWind 사용 시 `tailwind.config.js`에서 테마 확장

### 접근성 (a11y)

- 모든 터치 영역: 최소 44x44pt (Apple HIG 기준)
- `Pressable`에 `accessibilityLabel` 필수 (아이콘 버튼, 이미지 버튼)
- 색상만으로 정보를 전달하지 않는다 (색각 이상 사용자 고려)
- `accessibilityRole` 적절히 설정 (`button`, `link`, `header` 등)

---

## 리스트 최적화

```typescript
// FlashList (대용량 리스트에 최적)
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={events}
  renderItem={({ item }) => <EventCard event={item} />}
  estimatedItemSize={80}           // 필수: 대략적 아이템 높이
  keyExtractor={(item) => item.id} // 고유 키
/>

// 리스트 아이템은 반드시 memo
const EventCard = React.memo(function EventCard({ event }: EventCardProps) {
  return ( ... );
});
```

### 리스트 규칙

- 10개 이상 아이템: `FlatList` 또는 `FlashList` 필수 (`ScrollView` + `.map()` 금지)
- 리스트 아이템 컴포넌트: `React.memo` 적용
- `keyExtractor`: 고유한 ID 사용 (index 사용 금지)
- 무한 스크롤: `onEndReached` + `onEndReachedThreshold`
- 이미지 리스트: `expo-image`의 캐싱 활용

---

## 안티패턴 (하지 말 것)

### React Native 특화

| 안티패턴 | 이유 | 대안 |
|---------|------|------|
| `ScrollView` + `.map()`으로 긴 리스트 | 모든 아이템 한번에 렌더 → 메모리 폭발 | `FlatList` 또는 `FlashList` |
| 인라인 `style={{}}` 객체 | 매 렌더마다 새 객체 → 불필요한 리렌더 | `StyleSheet.create` 또는 NativeWind |
| 인라인 `onPress={() => {}}` 콜백 | 매 렌더마다 새 함수 → memo 무력화 | `useCallback` + 별도 핸들러 |
| `useEffect`로 데이터 fetching | 로딩/에러/캐싱 직접 관리 → 버그 천국 | `@tanstack/react-query` |
| `Image` (React Native 기본) | 캐싱 없음, 성능 나쁨 | `expo-image` |
| `TouchableOpacity` | deprecated 추세, 커스터마이징 제한 | `Pressable` |
| `Dimensions.get()` 직접 사용 | 회전/리사이즈 미대응 | `useWindowDimensions` |
| `AsyncStorage` 대용량 데이터 | 느림, 동기화 어려움 | Supabase 또는 MMKV |
| 화면 컴포넌트에 비즈니스 로직 | 테스트 어려움, 재사용 불가 | 커스텀 훅으로 분리 |
| 앱 전체에 Context 남용 | 불필요한 리렌더 전파 | zustand 또는 react-query |

### AI가 흔히 생성하는 실수

| 실수 | 수정 방법 |
|------|----------|
| `<View>` 안에 텍스트 직접 넣기 | 반드시 `<Text>` 감싸기 (RN 규칙) |
| 웹 HTML 태그 사용 (`<div>`, `<span>`) | `<View>`, `<Text>` 사용 |
| CSS 속성 그대로 사용 (`background-color`) | camelCase (`backgroundColor`) 또는 NativeWind |
| `onClick` 사용 | `onPress` 사용 |
| `className` (순수 RN에서) | NativeWind 설정 없이 사용 불가 — 설정 확인 |
| 웹 전용 API 사용 (`window`, `document`) | React Native API 또는 `Platform.select` |
| `useEffect` 내 직접 async | 내부에 별도 함수 정의 후 호출 |
| FlatList에 `key={index}` | 고유 ID 사용 |
| `console.log` 남기기 | 프로덕션 로거 사용 또는 제거 |
| `expo install` 대신 `npm install` | Expo SDK 호환 버전 보장을 위해 `npx expo install` 사용 |

---

## Null/빈 상태 처리

- 모든 화면에 **4가지 상태**를 처리한다: 로딩 / 에러 / 빈 데이터 / 정상
- 빈 상태에 의미 있는 메시지 + CTA(Call to Action) 버튼 제공
- 에러 상태에 재시도 버튼 제공
- 스켈레톤 UI로 로딩 상태를 부드럽게 처리

```typescript
// 공통 상태 처리 패턴
function useAsyncScreen<T>(queryResult: UseQueryResult<T>) {
  const { data, isLoading, error, refetch } = queryResult;

  if (isLoading) return { status: 'loading' as const };
  if (error) return { status: 'error' as const, error, refetch };
  if (!data) return { status: 'empty' as const };
  return { status: 'success' as const, data };
}
```

---

## 비동기 처리

> TypeScript 기본 비동기 규칙(`typescript.md`)을 따르되, React Native 특화:

- **데이터 fetching**: `useEffect` 대신 **react-query** 사용 (캐싱, 재시도, 무효화 자동)
- **mutation**: `useMutation` 사용 (낙관적 업데이트, 에러 롤백)
- **백그라운드 작업**: 앱이 백그라운드에 갈 때 작업 정리 (`AppState` 이벤트)
- **네트워크 상태**: `@react-native-community/netinfo`로 오프라인 감지

```typescript
// Good: react-query로 데이터 관리
const { data: events, isLoading } = useQuery({
  queryKey: ['events', clubId],
  queryFn: () => fetchEvents(clubId),
  staleTime: 5 * 60 * 1000, // 5분 캐싱
});

// Good: 낙관적 업데이트 (참석 버튼)
const { mutate: attend } = useMutation({
  mutationFn: attendEvent,
  onMutate: async (eventId) => {
    await queryClient.cancelQueries({ queryKey: ['events'] });
    const previous = queryClient.getQueryData(['events']);
    queryClient.setQueryData(['events'], (old) =>
      old?.map(e => e.id === eventId ? { ...e, isAttending: true } : e)
    );
    return { previous };
  },
  onError: (err, eventId, context) => {
    queryClient.setQueryData(['events'], context?.previous); // 롤백
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  },
});
```

---

## 에러/예외 처리

> TypeScript 기본 에러 처리(`typescript.md`)를 따르되, React Native 특화:

- **Error Boundary**: 화면 단위로 Error Boundary 적용 (앱 전체 크래시 방지)
- **네트워크 에러**: 오프라인 감지 + 재시도 UI
- **API 에러**: 사용자 친화적 메시지로 변환 (내부 에러 메시지 노출 금지)
- **Crash Reporting**: Sentry 또는 Expo Updates의 에러 리포팅 연동

```typescript
// Error Boundary (클래스 컴포넌트 필수)
class ScreenErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.reset} />;
    }
    return this.props.children;
  }
}
```

---

## 보안

> TypeScript 기본 보안(`typescript.md`)을 따르되, React Native 특화:

- **토큰 저장**: `expo-secure-store` 사용 (AsyncStorage에 토큰 저장 금지)
- **API 키**: 앱 번들에 포함 금지 → 백엔드 프록시 또는 환경 변수 (expo-constants)
- **딥링크 검증**: 외부에서 들어오는 딥링크 파라미터 반드시 검증
- **인증 상태**: 앱 복귀 시(AppState active) 토큰 유효성 재확인
- **화면 캡처 방지**: 민감 정보 화면에서 `preventScreenCapture` (expo-screen-capture)
- **코드 난독화**: EAS Build 릴리즈 모드에서 자동 적용 (Hermes)

---

## 성능 최적화

### 렌더링
- 리스트 아이템: `React.memo` 필수
- 무거운 계산: `useMemo` (측정 후 적용)
- 콜백 안정성: `useCallback` (memo된 자식에 전달 시)
- 인라인 객체/함수 생성 지양 (렌더 루프 내)
- `console.log` 프로덕션 제거 (Hermes에서 성능 영향)

### 이미지
- `expo-image` 사용 (내장 캐싱, 블러 해시, 트랜지션)
- 적절한 사이즈로 리사이즈 (원본 4K 이미지 직접 사용 금지)
- 리스트 내 이미지: `recyclingKey` 활용

### 앱 시작
- 앱 시작 시 불필요한 작업 지연 (lazy initialization)
- 스플래시 스크린 활용: `expo-splash-screen`으로 초기 로드 동안 표시
- 초기 화면에 필요한 데이터만 먼저 fetch

### 번들
- `npx expo install`로 호환 버전 관리
- 사용하지 않는 라이브러리 정리
- Hermes 엔진 사용 (Expo 기본값) — 앱 시작 시간 + 메모리 개선

---

## 푸시 알림 (expo-notifications)

```typescript
// 알림 권한 요청
async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 알림 토큰 가져오기 (FCM)
async function getPushToken(): Promise<string | null> {
  const permission = await requestNotificationPermission();
  if (!permission) return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  return token.data;
}

// 알림 수신 리스너 (앱 포그라운드)
useEffect(() => {
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      // 앱이 열려있을 때 알림 처리
    },
  );
  return () => subscription.remove();
}, []);

// 알림 탭 리스너 (알림 탭하여 앱 진입)
useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      // 딥링크 처리 (예: 해당 일정 화면으로 이동)
      if (data.eventId) router.push(`/event/${data.eventId}`);
    },
  );
  return () => subscription.remove();
}, []);
```

---

## 플랫폼 분기

```typescript
import { Platform } from 'react-native';

// 간단한 분기
const paddingTop = Platform.OS === 'ios' ? 44 : 0;

// Platform.select
const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  default: {}, // 웹
});

// 플랫폼별 파일 (복잡한 경우)
// DatePicker.ios.tsx / DatePicker.android.tsx / DatePicker.web.tsx
```

---

## 테스트

- 컴포넌트 테스트: `@testing-library/react-native`
- 훅 테스트: `@testing-library/react-hooks` 또는 `renderHook`
- 네비게이션 테스트: Expo Router mock
- 스냅샷 테스트: 디자인 변경 감지용 (과용 금지)

```typescript
import { render, fireEvent, screen } from '@testing-library/react-native';

describe('ScheduleCard', () => {
  it('이벤트 정보를 올바르게 표시한다', () => {
    render(<ScheduleCard event={mockEvent} onPress={jest.fn()} />);

    expect(screen.getByText('19:00-21:00')).toBeTruthy();
    expect(screen.getByText('강남 3코트')).toBeTruthy();
  });

  it('카드를 탭하면 onPress가 호출된다', () => {
    const onPress = jest.fn();
    render(<ScheduleCard event={mockEvent} onPress={onPress} />);

    fireEvent.press(screen.getByText('강남 3코트'));
    expect(onPress).toHaveBeenCalledWith(mockEvent.id);
  });
});
```

---

## 문서화 규칙

> TypeScript 기본 문서화(`typescript.md`)를 따르되, React Native 특화 규칙 추가.

### 화면(Screen) 컴포넌트

```typescript
// Good: 화면 역할을 한 줄로 설명
/** 동호회의 월별 일정을 캘린더로 표시하고, 참석/대기 신청을 처리하는 화면 */
export default function ScheduleScreen() { ... }

// Bad: 없거나 너무 장황
export default function ScheduleScreen() { ... }
```

### 커스텀 훅

```typescript
// Good: 복잡한 훅은 사용 예시 포함
/**
 * 동호회 멤버 목록을 관리하는 훅.
 *
 * @example
 * const { members, isLoading, approveMember } = useClubMembers('club-123');
 */
function useClubMembers(clubId: string) { ... }

// Bad: 이름만으로 충분히 명확한데 불필요한 주석
/** 인증 훅 */
function useAuth() { ... }
```

### 공유 컴포넌트

```typescript
// Good: 복잡한 Props에 설명 추가
interface DatePickerProps {
  /** 선택된 날짜 (ISO 8601 형식: "2026-03-25") */
  value: string;
  /** 날짜 변경 콜백 — ISO 문자열을 반환 */
  onChange: (date: string) => void;
  /** 선택 가능한 최소 날짜. 기본값: 오늘 */
  minDate?: string;
  /** 선택 가능한 최대 날짜. 기본값: 제한 없음 */
  maxDate?: string;
}

// Bad: 타입만으로 충분한데 모든 prop에 주석
interface ButtonProps {
  /** 버튼 텍스트 */
  title: string;  // title: string 자체로 충분
  /** 클릭 핸들러 */
  onPress: () => void;  // onPress만으로 충분
}
```

### 주석이 필요 없는 경우 (쓰지 마라)

```typescript
// Bad: 코드가 이미 설명하는 것을 반복
// 로딩 중이면 스피너 표시
if (isLoading) return <LoadingSpinner />;

// Bad: 누가 봐도 아는 것
const [isVisible, setIsVisible] = useState(false); // 표시 여부 상태

// Good: 비직관적 로직에만 Why 설명
// iOS 16.4 미만에서는 PWA 푸시가 지원되지 않아 인앱 알림으로 폴백
if (Platform.OS === 'web' && !isPushSupported) {
  showInAppNotification(message);
}
```

---

## 빌드 & 설정

### app.json / app.config.ts 필수 설정

```json
{
  "expo": {
    "scheme": "allclub",
    "plugins": [
      "expo-router",
      "expo-notifications",
      "expo-secure-store"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.example.allclub"
    },
    "android": {
      "adaptiveIcon": { "foregroundImage": "./assets/icon.png" },
      "package": "com.example.allclub"
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

### EAS Build 설정 (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

---

## 자주 쓰는 라이브러리/도구

### 권장

| 용도 | 라이브러리 | 이유 |
|------|-----------|------|
| 라우팅 | **expo-router** | 파일 기반 라우팅, 딥링크 자동, 웹 호환 |
| 서버 상태 | **@tanstack/react-query** | 캐싱, 재시도, 무효화, 낙관적 업데이트 |
| 클라이언트 상태 | **zustand** | 간단, 보일러플레이트 최소, 셀렉터 지원 |
| 스타일링 | **NativeWind** | Tailwind 문법, 웹/네이티브 통일 |
| 이미지 | **expo-image** | 캐싱, 블러 해시, 트랜지션 |
| 리스트 | **@shopify/flash-list** | FlatList보다 5배 빠름 |
| 알림 | **expo-notifications** | FCM/APNs 통합, 로컬 알림 |
| 보안 저장 | **expo-secure-store** | iOS Keychain / Android Keystore |
| 폼 | **react-hook-form** + **zod** | 성능 최적, 타입 안전 검증 |
| 날짜 | **date-fns** | 경량, tree-shaking |
| 토스트 | **react-native-toast-message** 또는 **burnt** | 네이티브 느낌 알림 |
| 아이콘 | **@expo/vector-icons** | Expo 기본 포함, 수천 개 아이콘 |

### 피해야 할 것

| 라이브러리 | 이유 | 대안 |
|-----------|------|------|
| `react-native-image` (기본) | 캐싱 없음, 성능 나쁨 | `expo-image` |
| `TouchableOpacity` | deprecated 추세 | `Pressable` |
| `AsyncStorage` (토큰 저장) | 암호화 안 됨 | `expo-secure-store` |
| `react-navigation` (직접) | Expo Router가 감싸서 제공 | `expo-router` |
| `moment.js` | deprecated, 거대 번들 | `date-fns`, `dayjs` |
| `redux` (소규모 앱) | 과도한 보일러플레이트 | `zustand` |
| `axios` | 대부분 과도함 | `fetch` + react-query |

---

## 프로젝트별 확장 포인트

> 아래 항목들은 프로젝트마다 다르므로 `/CLAUDE.md`에서 정의합니다:
> - 앱 이름, 번들 ID, 스킴
> - 프로젝트 구조 상세
> - 빌드/실행 명령 (`npx expo start`, `eas build`)
> - EAS 프로젝트 ID
> - 환경 변수 목록
> - 배포 전략 (EAS Update, 스토어 등)
> - 외부 서비스 연동 (Supabase, FCM 등)
> - 디자인 시스템 (색상, 폰트, 간격 토큰)
> - 앱 아이콘, 스플래시 스크린 설정
