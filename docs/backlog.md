# Product Backlog

> Sprint 리뷰, Phase 리뷰에서 발견된 이슈를 기록합니다.
> Sprint Planning 시 여기서 다음 Sprint에 포함할 항목을 선별합니다.
> 완료된 항목은 `[x]`로 체크하고, 해결 Sprint를 기록합니다.

## 우선순위 범례
- 🔴 Critical: 현재 Sprint에서 반드시 수정
- 🟠 High: 다음 Sprint에 반드시 포함
- 🟡 Normal: 가까운 Sprint에 포함
- 🟢 Low: 여유될 때 처리
- 🔧 Tech Debt: 기술 부채 (동작하지만 개선 필요)

---

## 🟠 High

- [ ] 테스트 자동화 기반 구축 — jest + @testing-library/react-native 설치, 설정, 첫 단위 테스트 작성
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - 비고: Sprint 2부터 DB 연동 시작 → 테스트와 함께 개발 필요

## 🟡 Normal

- [ ] 카카오 로그인 키 등록 (Kakao Developers 앱 등록 필요) — 출시 전 필수
  - 발견: Sprint 1 리뷰 (2026-03-26)

## 🔧 Tech Debt

- [ ] NativeWind `contentContainerClassName` 웹 호환 이슈 — ScrollView에서 style로 우회 중
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - 관련: `app/(auth)/onboarding.tsx`
- [ ] 온보딩 화면 레이아웃 일부 style 인라인 → NativeWind 웹 이슈 해결 후 className으로 전환
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - 관련: `app/(auth)/onboarding.tsx`
