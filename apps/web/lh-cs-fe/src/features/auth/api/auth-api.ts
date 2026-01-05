import { api } from '@/shared/api/api-client';
import { tokenStorage } from '../model/token.store';
import type {
  LoginCredentials,
  AuthUser,
  AuthResponse,
  ApiResponse,
  RegisterResponse,
  RegisterPayload,
} from '../model/types';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/auth/login',
    credentials
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '로그인에 실패했습니다.');
  }

  // 토큰 저장
  tokenStorage.setTokens(
    response.data.data.accessToken,
    response.data.data.refreshToken
  );

  return response.data.data;
}

export async function logout(): Promise<void> {
  // 쿠키 기반 refresh token을 사용하므로 body는 빈 객체
  await api.post<ApiResponse<void>>('/auth/logout', {});
  tokenStorage.clearTokens();
}

export async function logoutAll(): Promise<void> {
  await api.post<ApiResponse<void>>('/auth/logout-all');
  tokenStorage.clearTokens();
}

export async function refreshToken(): Promise<AuthResponse> {
  // 쿠키 기반 refresh token을 사용하므로 body는 빈 객체
  const response = await api.post<ApiResponse<AuthResponse>>(
    '/auth/refresh',
    {}
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '토큰 갱신에 실패했습니다.');
  }

  // 응답 헤더에서 CSRF 토큰 확인

  // 새로운 토큰 저장
  tokenStorage.setTokens(
    response.data.data.accessToken,
    response.data.data.refreshToken
  );

  return response.data.data;
}

export async function getProfile(): Promise<AuthUser> {
  const { data: response } =
    await api.get<ApiResponse<AuthUser>>('/users/profile');

  if (!response.success || !response.data) {
    throw new Error(response.message || '프로필 조회에 실패했습니다.');
  }

  return response.data;
}

export async function register(
  userData: RegisterPayload
): Promise<RegisterResponse> {
  const response = await api.post<ApiResponse<RegisterResponse>>(
    '/auth/register',
    userData
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '회원가입에 실패했습니다.');
  }

  return response.data.data;
}

export async function sendRegisterCode(phoneNumber: string): Promise<{
  expiresAt: string;
  code?: string;
}> {
  const response = await api.post<
    ApiResponse<{ expiresAt: string; code: string }>
  >('/auth/register/send-code', { phoneNumber });

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '인증번호 발송에 실패했습니다.');
  }

  return response.data.data;
}

export async function verifyRegisterCode(params: {
  phoneNumber: string;
  verificationCode: string;
}): Promise<boolean> {
  const response = await api.post<ApiResponse<{ verified: boolean }>>(
    '/auth/register/verify-code',
    params
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '인증번호 검증에 실패했습니다.');
  }

  return response.data.data.verified;
}

export async function verifyToken(): Promise<{
  isValid: boolean;
  userId?: string;
  username?: string;
  expiresAt?: string;
  tokenType?: string;
  error?: string;
}> {
  try {
    const response = await api.get<
      ApiResponse<{
        isValid: boolean;
        userId: string;
        username: string;
        expiresAt: string;
        tokenType: string;
        error?: string;
      }>
    >('/auth/verify');

    if (!response.data.success || !response.data.data) {
      return {
        isValid: false,
        error: response.data.message || '토큰 검증에 실패했습니다.',
      };
    }

    return response.data.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      isValid: false,
      error:
        error instanceof Error
          ? error.message
          : '토큰 검증 중 오류가 발생했습니다.',
    };
  }
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ChangePasswordResult> {
  const { data } = await api.post<ChangePasswordResult>(
    '/users/change-password',
    payload
  );
  return data;
}

export async function sendLoginVerificationCode(): Promise<{
  expiresAt: string;
  code?: string;
}> {
  const response = await api.post<
    ApiResponse<{ expiresAt: string; code?: string }>
  >('/auth/login/send-code', {});

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '2차 인증번호 발송에 실패했습니다.'
    );
  }

  return response.data.data;
}

export async function verifyLoginCode(
  verificationCode: string
): Promise<boolean> {
  const response = await api.post<ApiResponse<{ verified: boolean }>>(
    '/auth/login/verify-code',
    { verificationCode }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '인증번호 검증에 실패했습니다.');
  }

  return response.data.data.verified;
}

// authApi 객체로도 export
export const authApi = {
  login,
  logout,
  logoutAll,
  refreshToken,
  getProfile,
  register,
  sendRegisterCode,
  verifyRegisterCode,
  verifyToken,
  changePassword,
  sendLoginVerificationCode,
  verifyLoginCode,
};

// tokenStorage도 re-export
export { tokenStorage };
