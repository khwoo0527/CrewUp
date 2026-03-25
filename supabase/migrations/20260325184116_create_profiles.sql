-- profiles: auth.users 확장 프로필
-- 새 유저 가입 시 자동 생성, 온보딩에서 닉네임 설정

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  region TEXT,
  city TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 닉네임 길이 제약 (constants/limits.ts의 NICKNAME_MIN/MAX_LENGTH와 동기화)
ALTER TABLE profiles ADD CONSTRAINT nickname_length
  CHECK (nickname IS NULL OR (char_length(nickname) >= 2 AND char_length(nickname) <= 12));

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 누구나 프로필 조회 가능 (동호회 멤버 목록 등에서 필요)
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 본인 프로필만 삽입 가능
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 인덱스
CREATE INDEX idx_profiles_nickname ON profiles(nickname);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 새 유저 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
