import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth';
import { KAKAO_BRAND_COLOR, KAKAO_TEXT_COLOR, NAVER_BRAND_COLOR, NAVER_TEXT_COLOR } from '@/shared/constants';

export default function LoginScreen() {
  const { signInWithKakao, signInWithNaver } = useAuth();

  const handleKakaoLogin = async () => {
    try {
      await signInWithKakao();
    } catch {
      Alert.alert('로그인 실패', '카카오 로그인 중 문제가 발생했습니다.');
    }
  };

  const handleNaverLogin = async () => {
    try {
      await signInWithNaver();
    } catch {
      Alert.alert('로그인 실패', '네이버 로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6 md:max-w-md md:mx-auto">
        {/* 로고 & 소개 */}
        <View className="items-center mb-12">
          <View className="w-20 h-20 rounded-2xl bg-primary items-center justify-center mb-4">
            <Ionicons name="people" size={40} color="#ffffff" />
          </View>
          <Text className="text-3xl font-bold text-text-primary mb-2">CrewUp</Text>
          <Text className="text-base text-text-secondary text-center">
            동호회를 만들고, 찾고, 함께하세요
          </Text>
        </View>

        {/* 소셜 로그인 버튼 */}
        <View className="w-full gap-3">
          <Pressable
            onPress={handleKakaoLogin}
            accessibilityRole="button"
            accessibilityLabel="카카오로 시작하기"
            className="flex-row items-center justify-center py-4 px-6 rounded-xl active:opacity-80"
            style={{ backgroundColor: KAKAO_BRAND_COLOR }}
          >
            <Text className="text-base font-semibold" style={{ color: KAKAO_TEXT_COLOR }}>
              카카오로 시작하기
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNaverLogin}
            accessibilityRole="button"
            accessibilityLabel="네이버로 시작하기"
            className="flex-row items-center justify-center py-4 px-6 rounded-xl active:opacity-80"
            style={{ backgroundColor: NAVER_BRAND_COLOR }}
          >
            <Text className="text-base font-semibold" style={{ color: NAVER_TEXT_COLOR }}>
              네이버로 시작하기
            </Text>
          </Pressable>
        </View>

        {/* 하단 약관 */}
        <View className="mt-8">
          <Text className="text-xs text-text-hint text-center leading-5">
            시작하면 이용약관 및 개인정보 처리방침에{'\n'}동의한 것으로 간주합니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
