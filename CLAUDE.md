# CrewUp — 테니스 동호회 관리 플랫폼

## 프로젝트 개요
- 목적: 동호회 운영자가 동호회를 만들고 관리하며, 일반인이 동호회를 찾아 가입할 수 있는 플랫폼
- 유형: 모바일 퍼스트 웹앱 (PWA → 네이티브 앱 전환 예정)
- MVP 범위: 테니스 동호회 관리 (일정, 멤버, 알림, 참석)
- 상세 요구사항/장기 목표: `docs/prd.md`에 정의 — CLAUDE.md는 기술 정의에 집중

## 비전 & 확장 계획
- **Phase 1 (MVP)**: 테니스 동호회 관리 — 일정/멤버/알림/참석
- **Phase 2**: 결제 시스템 — 참석비, 노쇼비, 회비 충전/출금 (토스페이먼츠)
- **Phase 3**: 다종목 동호회 플랫폼 — 축구, 골프, 배드민턴 등 스포츠 종목 확장
- **Phase 4**: 범용 커뮤니티 — 동호회 외 개인 유저(인력시장 300~400명 규모), 지역/목적별 분류, 구독 모델

> **설계 원칙**: MVP는 테니스에 집중하되, 데이터 모델과 코드 구조는 처음부터 종목/지역/카테고리 확장이 가능하도록 설계한다. "tennis"를 하드코딩하지 않는다.

## 기술 스택
- 언어: TypeScript (Strict Mode)
- 프레임워크: React Native (Expo SDK 52+)
- 라우팅: Expo Router (파일 기반)
- 백엔드/DB: Supabase (PostgreSQL + Auth + Realtime + Storage)
- 상태 관리: Zustand (클라이언트) + @tanstack/react-query (서버)
- 스타일링: NativeWind (Tailwind CSS for React Native)
- 알림: expo-notifications (FCM) + Supabase Realtime
- 소셜 로그인: 카카오 + 네이버 (Supabase Auth)
- 폼 검증: react-hook-form + zod
- 리스트: @shopify/flash-list
- 이미지: expo-image

## 적용되는 규칙 파일
- `.claude/rules/typescript.md` — TypeScript 시니어 규칙
- `.claude/rules/react-native.md` — React Native + Expo 시니어 규칙
- `.claude/rules/supabase.md` — Supabase 시니어 규칙
- `.claude/rules/sprint-workflow.md` — 스프린트 워크플로우

## 프로젝트 구조

