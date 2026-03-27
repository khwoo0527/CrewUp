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

## 🔴 Critical (즉시 수정)

- [ ] `create.tsx`에서 supabase 직접 호출 → 훅으로 분리 — 아키텍처 위반
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
- [ ] `useCreateClub.ts`의 `Alert.alert()` → Toast 교체 — 웹에서 크래시
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
- [ ] `database.ts`의 `'active'` 매직 스트링 → `MEMBER_STATUS.ACTIVE` 상수 사용
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
- [ ] `useClubDetail`, `useMyClubs`의 `user!.id` non-null assertion → 안전 처리
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
- [ ] `home.tsx`, `my-clubs.tsx` 에러 UI 누락 → 에러 상태 표시 추가
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)

## 🟠 High

- [x] 테스트 자동화 기반 구축 — jest + @testing-library/react-native 설치, 설정, 첫 단위 테스트 작성
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - **→ Sprint 2 Task 0에서 기반 구축 완료 (2026-03-27)**
- [ ] 공통 탭바 리팩토링 — 동호회 상세 등 탭 외 화면에서도 탭바 상시 표시 (커스텀 탭바 컴포넌트)
  - 발견: Sprint 2 테스트 (2026-03-27)
  - **→ Sprint 3에서 처리**
- [ ] 탭바 모바일 하단 잘림 — SafeArea 처리 미흡, 폰에서 탭바 하단이 잘려 보임
  - 발견: Sprint 2 테스트 (2026-03-27)
  - **→ Sprint 3 탭바 리팩토링 시 함께 처리**

## 🟡 Normal

- [ ] 가입된 동호회 클릭 시 동호회 내부 페이지(일정/멤버)로 이동 — 현재는 소개 페이지만 표시
  - 발견: Sprint 2 테스트 (2026-03-27)
  - **→ Sprint 3에서 동호회 내부 접근 제어와 함께 처리**
- [ ] 홈 화면에서 내가 가입한 동호회를 상단에 우선 표시
  - 발견: Sprint 2 테스트 (2026-03-27)
  - **→ Sprint 3에서 처리**
- [ ] 검색 확장 — 동호회명 외 지역, 종목 등 분류 기반 검색 지원
  - 발견: Sprint 2 테스트 (2026-03-27)
  - **→ 데이터 쌓인 후 처리**

## 🟢 Low (앱 스토어 출시 시)

- [ ] 네이버 로그인 구현 (Naver Developers 앱 등록 + OAuth 연동)
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - MVP는 Google OAuth로 진행, 스토어 출시(Phase 6) 시 추가
- [ ] 카카오 로그인 키 등록 (Kakao Developers 앱 등록 필요)
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - 코드는 구현됨, 스토어 출시(Phase 6) 시 키 등록

## 🔧 Tech Debt

- [ ] `as` 타입 캐스팅 남용 → 타입 가드로 교체 (`database.ts` sport_category 조인)
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
  - **→ 리팩토링 시 처리**
- [ ] zod 스키마 컴포넌트 내부 → 모듈 레벨로 분리 (`ClubForm.tsx`)
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
  - **→ 폼 수정/추가 시 함께 처리**
- [ ] 테스트 커버리지 ~10% → 매 Sprint마다 해당 기능 테스트 포함
  - 발견: Sprint 2 자가 리뷰 (2026-03-27)
- [ ] NativeWind `contentContainerClassName` 웹 호환 이슈 — ScrollView에서 style로 우회 중
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - 관련: `app/(auth)/onboarding.tsx`
- [ ] 온보딩 화면 레이아웃 일부 style 인라인 → NativeWind 웹 이슈 해결 후 className으로 전환
  - 발견: Sprint 1 리뷰 (2026-03-26)
  - 관련: `app/(auth)/onboarding.tsx`
