import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  PendingRegistrationItem,
  PendingRegistrationsResult,
} from '../../dto/user/user.dto';
import { decryptPhoneNumber } from '../../service/user-phone.helper';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import {
  UserApprovalStatusEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

@Injectable()
export class GetPendingRegistrationsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(
    page = 1,
    limit = 20,
    filters?: {
      username?: string;
      name?: string;
      department?: string;
    },
    approvalStatus: UserApprovalStatusEnum = UserApprovalStatusEnum.PENDING
  ): Promise<PendingRegistrationsResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const statusFilter =
      approvalStatus === UserApprovalStatusEnum.PENDING
        ? UserStatusEnum.WAIT
        : undefined;

    const { users, total } = await this.userRepository.findAll({
      page: safePage,
      limit: safeLimit,
      approvalStatus,
      ...(filters?.username ? { username: filters.username } : {}),
      ...(filters?.name ? { name: filters.name } : {}),
      ...(filters?.department ? { department: filters.department } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });

    const approverIds = Array.from(
      new Set(
        users
          .map((user) => user.approvalCompletedByUserId)
          .filter((id): id is string => Boolean(id))
      )
    );

    const approvers = await this.userRepository.findByIds(approverIds);
    const approverMap = new Map(
      approvers.map((user) => [user.id, user.username])
    );

    const items: PendingRegistrationItem[] = users.map((user) => ({
      userId: user.id,
      username: user.username,
      name: user.name,
      department: user.department ?? null,
      phoneNumber: decryptPhoneNumber(this.phoneEncryptionService, user),
      signedAt: (user as any).signedAt ?? user.createdAt,
      approvedAt: user.approvalCompletedAt ?? null,
      approvedBy: user.approvalCompletedByUserId
        ? (approverMap.get(user.approvalCompletedByUserId) ?? null)
        : null,
    }));

    return {
      items,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: safeLimit ? Math.max(1, Math.ceil(total / safeLimit)) : 1,
      },
    };
  }
}
