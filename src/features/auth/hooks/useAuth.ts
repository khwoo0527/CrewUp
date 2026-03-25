import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { AuthState, AuthActions, Profile, ProfileUpdateData } from '../types';

type AuthStore = AuthState & AuthActions;

const useAuthStore = create<AuthStore>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isOnboarded: false,

  signInWithKakao: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  signInWithNaver: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'naver' as 'github', // Supabase SDK 타입에 naver 없음 — runtime에서는 정상 동작
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
      isOnboarded: false,
    });
  },

  updateProfile: async (data: ProfileUpdateData) => {
    const user = get().user;
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    set({
      profile: updated,
      isOnboarded: Boolean(updated.nickname),
    });
  },

  refreshProfile: async () => {
    const user = get().user;
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      set({
        profile: data,
        isOnboarded: Boolean(data.nickname),
      });
    }
  },
}));

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export function useAuth() {
  const store = useAuthStore();
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 초기 세션 로드
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        useAuthStore.setState({
          session,
          user: session.user,
          profile,
          isAuthenticated: true,
          isOnboarded: Boolean(profile?.nickname),
          isLoading: false,
        });
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          useAuthStore.setState({
            session,
            user: session.user,
            profile,
            isAuthenticated: true,
            isOnboarded: Boolean(profile?.nickname),
            isLoading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          queryClient.clear();
          useAuthStore.setState({
            session: null,
            user: null,
            profile: null,
            isAuthenticated: false,
            isOnboarded: false,
            isLoading: false,
          });
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return store;
}
