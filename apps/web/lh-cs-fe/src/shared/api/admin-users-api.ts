import { api } from './api-client';
import type {
  AdminUserFilters,
  GetAdminUsersResponse,
  UpdateUserApprovalPayload,
  UpdateUserLockPayload,
  UpdateUserStatusPayload,
} from '../model/admin-users.dto';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';
import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import { CommonResponse } from '../types/common-response.types';
import { UserRoleEnum } from '../model/user-role.enum';

type FilterParams = Record<string, string | string[]>;

const sanitizeFilters = (filters: AdminUserFilters = {}): FilterParams => {
  const params: FilterParams = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      const normalized = value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);

      if (normalized.length === 0) {
        return;
      }

      params[key] = normalized;
      return;
    }

    const stringValue = String(value);

    if (stringValue === '') {
      return;
    }

    params[key] = stringValue;
  });

  return params;
};

const serializeFilterParams = (params: FilterParams): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((val) => searchParams.append(key, val));
    } else {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

export async function fetchAdminUsers(
  filters: AdminUserFilters = {}
): Promise<GetAdminUsersResponse> {
  const response = await api.get<CommonResponse<GetAdminUsersResponse>>(
    '/admin/users',
    {
      params: sanitizeFilters(filters),
      paramsSerializer: (params) =>
        serializeFilterParams(params as FilterParams),
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 목록을 불러오지 못했습니다.'
    );
  }

  return response.data.data;
}
export interface CommonUserInfoResponse {
  id: string;
  username: string;
  name: string;
  department: string;
  phoneNumber: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  approvalStatus: UserApprovalStatusEnum;
  profileImageUrl: string | null;
  updatedAt: string | null;
}
export interface GetUserIdInfoResponse extends CommonUserInfoResponse {
  inactiveAt: string | null;
  signedAt: string | null;
  approvedAt: string | null;
  lastLoginAt: string | null;
  loginAttemptCount: number;
  lockStatus: UserLoginLockStatusEnum;
  lockAt: string | null;
  lockedUntil: string | null;
  createdAt: string | null;
  deletedAt: string | null;
}

export async function getIdAdminUserInfo(
  id: string
): Promise<GetUserIdInfoResponse> {
  const response = await api.get<CommonResponse<GetUserIdInfoResponse>>(
    `/admin/users/${id}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 정보를 불러오지 못했습니다.'
    );
  }

  return response.data.data;
}

export interface PutUserIdInfoPayload {
  // id: string;
  username: string;
  name: string;
  department: string;
  phoneNumber: string;
  profileImageUrl: string | null;
  role: UserRoleEnum;
  status: UserStatusEnum;
  approvalStatus: UserApprovalStatusEnum;
  isEditProfileImage: boolean;
  profileImage?: File | null;
}
export type PutUserIdInfoResponse = CommonUserInfoResponse;

export async function updateUserInfo(
  id: string,
  payload: PutUserIdInfoPayload
): Promise<CommonUserInfoResponse> {
  console.log('put?');
  const response = await api.put<CommonResponse<CommonUserInfoResponse>>(
    `/admin/users/${id}`,
    payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 정보 수정에 실패했습니다.'
    );
  }

  return response.data.data;
}

export interface UserPasswordPayload {
  newPassword: string;
  reason?: string;
}
export interface UserPasswordResponse {
  userId: string;
  changedAt: string;
  changedBy: string;
}

export async function updateUserPassword(
  id: string,
  payload: UserPasswordPayload
): Promise<UserPasswordResponse> {
  const response = await api.put<CommonResponse<UserPasswordResponse>>(
    `/admin/users/${id}/password`,
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 비밀번호 수정에 실패했습니다.'
    );
  }

  return response.data.data;
}

export interface UpdateUserStatusResult {
  id: string;
  status: UserStatusEnum;
  inactiveAt?: string | null;
  updatedAt: string;
}

export async function updateAdminUserStatus(
  id: string,
  payload: UpdateUserStatusPayload
): Promise<UpdateUserStatusResult> {
  const response = await api.put<CommonResponse<UpdateUserStatusResult>>(
    `/admin/users/${id}/status`,
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 상태 변경에 실패했습니다.'
    );
  }

  return response.data.data;
}

export interface PostUserStatusResult {
  id: string;
  status: UserStatusEnum;
  username: string;
  name: string;
  inactiveAt: string | null;
  updatedAt: string;
}

export async function postAdminUserStatus(
  id: string
): Promise<PostUserStatusResult> {
  const response = await api.post<CommonResponse<PostUserStatusResult>>(
    `/admin/users/${id}/inactivate`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 상태 변경에 실패했습니다.'
    );
  }

  return response.data.data;
}

export interface UpdateUserApprovalResult {
  id: string;
  approvalStatus: UserApprovalStatusEnum;
  status: UserStatusEnum;
  inactiveAt?: string | null;
  updatedAt: string;
}

export async function updateAdminUserApproval(
  id: string,
  payload: UpdateUserApprovalPayload
): Promise<UpdateUserApprovalResult> {
  const response = await api.put<CommonResponse<UpdateUserApprovalResult>>(
    `/admin/users/${id}/approval`,
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || '승인 상태 변경에 실패했습니다.');
  }

  return response.data.data;
}

export interface UpdateUserLockResult {
  id: string;
  lockedUntil?: string | null;
  loginAttemptCount: number;
  updatedAt: string;
}

export async function lockAdminUser(
  id: string,
  payload: UpdateUserLockPayload
): Promise<UpdateUserLockResult> {
  const response = await api.put<CommonResponse<UpdateUserLockResult>>(
    `/admin/users/${id}/lock`,
    payload
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 계정 잠금에 실패했습니다.'
    );
  }

  return response.data.data;
}

export async function unlockAdminUser(
  id: string
): Promise<UpdateUserLockResult> {
  const response = await api.delete<CommonResponse<UpdateUserLockResult>>(
    `/admin/users/${id}/lock`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '사용자 계정 잠금 해제에 실패했습니다.'
    );
  }

  return response.data.data;
}

/**
 * TODO: state 값 대문자로 변경 요청
 */
export interface GetUsersApprovalListParams {
  page?: number; // 페이지 번호 (기본값: 1)
  limit?: number; // 페이지 크기 (기본값: 20)
  orderBy?: string; // 정렬 기준 필드
  orderDirection?: 'ASC' | 'DESC'; // 정렬 방향 (기본값: DESC)
  state?: UserApprovalStatusEnum; // 조회할 승인 상태
  username?: string; // 아이디 검색 (부분 일치)
  name?: string; // 이름 검색 (부분 일치)
  department?: string; // 부서 검색 (부분 일치)
}

export interface GetUsersApprovalListResponse {
  items: Array<{
    userId: string;
    name?: string;
    username?: string;
    department: string;
    phoneNumber: string;
    signedAt: string;
    approvedAt?: string;
    approvedBy?: string;
    rejectedAt?: string;
    rejectedBy?: string | null;
    reason?: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 승인 대기 중인 사용자 목록 조회
 * @param params - 조회 파라미터 (페이지, 정렬, 필터)
 * @returns 승인 대기 사용자 목록 및 페이지네이션 정보
 */
export async function getAdminUsersApprovalList(
  params: GetUsersApprovalListParams = {}
): Promise<GetUsersApprovalListResponse> {
  // ✅ 기본값 설정
  const defaultParams: GetUsersApprovalListParams = {
    page: 1,
    limit: 20,
    // orderBy: 'createdAt',
    orderDirection: 'DESC',
    // state: UserApprovalStatusEnum.PENDING,
    state: UserApprovalStatusEnum.PENDING,
    ...params,
  };

  const response = await api.get<CommonResponse<GetUsersApprovalListResponse>>(
    '/admin/users/approvals',
    {
      params: sanitizeFilters(defaultParams as any),
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message || '승인 사용자 목록을 불러오지 못했습니다.'
    );
  }

  return response.data.data;
}