```
CrewUp/
├── app/                          # Expo Router — 파일 기반 라우팅
│   ├── _layout.tsx               #   루트 레이아웃 (Provider 설정)
│   ├── index.tsx                 #   진입점 (스플래시 → 로그인/홈 분기)
│   ├── (auth)/                   #   인증 플로우
│   │   ├── _layout.tsx
│   │   ├── login.tsx             #     소셜 로그인 (카카오/네이버)
│   │   └── onboarding.tsx        #     최초 가입 시 프로필 설정
│   ├── (tabs)/                   #   메인 탭 네비게이션
│   │   ├── _layout.tsx
│   │   ├── home.tsx              #     동호회 탐색/검색 (비회원도 접근 가능)
│   │   ├── my-clubs.tsx          #     내 동호회 목록 (가입된 동호회들)
│   │   ├── notifications.tsx     #     알림 목록
│   │   └── profile.tsx           #     내 프로필
│   └── club/
│       ├── [id]/
│       │   ├── _layout.tsx       #     동호회 내부 (회원만 접근 — RLS)
│       │   ├── schedule.tsx      #     일정 관리 (캘린더)
│       │   ├── members.tsx       #     멤버 목록 (회원 공통)
│       │   ├── stats.tsx         #     통계 (회원 공통)
│       │   └── manage.tsx        #     동호회 관리 (클럽장/운영진 전용)
│       ├── [id]/join.tsx         #     가입 신청 페이지 (비회원)
│       └── create.tsx            #     동호회 생성
├── src/
│   ├── features/                 # 기능별 폴더
│   │   ├── auth/                 #   인증 (소셜 로그인, 세션)
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── components/
│   │   │   └── types.ts
│   │   ├── club/                 #   동호회 (생성, 목록, 상세, 가입)
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── types.ts
│   │   ├── schedule/             #   일정 (캘린더, 생성, 상세, 참석)
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── types.ts
│   │   ├── member/               #   멤버 (목록, 가입 승인, 역할)
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── types.ts
│   │   ├── notification/         #   알림 (푸시, 인앱)
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── types.ts
│   │   └── stats/                #   통계 (승률, 랭킹, 파트너 궁합)
│   │       ├── hooks/
│   │       ├── components/
│   │       └── types.ts
│   ├── shared/                   # 공유 모듈
│   │   ├── components/           #   공통 UI (Button, Card, Badge, Modal, Toast 등)
│   │   ├── hooks/                #   공통 훅 (useToast, useNetworkStatus 등)
│   │   ├── utils/                #   공통 유틸 (formatDate, formatPrice 등)
│   │   ├── constants/            #   전역 상수
│   │   ├── types/                #   전역 타입
│   │   └── styles/               #   테마, 색상, 타이포그래피
│   │       └── theme.ts
│   ├── services/                 # 외부 서비스 연동
│   │   └── supabase/
│   │       ├── client.ts         #   Supabase 클라이언트 (싱글톤)
│   │       ├── types.ts          #   DB 타입 (supabase gen types)
│   │       ├── auth.ts           #   인증 함수
│   │       ├── database.ts       #   DB 쿼리 함수
│   │       ├── realtime.ts       #   Realtime 구독
│   │       ├── storage.ts        #   파일 업로드/다운로드
│   │       └── index.ts
│   └── config/                   # 앱 설정
│       └── env.ts                #   환경 변수 타입 정의
├── supabase/                     # Supabase 로컬 설정
│   ├── migrations/               #   스키마 마이그레이션
│   ├── seed.sql                  #   초기 데이터 (개발용)
│   ├── config.toml               #   로컬 개발 설정
│   └── functions/                #   Edge Functions
├── assets/                       # 정적 리소스 (아이콘, 이미지, 폰트)
├── CLAUDE.md                     # 이 파일
├── ROADMAP.md                    # 프로젝트 로드맵
├── deploy.md                     # 배포 기록
├── docs/                         # 프로젝트 문서
│   ├── prd.md                    #   요구사항 정의서
│   ├── phase/                    #   Phase 계획서
│   ├── sprint/                   #   Sprint 명세서
│   └── mockup/                   #   기존 HTML 목업 (참고용)
├── app.json                      # Expo 설정
├── app.config.ts                 # Expo 동적 설정
├── tsconfig.json
├── tailwind.config.js            # NativeWind/Tailwind 설정
├── package.json
└── .claude/                      # AI 개발 프레임워크
```

## 빌드 & 실행

### 개발 서버 실행
```bash
npx expo start
```

### 웹 실행
```bash
npx expo start --web
```

### 린트
```bash
npx expo lint
```

### 타입 체크
```bash
npx tsc --noEmit
```

### Supabase 로컬 개발
```bash
npx supabase start           # 로컬 Supabase 시작
npx supabase db reset         # 마이그레이션 + 시드 적용
npx supabase gen types typescript --local > src/services/supabase/types.ts  # 타입 생성
```

### 앱 빌드 (EAS)
```bash
eas build --platform android --profile preview   # Android 프리뷰
eas build --platform ios --profile preview        # iOS 프리뷰
eas build --platform all --profile production     # 프로덕션
```

## 브랜치 전략
- 메인 브랜치: `main`
- 개발 브랜치: `develop`
- 작업 브랜치: `sprint{N}` / `feature/*` / `hotfix/*` → develop으로 PR
- 릴리즈: develop → main 병합 (사용자 직접 수행)

