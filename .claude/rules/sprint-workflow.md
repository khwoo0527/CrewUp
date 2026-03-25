---
paths:
  - "docs/sprint/**"
  - "ROADMAP.md"
  - "deploy.md"
---

# 스프린트/핫픽스 워크플로우 규칙

> 이 파일은 기술 스택에 무관하게 적용되는 범용 워크플로우입니다.
> 프로젝트별 기술 스택, 빌드 명령, 브랜치 전략은 `/CLAUDE.md`에 정의합니다.
> 에이전트는 반드시 `/CLAUDE.md`의 `tech_stack`을 확인하고, 해당하는 `.claude/rules/{tech}.md`를 로드하여 기술 스택 전문가로 동작합니다.

---

## 기술 스택 연동 패턴

모든 에이전트와 워크플로우는 아래 순서로 프로젝트 컨텍스트를 로드합니다:

```
1. /CLAUDE.md 읽기 → 기술 스택, 빌드 명령, 폴더 구조, 브랜치 전략 파악
2. .claude/rules/ 스캔 → CLAUDE.md의 tech_stack에 해당하는 규칙 파일만 로드
3. 프로젝트 문서 읽기 → ROADMAP.md, docs/phase/, docs/sprint/ 등
```

**규칙 파일 로드 원칙:**
- CLAUDE.md에 명시된 기술 스택에 **정확히 매칭되는** rules/{tech}.md만 로드합니다.
- 관련 없는 기술 스택의 rules 파일은 **절대 로드하지 않습니다.** (예: Python 프로젝트에서 rules/csharp.md 로드 금지)
- `rules/sprint-workflow.md`, `rules/notion.md` 등 기술 스택이 아닌 워크플로우/연동 규칙은 해당 시 로드합니다.

**예시:**
- CLAUDE.md에 `tech_stack: C#, WinForms` → `rules/csharp.md` 로드
- CLAUDE.md에 `tech_stack: Python, FastAPI` → `rules/python.md` 로드
- CLAUDE.md에 `tech_stack: TypeScript, React` → `rules/react.md` + `rules/typescript.md` 로드
- Notion 연동 설정이 있으면 → `rules/notion.md` 추가 로드

**해당 기술 스택의 rules/{tech}.md가 없는 경우:**
- 에이전트는 작업을 시작하기 전에 **사용자에게 rules/{tech}.md 생성을 먼저 제안**합니다.
- 사용자가 동의하면 **`.claude/rules/TEMPLATE.md`를 참조하여** 해당 기술 스택의 시니어 수준 규칙 파일(언어 + 프레임워크 + 실전 패턴)을 생성한 뒤 작업을 진행합니다.
- TEMPLATE.md의 작성 원칙, 템플릿 구조, 품질 체크리스트를 반드시 따릅니다.
- rules 파일 없이 진행하면 기술 스택 전문성이 보장되지 않으므로, **생성을 강력히 권장**합니다.

이를 통해 코드 리뷰, 빌드 검증, 코드 품질 기준이 **프로젝트의 기술 스택에 특화**됩니다.

---

## Sprint 프로세스

### 1. 계획 (sprint-planner agent)
- ROADMAP.md + 코드베이스 분석 → `docs/sprint/sprint{N}.md` 생성
- sprint{N}.md는 **실행 명세서**: Task별 파일 경로, Step, 검증 명령, 커밋 메시지 포함
- CLAUDE.md의 기술 스택에 맞는 빌드/검증 명령을 sprint 문서에 반영
- 해당 기술 스택의 베스트 프랙티스(rules/{tech}.md)를 기반으로 Task 설계
- 사용자가 검토/승인한 후 구현 단계로 진행

### 2. 구현 (sprint{N}.md 기준)
- CLAUDE.md에 정의된 브랜치 전략에 따라 `sprint{N}` 브랜치 생성
- **sprint{N}.md를 먼저 읽고** 실행 플랜과 Task 목록을 파악
- 각 Task의 `skill:` 헤더에 명시된 스킬을 Skill 도구로 로드
- 실행 플랜의 Phase 순서대로 Task 실행:
  - **병렬 가능 Phase**: 사용자 요청 시 팀으로 병렬 실행 가능
  - 각 Task의 Step을 따름 (skill별 실행 전략에 따라)
  - CLAUDE.md에 정의된 빌드/검증 명령으로 결과 확인
  - **simplify** 스킬로 코드 정리 후 커밋
  - 명시된 커밋 메시지로 커밋
- 최종 검증 시 **verification-before-completion** 스킬 적용
- 계획과 다른 결정이 필요하면 사용자에게 확인
- worktree 사용 금지

### 3. 마무리 (sprint-close agent)
- sprint-close agent → ROADMAP 업데이트 + develop PR 생성 + 문서 정리
- 코드 리뷰와 자동 검증은 수행하지 않음

### 4. 리뷰 (sprint-review agent)
- PR 검토 후 sprint-review agent → 코드 리뷰 + 자동 검증 + deploy.md 결과 기록
- 코드 리뷰 시 해당 기술 스택의 rules/{tech}.md 기준으로 전문적 리뷰 수행
- Critical 이슈 발견 시 수정 후 재실행 가능

