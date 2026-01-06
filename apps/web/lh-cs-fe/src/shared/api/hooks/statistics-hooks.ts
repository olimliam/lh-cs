import { useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { statisticsApi } from '../statistics-api';
import type {
  CreateAdminLogRequest,
  CreateConsultationLogRequest,
  CreateFreeTourLogRequest,
  // CreateLoginLogRequest,
} from '../statistics-types';

interface StatisticsLoggerResult {
  logAdminAction: (payload: CreateAdminLogRequest) => Promise<void>;
  // logLoginAction: (payload: CreateLoginLogRequest) => Promise<void>;
  logConsultationAction: (
    payload: CreateConsultationLogRequest
  ) => Promise<void>;
  logFreeTourAction: (payload: CreateFreeTourLogRequest) => Promise<void>;
  isLoading: boolean;
}

const useSafeMutation = <TPayload, TResponse>(
  mutationFn: (payload: TPayload) => Promise<TResponse>,
  errorLabel: string
) => {
  return useMutation<TResponse, Error, TPayload>({
    mutationFn,
    onError: (error) => {
      console.error(`${errorLabel} 실패`, error);
    },
  });
};

export const useStatisticsLogger = (): StatisticsLoggerResult => {
  const adminMutation = useSafeMutation(
    statisticsApi.createAdminLog,
    '관리자 로그 적재'
  );
  // const loginMutation = useSafeMutation(
  //   statisticsApi.createLoginLog,
  //   '로그인 로그 적재'
  // );
  const consultationMutation = useSafeMutation(
    statisticsApi.createConsultationLog,
    '상담실 로그 적재'
  );
  const freeTourMutation = useSafeMutation(
    statisticsApi.createFreeTourLog,
    '프리투어 로그 적재'
  );

  const wrapMutation = useCallback(
    async <TPayload, TResponse>(
      mutateAsync: (payload: TPayload) => Promise<TResponse>,
      payload: TPayload
    ): Promise<void> => {
      try {
        await mutateAsync(payload);
      } catch (error) {
        // onError 콜백에서 이미 에러 로깅 처리됨
        // 시큐어 코딩: 빈 catch 블록 방지를 위해 명시적으로 처리
        console.debug('[StatisticsLogger] 에러가 onError 핸들러에서 처리됨', error);
      }
    },
    []
  );

  const logAdminAction = useCallback(
    (payload: CreateAdminLogRequest) =>
      wrapMutation(adminMutation.mutateAsync, payload),
    [adminMutation.mutateAsync, wrapMutation]
  );

  // const logLoginAction = useCallback(
  //   (payload: CreateLoginLogRequest) =>
  //     wrapMutation(loginMutation.mutateAsync, payload),
  //   [loginMutation.mutateAsync, wrapMutation]
  // );

  const logConsultationAction = useCallback(
    (payload: CreateConsultationLogRequest) =>
      wrapMutation(consultationMutation.mutateAsync, payload),
    [consultationMutation.mutateAsync, wrapMutation]
  );

  const logFreeTourAction = useCallback(
    (payload: CreateFreeTourLogRequest) =>
      wrapMutation(freeTourMutation.mutateAsync, payload),
    [freeTourMutation.mutateAsync, wrapMutation]
  );

  const isLoading = useMemo(
    () =>
      adminMutation.isPending ||
      // loginMutation.isPending ||
      consultationMutation.isPending ||
      freeTourMutation.isPending,
    [
      adminMutation.isPending,
      // loginMutation.isPending,
      consultationMutation.isPending,
      freeTourMutation.isPending,
    ]
  );

  return {
    logAdminAction,
    // logLoginAction,
    logConsultationAction,
    logFreeTourAction,
    isLoading,
  };
};
