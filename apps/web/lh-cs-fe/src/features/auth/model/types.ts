import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { UserStatusEnum } from '@/shared/model/user-status.enum';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  approvalStatus: UserApprovalStatusEnum;
  profileImageUrl?: string;
  department?: string;
  phoneNumber: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 백엔드 API 응답 형식
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  csrfToken?: string;
  passwordChangeRequired: boolean;
  user: AuthUser;
}

export interface RegisterResponse {
  id: string;
  username: string;
  name: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  approvalStatus: UserApprovalStatusEnum;
}

export interface RegisterPayload {
  name: string;
  username: string;
  phoneNumber: string;
  verificationCode: string;
  role?: UserRoleEnum;
  department?: string;
  password: string;
  confirmPassword: string;
  isConfirmedTerms: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordChangeRequired: boolean;
}

export interface LoginFormState {
  username: string;
  password: string;
  showPassword: boolean;
  isSubmitting: boolean;
  errors: {
    username?: string;
    password?: string;
    general?: string;
  };
}
