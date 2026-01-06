import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiError,
  extractErrorMessage,
  FALLBACK_API_ERROR_MESSAGE,
} from './api-error.util';
import { API_BASE_URL, normalizeApiPath } from './api-config';

/**
 * Public API Client (인증 불필요 엔드포인트 전용)
 * - Access Token 불필요
 * - CSRF 검증 불필요 (읽기 전용 GET 요청)
 * - 토큰 갱신 로직 제외
 * - 단순 에러 처리
 */
const createPublicApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    // ⚠️ withCredentials는 false (쿠키 전송 불필요)
    // Landing 페이지는 익명 사용자 대상이므로 인증 쿠키 미전송
    withCredentials: false,
  });

  // Request Interceptor (단순 로깅만)
  client.interceptors.request.use(
    (config) => {
      const normalizedUrl = normalizeApiPath(config.url);
      if (normalizedUrl !== undefined) {
        config.url = normalizedUrl;
      }
      console.log('📤 Public API Request:', config.url);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor (에러 처리만)
  client.interceptors.response.use(
    (response) => {
      console.log(
        '📥 Public API Response:',
        response.config.url,
        'Status:',
        response.status
      );
      return response;
    },
    (error: AxiosError) => {
      console.log(
        '❌ Public API Error:',
        error.config?.url,
        'Status:',
        error.response?.status
      );

      // ✅ 단순 에러 처리 (토큰 갱신 로직 없음)
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
          new ApiError('네트워크 오류가 발생했습니다.', {
            raw: error.request,
          })
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

/**
 * Public API Client 인스턴스
 * @example
 * import { publicApi } from '@/shared/api/public-api-client';
 * const response = await publicApi.get('/notifications');
 */
export const publicApi = createPublicApiClient();
