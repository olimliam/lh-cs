import { UserRoleEnum } from '@/shared/model/user-role.enum';
import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';
import { Pagination } from '../types/common.types';

export interface TotalUserSummary {
  activeCount: number;
  inactiveCount: number;
  deletedCount: number;
  lockedCount: number;
}
export interface AdminUser {
  id: string;
  username: string;
  name: string;
  department?: string;
  role: UserRoleEnum;
  status: UserStatusEnum;
  lockAt: string | null;
  lockStatus: UserLoginLockStatusEnum;
  inactiveAt: string | null;
  signedAt?: string | null;
  deletedAt?: string | null;
  // approvalStatus: UserApprovalStatusEnum;
  // loginAttemptCount: number;
  // lockedUntil?: string | null;
  // lastLoginAt?: string | null;
  // createdAt: string;
}

export interface GetAdminUsersResponse {
  users: AdminUser[];
  pagination: Pagination;
  summary: TotalUserSummary;
}

/**
 * TODO: state 값 대문자로 변경
 */
export interface AdminUserFilters {
  page?: number;
  limit?: number;
  statuses?: UserStatusEnum[];
  roles?: UserRoleEnum[];
  username?: string;
  name?: string;
  department?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  orderBy?: 'createdAt' | 'lastLoginAt' | 'name';
  orderDirection?: 'ASC' | 'DESC';
  state?: UserApprovalStatusEnum;
  phoneNumber?: string;
  approvalStatuses?: UserApprovalStatusEnum[];
}

export interface UpdateUserStatusPayload {
  status: UserStatusEnum;
  reason?: string;
}

export interface UpdateUserApprovalPayload {
  approvalStatus: UserApprovalStatusEnum;
}

export interface UpdateUserLockPayload {
  durationMinutes?: number;
}
