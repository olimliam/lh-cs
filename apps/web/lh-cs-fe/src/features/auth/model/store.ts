import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, AuthUser } from './types';
import { tokenStorage } from './token.store';

interface AuthStore extends AuthState {
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  setPasswordChangeRequired: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      passwordChangeRequired: false,

      setUser: (user: AuthUser) => {
        set({ user, isAuthenticated: true, isLoading: false });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setPasswordChangeRequired: (value: boolean) => {
        set({ passwordChangeRequired: value });
      },

      logout: () => {
        // 토큰 저장소에서 모든 토큰 삭제
        tokenStorage.clearTokens();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          passwordChangeRequired: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        passwordChangeRequired: state.passwordChangeRequired,
      }),
    }
  )
);
