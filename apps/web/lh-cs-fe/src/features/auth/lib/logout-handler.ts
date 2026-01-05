import { QueryClient } from '@tanstack/react-query';
import { tokenStorage } from '../model/token.store';

/**
 * 중앙화된 로그아웃 처리 함수
 * 401 에러나 토큰 만료 시 자동으로 로그아웃 처리하고 로그인 페이지로 리디렉션
 */
export const handleForceLogout = (queryClient: QueryClient, reason?: string) => {
  // 1. 토큰 정리
  tokenStorage.clearTokens();
  
  // 2. 쿼리 캐시 클리어
  queryClient.clear();
  
  // 3. 로그 기록
  console.warn('Force logout triggered:', reason || 'Unknown reason');
  
  // 4. 로그인 페이지로 리디렉션 (현재 페이지 정보 저장)
  const currentPath = window.location.pathname;
  const searchParams = window.location.search;
  const redirectUrl = `/login?from=${encodeURIComponent(currentPath + searchParams)}`;
  
  // replace를 사용하여 뒤로가기로 돌아올 수 없도록 설정
  window.location.replace(redirectUrl);
};

/**
 * 에러가 401 인증 에러인지 확인하는 유틸리티 함수
 */
export const isUnauthorizedError = (error: unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  return (
    errorMessage.includes('401') ||
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('INVALID_TOKEN') ||
    errorMessage.includes('INVALID_REFRESH_TOKEN')
  );
};

/**
 * 에러를 체크하고 401이면 자동으로 로그아웃 처리하는 함수
 */
export const checkAndHandleUnauthorizedError = (
  error: unknown, 
  queryClient: QueryClient,
  context?: string
): boolean => {
  if (isUnauthorizedError(error)) {
    const reason = `Unauthorized error detected in ${context || 'unknown context'}: ${error}`;
    handleForceLogout(queryClient, reason);
    return true;
  }
  return false;
};