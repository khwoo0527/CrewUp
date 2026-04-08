---
name: sprint-status
description: 현재 스프린트 진행 상태 — Sprint 2 완료, Sprint 3 예정
type: project
---

## Sprint 진행 현황

- Sprint 0: 완료 (프로젝트 기반 구축)
- Sprint 1: 완료 (인증 시스템 — 소셜 로그인, 온보딩, 프로필, 인증 가드)
- Sprint 2: 완료 (DB 스키마 + 동호회 CRUD + Vercel 배포)
- 다음 Sprint: Sprint 3 (코드 품질 수정 5건 + 가입/멤버 관리)

## Sprint 2 완료 후 코드베이스 상태

- Supabase Cloud 사용 중 — `npx supabase db push`로 마이그레이션 적용
- `update_updated_at()`, `handle_new_user()` 트리거/함수 이미 존재 — 재정의 금지
- profiles, sport_categories, clubs, club_members, join_requests 테이블 + RLS 구축 완료
- home.tsx: 실제 Supabase 데이터 연동 완료 (더미 데이터 제거됨)
- my-clubs.tsx: 가입된 동호회 목록 표시 완료
- club/create.tsx, club/[id]/index.tsx: 동호회 생성/상세 화면 구현 완료
- Vercel 웹 배포 완료, 실환경 동작 확인됨
- env.ts에서 환경변수 관리, client.ts에서 Database 제네릭 적용 완료

## Sprint 3 진입 시 주의사항

- backlog Critical 5건 수정 필수: create.tsx 훅 분리, Alert→Toast, 매직 스트링→상수, non-null assertion 안전 처리, 에러 UI 추가
- 공통 탭바 리팩토링 (커스텀 탭바 + SafeArea 하단 잘림 수정)
- 가입된 동호회 → 내부 페이지 이동 + 홈 화면 가입 동호회 우선 표시
