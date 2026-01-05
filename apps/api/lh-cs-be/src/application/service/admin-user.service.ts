import {
  UserApprovalStatusEnum,
  UserEntity,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import {
  AdminApprovalState,
  CreateUserDto,
  PendingRegistrationsResult,
  RejectionHistoryResult,
} from '../dto/user/user.dto';
import {
  ApproveRegistrationUseCase,
  ChangePasswordByAdminUseCase,
  CreateUserByAdminUseCase,
  GetLoginHistoryUseCase,
  GetPendingRegistrationsUseCase,
  GetRejectionHistoryUseCase,
  LockAccountByAdminUseCase,
  RejectRegistrationUseCase,
  ResetPasswordByAdminUseCase,
  SoftDeleteUserUseCase,
  InactivateUserUseCase,
  UnlockAccountByAdminUseCase,
  UpdateUserApprovalStatusUseCase,
  UpdateUserStatusUseCase,
} from '../use-case/admin-user';
import {
  FindUsersOptions,
  FindUsersUseCase,
} from '../use-case/user/find-users.use-case';
import { PhoneEncryptionService } from './phone-encryption.service';
import { decryptPhoneNumber } from './user-phone.helper';

interface AdminUserListOptions {
  page?: number;
  limit?: number;
  statuses?: UserStatusEnum[];
  roles?: UserRoleEnum[];
  phoneNumber?: string;
  approvalStatuses?: UserApprovalStatusEnum[];
  username?: string;
  name?: string;
  department?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class AdminUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly findUsersUseCase: FindUsersUseCase,
    private readonly getPendingRegistrationsUseCase: GetPendingRegistrationsUseCase,
    private readonly getRejectionHistoryUseCase: GetRejectionHistoryUseCase,
    private readonly approveRegistrationUseCase: ApproveRegistrationUseCase,
    private readonly rejectRegistrationUseCase: RejectRegistrationUseCase,
    private readonly createUserByAdminUseCase: CreateUserByAdminUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly updateUserApprovalStatusUseCase: UpdateUserApprovalStatusUseCase,
    private readonly changePasswordByAdminUseCase: ChangePasswordByAdminUseCase,
    private readonly resetPasswordByAdminUseCase: ResetPasswordByAdminUseCase,
    private readonly lockAccountByAdminUseCase: LockAccountByAdminUseCase,
    private readonly unlockAccountByAdminUseCase: UnlockAccountByAdminUseCase,
    private readonly getLoginHistoryUseCase: GetLoginHistoryUseCase,
    private readonly softDeleteUserUseCase: SoftDeleteUserUseCase,
    private readonly inactivateUserUseCase: InactivateUserUseCase,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  getUserPhoneNumber(
    user: Pick<UserEntity, 'phoneEncrypted' | 'phoneIv' | 'phoneTag'> | null
  ): string | null {
    if (!user) {
      return null;
    }
    return decryptPhoneNumber(this.phoneEncryptionService, user);
  }

  async findAll(options?: FindUsersOptions) {
    return this.findUsersUseCase.execute(options);
  }

  async getUsersForAdmin(options: AdminUserListOptions) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;

    const providedRoles =
      options.roles && options.roles.length > 0
        ? Array.from(
            new Set(
              options.roles.filter(
                (role): role is UserRoleEnum =>
                  role !== undefined && role !== null
              )
            )
          )
        : undefined;

    const filteredRoles =
      providedRoles?.filter((role) => role !== UserRoleEnum.SUPER_ADMIN) ??
      undefined;

    if (providedRoles && (!filteredRoles || filteredRoles.length === 0)) {
      return {
        users: [],
        total: 0,
        totalPages: 1,
        page,
        limit,
        summary: {
          activeCount: 0,
          inactiveCount: 0,
          lockedCount: 0,
        },
      };
    }

    const normalizedRole =
      filteredRoles && filteredRoles.length === 1
        ? filteredRoles[0]
        : undefined;

    const multiRoleFilter =
      filteredRoles && filteredRoles.length > 1 ? filteredRoles : undefined;

    const shouldUseDefaultRoles = !filteredRoles || filteredRoles.length === 0;

    const allowedRoles = shouldUseDefaultRoles
      ? [UserRoleEnum.ADMIN, UserRoleEnum.CONSULTANT]
      : undefined;

    const statusFilters =
      options.statuses && options.statuses.length > 0
        ? Array.from(new Set(options.statuses))
        : undefined;

    const approvalFilters =
      options.approvalStatuses && options.approvalStatuses.length > 0
        ? Array.from(new Set(options.approvalStatuses))
        : undefined;

    const { users, total, totalPages, summary } =
      await this.findUsersUseCase.execute({
        page,
        limit,
        statuses: statusFilters,
        approvalStatuses: approvalFilters,
        phoneNumber: options.phoneNumber,
        username: options.username,
        name: options.name,
        department: options.department,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        role: normalizedRole,
        roles: multiRoleFilter,
        allowedRoles,
        excludeRoles: [UserRoleEnum.SUPER_ADMIN],
      });

    return {
      users,
      total,
      totalPages,
      page,
      limit,
      summary,
    };
  }

  async getApprovals(
    state: AdminApprovalState,
    page = 1,
    limit = 20,
    filters?: {
      username?: string;
      name?: string;
      department?: string;
    }
  ): Promise<PendingRegistrationsResult | RejectionHistoryResult> {
    switch (state) {
      case AdminApprovalState.APPROVED:
        return this.getPendingRegistrationsUseCase.execute(
          page,
          limit,
          filters,
          UserApprovalStatusEnum.APPROVED
        );
      case AdminApprovalState.REJECTED:
        return this.getRejectionHistoryUseCase.execute(
          page,
          limit,
          filters
        );
      case AdminApprovalState.PENDING:
      default:
        return this.getPendingRegistrationsUseCase.execute(
          page,
          limit,
          filters,
          UserApprovalStatusEnum.PENDING
        );
    }
  }

  async approveRegistration(
    userId: string,
    adminId?: string
  ): Promise<UserEntity> {
    return this.approveRegistrationUseCase.execute(userId, adminId);
  }

  async rejectRegistration(
    userId: string,
    rejectedBy: string,
    reason?: string | null
  ): Promise<UserEntity> {
    return this.rejectRegistrationUseCase.execute(userId, rejectedBy, reason);
  }

  async createByAdmin(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.createUserByAdminUseCase.execute(createUserDto);
  }

  async updateStatus(
    userId: string,
    status: UserStatusEnum
  ): Promise<UserEntity> {
    return this.updateUserStatusUseCase.execute(userId, status);
  }

  async updateApprovalStatus(
    userId: string,
    approvalStatus: UserApprovalStatusEnum,
    actorId?: string,
    reason?: string
  ): Promise<UserEntity> {
    return this.updateUserApprovalStatusUseCase.execute(
      userId,
      approvalStatus,
      actorId,
      reason
    );
  }

  async changePasswordByAdmin(
    userId: string,
    newPassword: string,
    adminId: string,
    reason?: string
  ): Promise<void> {
    await this.changePasswordByAdminUseCase.execute(
      userId,
      newPassword,
      adminId,
      reason
    );
  }

  async resetPasswordByAdmin(
    userId: string,
    adminId: string,
    passwordLength: number = 12,
    reason?: string
  ) {
    return this.resetPasswordByAdminUseCase.execute(
      userId,
      adminId,
      passwordLength,
      reason
    );
  }

  async lockAccountByAdmin(
    userId: string,
    durationMinutes?: number
  ): Promise<UserEntity> {
    return this.lockAccountByAdminUseCase.execute(userId, durationMinutes);
  }

  async unlockAccountByAdmin(userId: string): Promise<UserEntity> {
    return this.unlockAccountByAdminUseCase.execute(userId);
  }

  async getLoginHistory(userId: string) {
    return this.getLoginHistoryUseCase.execute(userId);
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteUserUseCase.execute(id);
  }

  async inactivateUser(userId: string): Promise<UserEntity> {
    return this.inactivateUserUseCase.execute(userId);
  }
}
