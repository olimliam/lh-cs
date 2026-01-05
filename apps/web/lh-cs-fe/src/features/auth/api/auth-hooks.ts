import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import type { AxiosError } from 'axios';
import type { LoginCredentials } from '../model/types';
import { tokenStorage } from '../model/token.store';
import { useAuthStore } from '../model/store';
// import { useStatisticsLogger } from '@/shared/api/hooks/statistics-hooks';
// import {
//   LoginFailReasonEnum,
//   // LoginLogActionTypeEnum,
// } from '@/shared/api/statistics-types';
// import { useClientMetadata } from '@/shared/hooks/use-client-metadata';
import {
  getProfile,
  login,
  logout as logoutApi,
  logoutAll,
  refreshToken,
  register,
  sendRegisterCode,
  verifyRegisterCode,
  sendLoginVerificationCode,
  verifyLoginCode,
} from './auth-api';
import { useState } from 'react';

// 쿼리 키 상수
export const AUTH_QUERY_KEYS = {
  profile: ['auth', 'profile'] as const,
  all: ['auth'] as const,
};

// 로그인 Mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const setPasswordChangeRequired = useAuthStore(
    (state) => state.setPasswordChangeRequired
  );
  // const { logLoginAction } = useStatisticsLogger();
  // const { device, ipAddress } = useClientMetadata();

  // const resolveFailReason = (error: unknown): LoginFailReasonEnum => {
  //   const axiosError = error as AxiosError<{ code?: string }> | undefined;
  //   const status = axiosError?.response?.status;
  //   const backendCode = axiosError?.response?.data?.code;

  //   if (status === 401 && backendCode === 'FAIL_PASSWORD') {
  //     return LoginFailReasonEnum.FAIL_PASSWORD;
  //   }

  //   if (status === 401 && backendCode === 'FAIL_USERNAME') {
  //     return LoginFailReasonEnum.FAIL_USERNAME;
  //   }

  //   if (status === 403 && backendCode === 'NOT_ALLOW_IP') {
  //     return LoginFailReasonEnum.NOT_ALLOW_IP;
  //   }

  //   if (status === 423 || backendCode === 'BLOCK_ACCOUNT') {
  //     return LoginFailReasonEnum.BLOCK_ACCOUNT;
  //   }

  //   return LoginFailReasonEnum.SERVER_ERROR;
  // };

  return useMutation({
    mutationFn: login,
    onMutate: () => {
      // void logLoginAction({
      //   actionType: LoginLogActionTypeEnum.TRY_LOGIN,
      //   device,
      //   ipAddress,
      // });
    },
    retry: false,
    // ✅ 네트워크 에러 등의 경우에도 재시도 방지
    // retryOnMount: false,
    onSuccess: (data) => {
      // 로그인 성공 시 Zustand store에 사용자 정보 저장
      setUser(data.user);
      setPasswordChangeRequired(Boolean(data.passwordChangeRequired));

      // 프로필 데이터를 쿼리 캐시에 설정
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile, data.user);

      // 모든 auth 관련 쿼리 무효화 (필요시)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });

      // void logLoginAction({
      //   actionType: LoginLogActionTypeEnum.SUCCESS_LOGIN,
      //   counselorId: data.user.id,
      //   device,
      //   ipAddress,
      // });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // ✅ 로그인 실패 시 추가 디버깅 로그
      console.log('🔍 Login API 호출 실패 - 재시도 없음 보장');
      // 실패 시 토큰 정리
      tokenStorage.clearTokens();

      // void logLoginAction({
      //   actionType: LoginLogActionTypeEnum.FAIL_LOGIN,
      //   actionValue: resolveFailReason(error),
      //   device,
      //   ipAddress,
      // });
    },
  });
};

// 로그아웃 Mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // 로그아웃 성공 시 Zustand store 초기화
      logout();

      // 모든 쿼리 캐시 클리어
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // 에러가 발생해도 로컬 상태는 정리
      logout();
      tokenStorage.clearTokens();
      queryClient.clear();
    },
  });
};

