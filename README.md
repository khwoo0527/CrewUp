# 🎾 CrewUp

**동호회 관리 플랫폼** — 동호회 운영자가 체계적으로 관리하고, 일반인이 동호회를 찾아 가입할 수 있는 서비스

## 프로젝트 소개

CrewUp은 카카오톡 단톡방으로 비효율적으로 관리되는 동호회 운영을 체계화하는 플랫폼입니다.

- **운영자**: 일정 생성, 멤버 관리, 참석/대기 자동화, 통계
- **회원**: 알림으로 일정 확인, 원탭 참석, 승률/랭킹
- **일반인**: 동호회 탐색, 가입 신청

> MVP는 테니스 동호회에 집중하되, 다종목 확장이 가능한 구조로 설계되어 있습니다.

## 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 소셜 로그인 | 카카오 / 네이버 간편 로그인 |
| 🏠 동호회 관리 | 생성, 탐색, 가입 신청/승인, 멤버/역할 관리 |
| 📅 일정 관리 | 캘린더 기반 일정 생성, 참석/대기 자동화 |
| 🔔 실시간 알림 | 새 일정, 변경, 취소, 승격 알림 (FCM 푸시) |
| 📊 통계 | 승률, 랭킹, 파트너 궁합, 참석률 |
| 📢 공지사항 | 동호회 공지 작성 + 알림 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | TypeScript, Expo (React Native + Web), Expo Router |
| Styling | NativeWind (Tailwind CSS) |
| Backend | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| State | Zustand (클라이언트) + React Query (서버) |
| Push | expo-notifications (FCM) |
| Auth | Supabase Auth (카카오, 네이버 OAuth) |

## 시작하기

### 사전 요구사항
- Node.js 18+
- npm 또는 yarn
- Supabase CLI (`npm install -g supabase`)

### 설치

```bash
# 의존성 설치
npm install

# Supabase 로컬 시작
npx supabase start

# DB 마이그레이션 적용
npx supabase db reset

# 개발 서버 실행
npx expo start
```

### 환경 변수

`.env.local` 파일을 프로젝트 루트에 생성:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=(npx supabase start 출력에서 확인)
```

## 실행

```bash
# 웹 (기본)
npx expo start --web

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android
```

## 프로젝트 구조

```
CrewUp/
├── app/              # Expo Router (파일 기반 라우팅)
├── src/
│   ├── features/     # 기능별 모듈 (auth, club, schedule, member, notification, stats)
│   ├── shared/       # 공통 컴포넌트, 훅, 유틸, 상수, 스타일
│   ├── services/     # 외부 서비스 연동 (Supabase)
│   └── config/       # 앱 설정
├── supabase/         # 마이그레이션, 시드 데이터, Edge Functions
├── assets/           # 이미지, 폰트
├── docs/             # PRD, Sprint 명세서
├── CLAUDE.md         # 프로젝트 기술 정의
└── ROADMAP.md        # 개발 로드맵
```

## 로드맵

| Phase | 목표 | 상태 |
|-------|------|------|
| Phase 0 | 프로젝트 기반 구축 | 📋 예정 |
| Phase 1 | 인증 시스템 | 📋 예정 |
| Phase 2 | 동호회 관리 | 📋 예정 |
| Phase 3 | 일정 + 참석 시스템 | 📋 예정 |
| Phase 4 | 알림 시스템 | 📋 예정 |
| Phase 5 | MVP 완성 + 웹 배포 | 📋 예정 |
| Phase 6 | 앱 스토어 출시 | ⏸️ 향후 |
| Phase 7 | 결제 시스템 | ⏸️ 향후 |
| Phase 8 | 다종목 확장 | ⏸️ 향후 |
| Phase 9 | 지역 기반 서비스 | ⏸️ 향후 |
| Phase 10 | 커뮤니티 플랫폼 | ⏸️ 향후 |

자세한 내용은 [ROADMAP.md](ROADMAP.md) 참조

## 문서

| 문서 | 설명 |
|------|------|
| [CLAUDE.md](CLAUDE.md) | 프로젝트 기술 정의 (기술 스택, 구조, 빌드 명령) |
| [ROADMAP.md](ROADMAP.md) | 10 Phase 개발 로드맵 |
| [docs/prd.md](docs/prd.md) | 상세 요구사항 정의서 |
| [.claude/README.md](.claude/README.md) | AI 개발 프레임워크 가이드 |

## 라이선스

Private — 비공개 프로젝트
