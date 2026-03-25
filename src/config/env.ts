function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`);
  }
  return value;
}

export const env = {
  supabaseUrl: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
} as const;
