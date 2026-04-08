# CrewUp

**동호회 관리 플랫폼** — 동호회를 만들고, 찾고, 가입하고, 체계적으로 관리하는 서비스

## 프로젝트 소개

CrewUp은 카카오톡 단톡방으로 비효율적으로 관리되는 동호회 운영을 체계화하는 플랫폼입니다.

- **운영자**: 일정 생성, 멤버 관리, 참석/대기 자동화, 통계
- **회원**: 알림으로 일정 확인, 원탭 참석, 승률/랭킹
- **일반인**: 동호회 탐색, 가입 신청

> MVP는 테니스 동호회에 집중하되, 다종목 확장이 가능한 구조로 설계되어 있습니다.

## 현재 상태

| 구분 | 상태 |
|------|------|
| Phase 0: 프로젝트 기반 | ✅ 완료 |
| Phase 1: 인증 시스템 | ✅ 완료 (Google/카카오 OAuth) |
| Phase 2: 동호회 관리 | 🔄 Sprint 2 완료, Sprint 3 예정 |
| 배포 | [crewup-eight.vercel.app](https://crewup-eight.vercel.app) |

### 구현된 기능

| 기능 | 상태 | 비고 |
|------|------|------|
| Google 소셜 로그인 | ✅ 동작 | PC + 모바일 브라우저 |
| 카카오 소셜 로그인 | ⚠️ 코드만 | Kakao Developers 키 미등록 |
| 네이버 소셜 로그인 | ❌ 미구현 | 출시 전 필수 |
| 온보딩 (프로필 설정) | ✅ 동작 | 닉네임, 활동 지역 |
| 프로필 수정 / 로그아웃 | ✅ 동작 | |
| 동호회 생성 | ✅ 동작 | 폼 검증 + DB 연동 |
| 동호회 목록 / 검색 | ✅ 동작 | 카드 그리드, 디바운스 검색 |
| 동호회 상세 (소개) | ✅ 동작 | 비회원용 공개 페이지 |
| 내 동호회 목록 | ✅ 동작 | 가입된 동호회 표시 |
| 가입 신청 / 멤버 관리 | ❌ 미구현 | Sprint 3 예정 |
| 일정 / 참석 시스템 | ❌ 미구현 | Phase 3 예정 |
| 알림 | ❌ 미구현 | Phase 4 예정 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | TypeScript, Expo (React Native + Web), Expo Router |
| Styling | NativeWind (Tailwind CSS) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| State | Zustand (클라이언트) + React Query (서버) |
| Form | react-hook-form + zod |
| Auth | Supabase Auth (Google, Kakao OAuth) |
| Deploy | Vercel (웹), Supabase Cloud (백엔드) |

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local에 Supabase URL, Anon Key 입력

# 개발 서버 실행 (웹)
npx expo start --web
```

### 환경 변수

`.env.local` 파일을 프로젝트 루트에 생성:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase (DB 마이그레이션)

```bash
# Supabase CLI 링크 (최초 1회)
npx supabase link --project-ref your-project-ref

# 마이그레이션 적용
npx supabase db push

# DB 타입 재생성
npx supabase gen types typescript --linked > src/services/supabase/types.ts
```

### 빌드 & 검증

```bash
# 타입 체크
npx tsc --noEmit

# 린트
npx expo lint

# 테스트
npx jest

# 웹 빌드 (Vercel 배포용)
npx expo export --platform web
```

## 프로젝트 구조

```
CrewUp/
├── app/              # Expo Router (파일 기반 라우팅)
│   ├── (auth)/       #   로그인, 온보딩
│   ├── (tabs)/       #   메인 탭 (홈, 내 동호회, 알림, 프로필)
│   └── club/         #   동호회 (생성, 상세)
├── src/
│   ├── features/     # 기능별 모듈 (auth, club)
│   ├── shared/       # 공통 컴포넌트, 훅, 유틸, 상수, 스타일
│   ├── services/     # Supabase 클라이언트, 쿼리 함수
│   └── config/       # 환경 변수
├── supabase/         # 마이그레이션, 시드 데이터, Edge Functions
├── assets/           # 이미지, 폰트
├── docs/             # PRD, Sprint 명세서, Backlog
├── .claude/          # AI 개발 프레임워크
├── CLAUDE.md         # 프로젝트 기술 정의
├── DESIGN.md         # 디자인 시스템 (Cal.com 기반)
└── ROADMAP.md        # 개발 로드맵 (Phase 0~10)
```

## 로드맵

| Phase | 목표 | 상태 |
|-------|------|------|
| Phase 0 | 프로젝트 기반 구축 | ✅ 완료 |
| Phase 1 | 인증 시스템 | ✅ 완료 |
| Phase 2 | 동호회 관리 | 🔄 진행 중 |
| Phase 3 | 일정 + 참석 + 자동 일정 등록 | 📋 예정 |
| Phase 4 | 알림 시스템 | 📋 예정 |
| Phase 5 | MVP 완성 + 웹 배포 | 📋 예정 |
| Phase 6 | 앱 스토어 출시 | ⏸️ 향후 |
| Phase 7 | 자동 일정 확장 (인기 테니스장 5곳) | ⏸️ 향후 |
| Phase 8 | 인력시장 (테니스 픽업 게임) | ⏸️ 향후 |
| Phase 9 | 결제 시스템 | ⏸️ 향후 |
| Phase 10 | 다종목 확장 | ⏸️ 향후 |
| Phase 11 | 지역 기반 + 커뮤니티 | ⏸️ 향후 |

자세한 내용은 [ROADMAP.md](ROADMAP.md) 참조

## 문서

| 문서 | 설명 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 프로젝트 기술 정의 (기술 스택, 구조, 빌드 명령) |
| [DESIGN.md](DESIGN.md) | 디자인 시스템 (Cal.com 기반 모노크롬) |
| [ROADMAP.md](ROADMAP.md) | 10 Phase 개발 로드맵 |
| [docs/prd.md](docs/prd.md) | 상세 요구사항 정의서 |
| [docs/backlog.md](docs/backlog.md) | Product Backlog (이슈 추적) |

## 라이선스

Private — 비공개 프로젝트
