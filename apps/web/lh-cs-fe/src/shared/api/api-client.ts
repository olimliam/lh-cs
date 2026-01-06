import { tokenStorage } from '@/features/auth/model/token.store';
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';
import {
  ApiError,
  extractErrorMessage,
  FALLBACK_API_ERROR_MESSAGE,
} from './api-error.util';
import { API_BASE_URL, normalizeApiPath } from './api-config';

// ✅ Public 엔드포인트 상수 (Set 사용)
const PUBLIC_ENDPOINTS = new Set([
  'auth/login',
  'auth/register',
  'auth/visitor-auth',
  'auth/visitor-id-check',
  'auth/refresh',
]);

// ✅ Public 페이지 경로 상수
const PUBLIC_PAGES = new Set([
  '/landing',
  '/login',
  '/register',
  '/change-password-required',
  // '/visitor',
  // '/visitor-tour',
]);

// ✅ Public 페이지 접두사 (startsWith 체크용)
const PUBLIC_PAGE_PREFIXES = ['/self-check', '/visitor', '/visitor-tour'];

// 토큰 갱신 상태 관리 (Race Condition 방지)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// CSRF 에러 감지 로직
interface CSRFErrorDetection {
  isCSRFError: (error: AxiosError) => boolean;
}

const csrfErrorDetection: CSRFErrorDetection = {
  isCSRFError: (error: AxiosError) => {
    if (error.response?.status !== 403) return false;

    const code = (error.response?.data as any)?.code || '';
    return code === 'CSRF_TOKEN_REQUIRED' || code === 'CSRF_TOKEN_INVALID';
  },
};

/**
 * ✅ API 엔드포인트가 Public(인증 불필요)인지 확인
 * @param url - API 경로 (예: 'auth/login', '/auth/login?token=abc')
 */
export const isPublicEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;

  const normalizedUrl = url.split('?')[0].replace(/^\//, '');
  return PUBLIC_ENDPOINTS.has(normalizedUrl);
};

/**
 * ✅ 브라우저 경로가 Public 페이지인지 확인 (중복 제거)
 * @param path - 브라우저 경로 (예: '/landing', '/self-check/result')
 */
export const isPublicPage = (path: string): boolean => {
  // 1. 정확한 매칭 (Set 사용 - O(1))
  if (PUBLIC_PAGES.has(path)) return true;

  // 2. 접두사 매칭 (startsWith)
  return PUBLIC_PAGE_PREFIXES.some((prefix) => path.startsWith(prefix));
};

/**
 * ✅ 로그인 페이지로 안전하게 리디렉션
 * @param fromPath - 원래 경로 (선택적)
 */
export const redirectToLogin = (fromPath?: string) => {
  // 만료/로그아웃 시 남은 토큰을 정리해 재인증 루프를 방지
  tokenStorage.clearTokens();

  if (window.location.pathname.includes('/login')) {
    return; // 이미 로그인 페이지에 있으면 무시
  }

  const redirectUrl = fromPath
    ? `/login?from=${encodeURIComponent(fromPath)}`
    : '/login';

  window.location.replace(redirectUrl);
};

// 토큰 갱신 함수 (쿠키 기반 refresh token 사용)
const refreshTokenRequest = async (): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  // alert('토큰이 만료되어 자동으로 갱신합니다. 잠시만 기다려주세요.');
  console.log(
    '🔄 Sending refresh token request to:',
    `${API_BASE_URL}/auth/refresh`
  );

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
      timeout: 5000,
    }
  );

  if (!response.data?.success || !response.data?.data) {
    const errorMessage = response.data?.message || '토큰 갱신에 실패했습니다.';
    console.error('❌ Refresh token request failed:', errorMessage);
    throw new Error(errorMessage);
  }

  return response.data.data;
};

