import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  UserApprovalStatusEnum,
  UserEntity,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { normalizePhoneNumber } from '../../service/user-phone.helper';

export interface FindUsersOptions {
  page?: number;
  limit?: number;
  status?: UserStatusEnum;
  statuses?: UserStatusEnum[];
  excludeStatuses?: UserStatusEnum[];
  role?: UserRoleEnum;
  roles?: UserRoleEnum[];
  username?: string;
  name?: string;
  department?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  approvalStatus?: UserApprovalStatusEnum;
  approvalStatuses?: UserApprovalStatusEnum[];
  phoneNumber?: string;
  allowedRoles?: UserRoleEnum[];
  excludeRoles?: UserRoleEnum[];
}

export interface UserStatusSummary {
  activeCount: number;
  inactiveCount: number;
  lockedCount: number;
}

@Injectable()
export class FindUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(
    options?: FindUsersOptions
  ): Promise<{
    users: UserEntity[];
    total: number;
    totalPages: number;
    summary: UserStatusSummary;
  }> {
    const phoneHash = options?.phoneNumber
      ? this.phoneEncryptionService.hash(
          normalizePhoneNumber(options.phoneNumber)
        )
      : undefined;

    const { phoneNumber, ...restOptions } = options ?? {};

    const findOptions = {
      ...restOptions,
      phoneHash,
    };

    const hasStatusFilters =
      (findOptions.statuses && findOptions.statuses.length > 0) ||
      findOptions.status !== undefined;

    const excludeStatuses =
      findOptions.excludeStatuses && findOptions.excludeStatuses.length > 0
        ? findOptions.excludeStatuses
        : hasStatusFilters
          ? undefined
          : [UserStatusEnum.WAIT, UserStatusEnum.DELETED];

    const { users, total } = await this.userRepository.findAll({
      ...findOptions,
      excludeStatuses,
    });

    const countOptions = { ...findOptions, excludeStatuses };
    const summaryExcludeStatuses = excludeStatuses;

    const rawSummary = await this.userRepository.countStatusAndLockStates({
      ...countOptions,
      excludeStatuses: summaryExcludeStatuses,
    });

    const summary: UserStatusSummary = {
      activeCount: Math.max(
        0,
        (rawSummary?.activeCount ?? 0) - (rawSummary?.lockedCount ?? 0)
      ),
      inactiveCount: rawSummary?.inactiveCount ?? 0,
      lockedCount: rawSummary?.lockedCount ?? 0,
    };

    const limit = options?.limit;
    const totalPages = limit ? Math.max(1, Math.ceil(total / limit)) : 1;

    return { users, total, totalPages, summary };
  }
}