## 배포
- **웹 (MVP)**: Vercel (Expo 웹 빌드 배포)
- **Android**: EAS Build → Google Play (유저 확보 후)
- **iOS**: EAS Build → App Store (유저 확보 후)
- **Supabase**: Supabase Cloud (무료 티어 → Pro 전환)

## 환경 변수

```
EXPO_PUBLIC_SUPABASE_URL=         # Supabase 프로젝트 URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon 키 (클라이언트용)
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service_role 키 (서버 전용, EXPO_PUBLIC 접두어 금지)
```

## 코드 컨벤션
- TypeScript Strict Mode 필수
- 네이밍: `rules/typescript.md` + `rules/react-native.md` 참조
- 컴포넌트: 함수형 컴포넌트 + 훅 (클래스 컴포넌트 사용 금지, Error Boundary 제외)
- 스타일: NativeWind(Tailwind) 우선, 복잡한 동적 스타일만 StyleSheet
- 커밋 메시지: Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- import 순서: `rules/react-native.md`의 import 규칙 참조

## 디자인 시스템

### 색상 (기존 목업 기반)
- Primary: `#2e7d32` (녹색 — 테니스/자연)
- Primary Dark: `#1b5e20`
- Error: `#e53935`
- Warning: `#f57c00`
- Info: `#1565c0`
- Background: `#f0f2f5`
- Surface: `#ffffff`
- Text Primary: `#333333`
- Text Secondary: `#777777`
- Border: `#e0e0e0`

### 타이포그래피
- 기본 폰트: 시스템 폰트 (Segoe UI / San Francisco / Roboto)
- 제목: 20-26px, bold
- 본문: 14-15px, regular
- 캡션: 11-13px, regular/medium

### 컴포넌트 기준
- 카드: 12px border-radius, 1px border, 24px padding
- 버튼: 20px border-radius (pill), 8-14px padding
- 뱃지: 10px border-radius, 1-6px padding
- 터치 영역: 최소 44x44pt

## 데이터 모델 (개요)

> **확장성 원칙**: 모든 테이블은 특정 종목에 종속되지 않도록 설계한다.
> 필드 상세는 `docs/prd.md`와 마이그레이션 파일에 정의한다.

### 핵심 테이블
- `profiles` — 사용자 프로필 (auth.users 확장)
- `sport_categories` — 종목 분류 (다종목 확장용)
- `clubs` — 동호회 (종목/지역/목적별 분류 지원)
- `club_members` — 동호회 멤버 (다중 동호회 가입 가능)
- `join_requests` — 가입 신청
- `schedule_events` — 일정 (범용 장소 필드, 종목 무관)
- `event_attendees` — 참석/대기
- `notifications` — 알림
- `venues` — 자주 쓰는 장소

### 관계
```
auth.users 1:1 profiles
sport_categories 1:N clubs
clubs 1:N club_members / schedule_events / join_requests / venues
schedule_events 1:N event_attendees
profiles 1:N notifications
```

### 설계 원칙
- 테이블명/컬럼명에 특정 종목 하드코딩 금지 ("court" X → "venue" O)
- 종목은 `sport_categories` FK로 참조
- 지역은 region/city/district 3단계 분류
- 상세 필드 정의: `docs/prd.md` 참조

## 기존 목업 참고

> **주의: 목업은 UI 느낌 참고용**이며, 기능 명세나 데이터 구조의 근거가 아닙니다.
> 실제 화면 설계는 PRD와 Sprint 명세서를 기준으로 합니다.

- `index.html` / `main.html` — 동호회 카드 레이아웃, 검색 UI 느낌
- `schedule.html` — 캘린더 레이아웃, 이벤트 카드 스타일 느낌
- `detail.html` — 일정 상세 카드, 참석자 목록 레이아웃 느낌
- `create.html` — 폼 UI, 토글, 정원 조절 UI 느낌
- `member.html` — 가입 대기/멤버 목록 레이아웃 느낌
- `stats.html` — 통계 카드, 차트, 랭킹 테이블 느낌