// Axios 인스턴스 생성 및 미들웨어 설정
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  // ✅ CSRF 전용 Refresh 함수 (단순화)
  const handleCSRFRefresh = async (
    originalRequest: InternalAxiosRequestConfig & { _csrfRetry?: boolean }
  ): Promise<any> => {
    // ✅ 이미 재시도했으면 즉시 거부 (단일 플래그만 사용)
    if (originalRequest._csrfRetry) {
      console.error('❌ CSRF refresh already attempted - forcing logout');
      tokenStorage.clearTokens();
      redirectToLogin(window.location.pathname + window.location.search);
      return Promise.reject(new Error('CSRF token refresh failed'));
    }

    try {
      console.log('🔄 Attempting CSRF token refresh...');

      const tokenData = await refreshTokenRequest();
      console.log('✅ CSRF token refresh successful');

      tokenStorage.setTokens(tokenData.accessToken, tokenData.refreshToken);

      const newAccessToken = tokenStorage.getAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      }

      originalRequest._csrfRetry = true; // ✅ 재시도 플래그 설정

      return client(originalRequest);
    } catch (refreshError) {
      console.error('❌ CSRF token refresh failed:', refreshError);

      // ✅ refreshTokenRequest에서 이미 CSRF 에러를 처리했으므로
      // 여기서는 단순히 토큰 제거 후 리디렉션만 수행
      tokenStorage.clearTokens();
      redirectToLogin(window.location.pathname + window.location.search);

      return Promise.reject(refreshError);
    }
  };

  // Request Interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.url = normalizeApiPath(config.url);

      const accessToken = tokenStorage.getAccessToken();

      console.log(
        '📤 API Request:',
        config.url,
        'AccessToken:',
        accessToken ? '있음' : '없음'
      );

      // ✅ Public 엔드포인트가 아니면 Authorization 헤더 추가
      if (!isPublicEndpoint(config.url) && accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  client.interceptors.response.use(
    (response) => {
      console.log(
        '📥 API Response:',
        response.config.url,
        'Status:',
        response.status
      );

      // 백엔드에서 자동 갱신된 Access Token 확인
      const newAccessToken = response.headers['x-access-token'];
      if (newAccessToken) {
        console.log('🔄 Auto-refreshed access token detected');
        tokenStorage.setTokens(
          newAccessToken,
          tokenStorage.getRefreshToken() || ''
        );
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        _csrfRetry?: boolean;
      };

      console.log(
        '❌ API Error:',
        originalRequest.url,
        'Status:',
        error.response?.status,
        'Data:',
        error.response?.data
      );

      // ✅ Public 페이지 체크 (단일 함수로 통합)
      const currentPath = window.location.pathname;
      const isOnPublicPage = isPublicPage(currentPath);

      // CSRF 에러 처리 (403)
      if (
        error.response?.status === 403 &&
        csrfErrorDetection.isCSRFError(error)
      ) {
        console.warn('⚠️ CSRF error -> redirect flow', {
          url: originalRequest.url,
          status: error.response?.status,
          hasAccessToken: !!tokenStorage.getAccessToken(),
          path: currentPath,
        });
        // ✅ Public 페이지 또는 Public 엔드포인트는 토큰 갱신 시도 안 함
        if (isOnPublicPage || isPublicEndpoint(originalRequest.url)) {
          // console.log('🔓 CSRF error on public resource - no token refresh');
          const message = extractErrorMessage(error.response?.data);
          return Promise.reject(
            new ApiError(message, {
              status: error.response?.status,
              raw: error.response?.data,
            })
          );
        }

        // ✅ 이미 CSRF 재시도를 했으면 바로 에러 반환
        if (originalRequest._csrfRetry) {
          console.error('❌ CSRF retry already attempted - rejecting request');
          tokenStorage.clearTokens();
          redirectToLogin(currentPath + window.location.search);

          const message = extractErrorMessage(error.response?.data);
          return Promise.reject(
            new ApiError(message, {
              status: error.response?.status,
              raw: error.response?.data,
            })
          );
        }

        // ✅ 이미 재시도 중이면 대기열에 추가
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => client(originalRequest));
        }

        return handleCSRFRefresh(originalRequest);
      }

      // 401/400 에러 처리
      if (
        (error.response?.status === 401 || error.response?.status === 400) &&
        !originalRequest._retry
      ) {
        console.warn('⚠️ Auth error -> refresh or redirect flow', {
          url: originalRequest.url,
          status: error.response?.status,
          hasAccessToken: !!tokenStorage.getAccessToken(),
          path: currentPath,
        });

        /**
         * 비즈니스 로직 에러인 경우 토큰 갱신하지 않음 (재시도 방지)
         * 예: verify-code 실패, 인증번호 불일치, 사용자 정보 불일치 등
         */
        const NO_RETRY_PATTERNS = [
          // 정확한 경로 매칭
          'auth/login/verify-code',
          'auth/register/verify-code',
          'auth/login/send-code',
          'auth/register/send-code',
          'consultations',
          'users/change-password',
          // 동적 경로 패턴 (정규식)
          /users\/\d+\/password/, // users/{id}/password
        ];

        const shouldSkipRetry = NO_RETRY_PATTERNS.some((pattern) => {
          if (pattern instanceof RegExp) {
            return pattern.test(originalRequest.url || '');
          }
          return originalRequest.url?.includes(pattern);
        });

        if (shouldSkipRetry) {
          console.log(
            '🚫 Business logic error - no token refresh for:',
            originalRequest.url
          );
          const message = extractErrorMessage(error.response?.data);
          return Promise.reject(
            new ApiError(message, {
              status: error.response?.status,
              raw: error.response?.data,
            })
          );
        }

        // ✅ Public 페이지 또는 Public 엔드포인트는 토큰 갱신 시도 안 함
        if (isOnPublicPage || isPublicEndpoint(originalRequest.url)) {
          // console.log('🔓 401 error on public resource - no token refresh');

          // ✅ refresh 엔드포인트 실패 시 토큰만 제거하고 리디렉션 안 함
          if (originalRequest.url?.includes('auth/refresh')) {
            // console.log(
            //   '⚠️ Refresh token expired on public page - clearing tokens only'
            // );
            tokenStorage.clearTokens();
          }

          const message = extractErrorMessage(error.response?.data);
          return Promise.reject(
            new ApiError(message, {
              status: error.response?.status,
              raw: error.response?.data,
            })
          );
        }

        // ✅ 이미 재시도 중이면 대기열에 추가
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              const newAccessToken = tokenStorage.getAccessToken();
              if (newAccessToken) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // console.log('🔄 Attempting token refresh...');
          const tokenData = await refreshTokenRequest();
          // console.log('✅ Token refresh successful');

          tokenStorage.setTokens(tokenData.accessToken, tokenData.refreshToken);
          processQueue(null, tokenData.accessToken);

          originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          tokenStorage.clearTokens();
          redirectToLogin(currentPath + window.location.search);

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 기타 에러 처리
      if (error.response) {
        const message = extractErrorMessage(error.response.data);
        return Promise.reject(
          new ApiError(message, {
            status: error.response.status,
            raw: error.response.data,
          })
        );
      }

      if (error.request) {
        return Promise.reject(
          new ApiError('네트워크 오류가 발생했습니다.', { raw: error.request })
        );
      }

      return Promise.reject(
        new ApiError(error.message || FALLBACK_API_ERROR_MESSAGE, {
          raw: error,
        })
      );
    }
  );

  return client;
};

export const api = createApiClient();

export const zoomSessionApi = {
  logSession: async (params: {
    consultationId: string;
    zoomSessionId: string;
  }) => {
    const { data } = await api.post(`/zoom/session/log`, params);
    return data;
  },
  deleteSession: async (sessionId: string) => {
    const { data } = await api.delete(`/zoom/session`, {
      data: { sessionId: sessionId },
    });
    return data;
  },
  endSession: async (sessionId: string) => {
    const { data } = await api.post(`/zoom/session/end`, {
      sessionId: sessionId,
    });
    return data;
  },
};
