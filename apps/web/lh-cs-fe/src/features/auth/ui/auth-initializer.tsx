import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refreshToken } from '../api/auth-api';
import { AUTH_QUERY_KEYS } from '../api/auth-hooks';
import { tokenStorage } from '../model/token.store';
import { useAuthStore } from '../model/store';

export const AuthInitializer = () => {
  const queryClient = useQueryClient();
  const setLoading = useAuthStore((state) => state.setLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setPasswordChangeRequired = useAuthStore(
    (state) => state.setPasswordChangeRequired
  );
  const logout = useAuthStore((state) => state.logout);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    const currentPath = window.location.pathname;
    const isVisitorViewerPage = currentPath.startsWith('/visitor');

    const bootstrapAuth = async () => {
      const existingAccessToken =
        tokenStorage.getAccessToken() || tokenStorage.bootstrapFromSession();

      // 방문자 뷰어는 비로그인 흐름이므로 refresh 시도를 건너뛴다.
      if (!existingAccessToken && isVisitorViewerPage) {
        setLoading(false);
        return;
      }

      if (existingAccessToken) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await refreshToken();

        setUser(data.user);
        setPasswordChangeRequired(Boolean(data.passwordChangeRequired));
        queryClient.setQueryData(AUTH_QUERY_KEYS.profile, data.user);
      } catch (error) {
        console.error('Auth bootstrap failed:', error);
        logout();
        queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.profile });
      } finally {
        setLoading(false);
      }
    };

    void bootstrapAuth();
  }, [logout, queryClient, setLoading, setPasswordChangeRequired, setUser]);

  return null;
};
