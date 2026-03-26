---
name: sprint-status
description: 현재 스프린트 진행 상태 — Sprint 2 계획 완료, 구현 대기
type: project
---

## Sprint 진행 현황

- Sprint 0: 완료 (프로젝트 기반 구축)
- Sprint 1: 완료 (인증 시스템 — 소셜 로그인, 온보딩, 프로필, 인증 가드)
- Sprint 2: 계획 완료, 구현 대기 (DB 스키마 + 동호회 CRUD)
- 다음 Sprint: Sprint 3 (가입 + 멤버 관리)

## 주의사항 (코드베이스 분석 결과)

- 도커 없이 Supabase Cloud 사용 중 — `npx supabase db push`로 마이그레이션 적용
- `update_updated_at()` 함수가 profiles 마이그레이션에서 이미 생성됨 — 재정의 금지
- `handle_new_user()` 트리거도 이미 존재
- profiles 테이블 + RLS 이미 존재
- 기존 home.tsx에 DUMMY_CLUBS 더미 데이터 있음 — Sprint 2에서 실제 데이터로 교체 필요
- my-clubs.tsx는 EmptyState만 있음 — Sprint 2에서 실제 데이터로 교체
- app/_layout.tsx에 club 라우트가 아직 등록되어있지 않음 — Expo Router 파일 기반이므로 자동 감지 예상
- supabase/seed.sql에 Sprint 2 시드 추가 예정 주석 이미 있음
- env.ts에서 환경변수 관리, client.ts에서 Database 제네릭 적용 완료
