# 배포 기록

> 각 Sprint 배포 시 동일 포맷으로 기록한다.
> 자가 리뷰/코드 이슈는 `docs/backlog.md`에서 관리 — 여기서는 배포 사실과 배포 중 발견된 이슈만 기록.

---

## 2026-03-27 — Sprint 2 배포

| 항목 | 내용 |
|------|------|
| **플랫폼** | Vercel (Expo Web Export) |
| **URL** | https://crewup-eight.vercel.app |
| **빌드 명령** | `npx expo export --platform web` |
| **출력 디렉토리** | `dist` |
| **환경 변수** | 기존 Sprint 1과 동일 (변경 없음) |
| **백엔드** | Supabase Cloud (`ozzahhbhexhwzpezucbm.supabase.co`) |
| **인증** | Google OAuth (기존 유지) |
| **DB 변경** | 4개 테이블 추가 (sport_categories, clubs, club_members, join_requests) + RLS |
| **신규 기능** | 동호회 생성, 동호회 목록/검색, 동호회 상세, 내 동호회 |
| **상태** | 정상 동작 확인 (PC + 모바일 브라우저) |

### 배포 중 발견된 이슈
| 이슈 | 원인 | 해결 |
|------|------|------|
| Expo 환경 변수 런타임 미치환 | `process.env[key]` 동적 접근 | 정적 참조 `process.env.EXPO_PUBLIC_*`로 변경 |
| RLS 정책 500 에러 | club_members 재귀 서브쿼리 | RLS 정책 수정 (2단계 쿼리 패턴) |

---

## 2026-03-26 — Sprint 1 배포

| 항목 | 내용 |
|------|------|
| **플랫폼** | Vercel (Expo Web Export) |
| **URL** | https://crewup-eight.vercel.app |
| **빌드 명령** | `npx expo export --platform web` |
| **출력 디렉토리** | `dist` |
| **환경 변수** | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Vercel Settings) |
| **백엔드** | Supabase Cloud (`ozzahhbhexhwzpezucbm.supabase.co`) |
| **인증** | Google OAuth (PC + 모바일 테스트 완료) |
| **DB 변경** | profiles 테이블 + RLS |
| **신규 기능** | 소셜 로그인, 온보딩, 프로필, 인증 가드 |
| **상태** | 정상 동작 확인 (PC + 모바일 브라우저) |

### 배포 중 발견된 이슈
| 이슈 | 원인 | 해결 |
|------|------|------|
| 사이트 접속 시 파일 다운로드 | vercel.json 미설정 | SPA rewrites 설정 추가 |
| 백지 화면 | 환경 변수 미주입 | Vercel Settings에 env vars 추가 |
| 환경 변수 빌드 시 치환 안 됨 | `process.env[key]` 동적 접근 | `process.env.EXPO_PUBLIC_*` 정적 참조로 변경 |
| DNS 에러 | Supabase URL `.com` → `.co` 오타 | Vercel env var 값 수정 |
