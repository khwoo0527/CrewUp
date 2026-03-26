---
name: Supabase Cloud 설정 정보
description: Supabase Cloud 프로젝트 연결 정보 및 OAuth, 환경 구성
type: project
---

## Supabase Cloud
- Project ID: ozzahhbhexhwzpezucbm
- URL: https://ozzahhbhexhwzpezucbm.supabase.co
- 환경 변수: .env (git 추적) / .env.local (git 제외)
- CLI 링크 완료 (2026-03-26)
- profiles 마이그레이션 Cloud에 적용 완료

## OAuth 설정
- Google OAuth 설정 완료 (Supabase 대시보드에서 Google Provider 활성화)
- 카카오: 키 미등록 (Kakao Developers 앱 등록 필요)
- 네이버: 제거 (사업자 등록 전이라 검수 어려움)

## 환경 분리
- .env: 공개키 (URL, anon key) → git에 올림
- .env.local: 민감한 키 (service_role, access_token) → gitignore
