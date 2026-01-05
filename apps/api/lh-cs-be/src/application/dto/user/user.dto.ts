import {
  UserApprovalStatusEnum,
  UserLockStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

export enum AdminApprovalState {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface PendingRegistrationItem {
  userId: string;
  username: string;
  name: string;
  department?: string | null;
  phoneNumber?: string | null;
  signedAt: Date;
  approvedAt?: Date | null;
  approvedBy?: string | null; // 승인 처리 관리자 username
}

export interface RejectionHistoryItem {
  userId: string;
  username: string | null;
  department?: string | null;
  signedAt: Date;
  rejectedAt: Date;
  rejectedBy: string | null; // 거절 처리자 username
  reason?: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PendingRegistrationsResult {
  items: PendingRegistrationItem[];
  pagination: PaginationInfo;
}

export interface RejectionHistoryResult {
  items: RejectionHistoryItem[];
  pagination: PaginationInfo;
}

export interface CreateUserDto {
  name: string;
  username: string;
  password: string;
  phoneNumber: string;
  phoneVerifiedAt?: Date;
  role?: UserRoleEnum;
  profileImageUrl?: string;
  department?: string;
  approvalStatus?: UserApprovalStatusEnum;
  status?: UserStatusEnum;
  isConfirmedTerms?: boolean;
  signedAt?: Date;
}

export interface UpdateUserDto {
  username?: string;
  name?: string;
  profileImageUrl?: string | null;
  role?: UserRoleEnum;
  status?: UserStatusEnum;
  lastLoginAt?: Date;
  loginAttemptCount?: number;
  lockedUntil?: Date;
  lockReason?: string;
  lockState?: UserLockStatusEnum;
  passwordHash?: string;
  passwordSalt?: string;
  kdfAlgorithm?: string;
  kdfParams?: {
    algorithm: string;
    iterations: number;
    hashLength: number;
  };
  pepperVersion?: number;
  hashCreatedAt?: Date;
  department?: string;
  approvalStatus?: UserApprovalStatusEnum;
  phoneHash?: string;
  phoneEncrypted?: Buffer;
  phoneIv?: Buffer;
  phoneTag?: Buffer;
  phoneVerifiedAt?: Date | null;
  signedAt?: Date | null;
}