// 전체 세션 로그아웃 Mutation
export const useLogoutAll = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: logoutAll,
    onSuccess: () => {
      // 전체 로그아웃 성공 시 Zustand store 초기화
      logout();

      // 모든 쿼리 캐시 클리어
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout all failed:', error);
      // 에러가 발생해도 로컬 상태는 정리
      logout();
      tokenStorage.clearTokens();
      queryClient.clear();
    },
  });
};

// 토큰 갱신 Mutation
export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setPasswordChangeRequired = useAuthStore(
    (state) => state.setPasswordChangeRequired
  );

  return useMutation({
    mutationFn: refreshToken,
    onSuccess: (data) => {
      // 토큰 갱신 성공 시 Zustand store 업데이트
      setUser(data.user);
      setPasswordChangeRequired(Boolean(data.passwordChangeRequired));

      // 프로필 데이터 업데이트
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile, data.user);
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      // 토큰 갱신 실패 시 로그아웃 처리
      logout();
      tokenStorage.clearTokens();
      queryClient.clear();
    },
  });
};

// 프로필 조회 Query
export const useProfile = () => {
  const accessToken = tokenStorage.getAccessToken();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: getProfile,
    enabled: !!accessToken && !window.location.pathname.includes('/login'), // 토큰이 있고 로그인 페이지가 아닐 때만 실행
    retry: (failureCount, error: unknown) => {
      console.log('Profile query failed:', error);

      // 401 에러인 경우 재시도하지 않음 (API 인터셉터에서 자동 처리)
      if (error && String(error).includes('401')) {
        return false;
      }

      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5분간 신선한 데이터로 간주
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지 (구 cacheTime)
    refetchOnWindowFocus: false, // 탭 전환 시 재요청 방지
    refetchOnMount: true, // 마운트 시 항상 재요청
  });
};

// 회원가입 Mutation
export const useRegister = () => {
  return useMutation({
    mutationFn: register,
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};

export const useSendRegisterCode = () => {
  return useMutation({
    mutationFn: sendRegisterCode,
    onError: (error) => {
      console.error('Send register code failed:', error);
    },
    retry: false, // 재시도 안 함
  });
};

export const useVerifyRegisterCode = () => {
  return useMutation({
    mutationFn: verifyRegisterCode,
    onError: (error) => {
      console.error('Verify register code failed:', error);
    },
    retry: false, // 재시도 안 함
  });
};

export const useSendLoginCode = () => {
  return useMutation({
    mutationFn: sendLoginVerificationCode,
    onError: (error) => {
      console.error('Send login verification code failed:', error);
    },
    retry: false, // 재시도 안 함
  });
};

export const useVerifyLoginCode = () => {
  return useMutation({
    mutationFn: verifyLoginCode,
    onError: (error) => {
      console.error('Verify login verification code failed:', error);
    },
    retry: false, // 재시도 안 함
  });
};

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    passwordChangeRequired,
    isLoading: authLoading,
  } = useAuthStore();
  const accessToken = tokenStorage.getAccessToken();
  const { data: profileUser, isLoading, error } = useProfile();

  // Zustand store와 프로필 쿼리 동기화
  const finalUser = user || profileUser;
  const finalIsAuthenticated = isAuthenticated && !!accessToken && !!finalUser;

  return {
    user: finalUser,
    isAuthenticated: finalIsAuthenticated,
    isLoading: authLoading || isLoading,
    error,
    passwordChangeRequired,
  };
};

// 로그인 폼을 위한 커스텀 Hook
export const useLoginForm = () => {
  const loginMutation = useLogin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    // ✅ 이미 진행 중인 로그인 요청이 있으면 무시
    if (isSubmitting || loginMutation.isPending) {
      console.warn('⚠️ 로그인 진행 중 - 중복 요청 무시');
      return { success: false, error: '로그인 진행 중입니다.' };
    }

    setIsSubmitting(true);

    try {
      const result = await loginMutation.mutateAsync(credentials);
      setIsSubmitting(false);
      return { success: true, data: result };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : '로그인에 실패했습니다.';
      setIsSubmitting(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    login: handleLogin,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message,
    isError: loginMutation.isError,
    reset: loginMutation.reset,
  };
};