### 5. 배포
- QA 후 deploy-prod agent → 빌드 생성 + 배포 준비
- CLAUDE.md에 정의된 배포 절차에 따라 진행
- 메인 브랜치 병합은 사용자가 직접 수행

---

## Hotfix 프로세스
1. 메인 브랜치 기반 `hotfix/{설명}` 브랜치 생성
2. 핫픽스 구현 후 hotfix-close agent → **develop** PR 생성
3. develop에서 QA 후 메인 브랜치 병합은 사용자가 직접 수행
> 메인 브랜치에 직접 PR을 생성하거나 병합하지 않습니다.

## Hotfix vs Sprint 판단 기준
- Hotfix: 프로덕션 장애, 파일 3개 이하, 코드 50줄 이하, 스키마 변경/새 의존성 없음
- Sprint: 이외 모든 작업

---

## 예외 상황 대응

### 스프린트 중간 방향 전환 / 요구사항 변경
1. **경미한 변경** (Task 수정/추가 수준): sprint{N}.md를 직접 수정하고 계속 진행
2. **중대한 변경** (Sprint 목표 자체가 바뀜): 현재 Sprint를 중단하고 아래 절차를 따름
   - 진행된 작업을 커밋 (미완성이라도 `wip:` 접두어로 커밋)
   - sprint{N}.md에 중단 사유와 진행 상태를 기록
   - 필요 시 Phase 재계획 (phase-planner) 또는 새 Sprint 계획 (sprint-planner)
3. **Phase 재계획이 필요한 경우**: 아키텍처 변경, 기술 스택 변경, 핵심 요구사항 대폭 수정 시

### 롤백 (배포 후 문제 발생)
1. **경미한 버그**: Hotfix 프로세스로 대응
2. **심각한 장애 (즉시 롤백 필요)**:
   - 메인 브랜치를 이전 안정 버전으로 되돌림: `git revert` 또는 `git reset`
   - 롤백 후 deploy.md에 롤백 기록 작성
   - 원인 분석 후 Hotfix 또는 Sprint로 근본 수정
3. **롤백 판단 기준**: 사용자 영향도가 높고, 핫픽스로 즉시 해결 불가능한 경우

---

## 코드 품질 기준

코드 리뷰와 구현 시 아래 두 레이어로 품질을 보장합니다:

### Layer 1: 범용 소프트웨어 공학 원칙 (모든 프로젝트 공통)
- SOLID 원칙 준수
- DRY (Don't Repeat Yourself) — 3회 이상 반복 시 추출
- KISS (Keep It Simple, Stupid) — 불필요한 추상화 지양
- 보안: OWASP Top 10 기준 취약점 방지
- 성능: 불필요한 연산, 메모리 낭비 주의
- 테스트: 프로젝트에 테스트 전략이 있으면 준수

### Layer 2: 기술 스택 전문 규칙 (rules/{tech}.md에서 로드)
- 해당 언어/프레임워크의 베스트 프랙티스
- 네이밍 컨벤션, 코드 구조, 패턴
- 언어별 보안 취약점 (SQL Injection, XSS 등)
- 빌드/패키지 관리 규칙
- 프레임워크별 안티패턴

---

## 문서 구조
- 실행 명세서: `docs/sprint/sprint{N}.md`
- 첨부: `docs/sprint/sprint{N}/`
- Phase 계획: `docs/phase/phase{N}.md`
- 배포 기록: `deploy.md`
- 배포 히스토리: `docs/deploy-history/`

## 체크리스트 형식
- 완료: `- [x] 항목 내용`
- 미완료: `- [ ] 항목 내용`

---

## 새 프로젝트 초기화

아래와 같은 상황에서 에이전트는 신규 프로젝트 여부를 사용자에게 확인합니다:
- CLAUDE.md가 없거나, 현재 코드베이스와 agent-memory의 내용이 맞지 않을 때
- 사용자의 대화에서 새 프로젝트를 시작하는 뉘앙스가 느껴질 때 (직접적 표현이 아니더라도)
- 이전 프로젝트와 기술 스택이 다른 작업을 요청받을 때

1. **신규 프로젝트 여부 확인**: 먼저 사용자에게 "혹시 새 프로젝트를 시작하시는 건가요?"라고 확인합니다.
2. **프로젝트 종속 데이터 정리**:
   - `agent-memory/` 하위 모든 MEMORY.md → 초기 상태로 리셋
   - `settings.local.json` → 이전 프로젝트 권한 확인 후 정리
3. **CLAUDE.md 확인**: 프로젝트 루트에 `/CLAUDE.md`가 있는지 확인하고, 없으면 작성을 안내
4. **기술 스택 rules 확인**: CLAUDE.md의 기술 스택에 해당하는 `rules/{tech}.md`가 있는지 확인하고, 없으면 생성을 제안

> **원칙**: .claude 폴더는 범용 프레임워크입니다. 특정 프로젝트에서만 의미 있는 데이터는 포함하지 않습니다.
> 프로젝트 종속 데이터는 `agent-memory/`에만 존재하며, 새 프로젝트 시작 시 반드시 리셋합니다.
