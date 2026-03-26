import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/services/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export type ProfileUpdateData = Pick<
  Database['public']['Tables']['profiles']['Update'],
  'nickname' | 'name' | 'region' | 'city' | 'bio'
>;
