import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, normalizeApiPath } from './api-config';

/**
 * Visitor 전용 API 클라이언트
 * - 토큰 인증 없음
 * - 자동 리다이렉트 없음
 * - 단순한 에러 처리
 */
const createVisitorApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor - 토큰 인증 없음
  client.interceptors.request.use(
    (config) => {
      const normalizedUrl = normalizeApiPath(config.url);
      if (normalizedUrl !== undefined) {
        config.url = normalizedUrl;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor - 단순한 에러 처리
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // 에러 메시지 추출
      if (error.response) {
        const errorMessage =
          (error.response.data as any)?.message ||
          `HTTP error! status: ${error.response.status}`;
        return Promise.reject(new Error(errorMessage));
      } else if (error.request) {
        return Promise.reject(new Error('네트워크 오류가 발생했습니다.'));
      } else {
        return Promise.reject(
          new Error(error.message || '알 수 없는 오류가 발생했습니다.')
        );
      }
    }
  );

  return client;
};

// Visitor 전용 API 클라이언트 인스턴스 생성 (Singleton)
export const visitorApi = createVisitorApiClient();
