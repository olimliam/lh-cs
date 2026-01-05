import { BadRequestException, Injectable } from '@nestjs/common';
import {
  UserApprovalStatusEnum,
  UserEntity,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { ApproveRegistrationUseCase } from '../admin-user/approve-registration.use-case';
import { RejectRegistrationUseCase } from '../admin-user/reject-registration.use-case';
import { UserRepository } from '../../../infrastructure/repository/user.repository';

@Injectable()
export class UpdateUserApprovalStatusUseCase {
  constructor(
    private readonly approveRegistrationUseCase: ApproveRegistrationUseCase,
    private readonly rejectRegistrationUseCase: RejectRegistrationUseCase,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: string,
    approvalStatus: UserApprovalStatusEnum,
    actorId?: string,
    reason?: string
  ): Promise<UserEntity> {
    if (approvalStatus === UserApprovalStatusEnum.APPROVED) {
      if (!actorId) {
        throw new BadRequestException('승인 처리자의 정보가 필요합니다.');
      }
      return this.approveRegistrationUseCase.execute(userId, actorId);
    }

    if (approvalStatus === UserApprovalStatusEnum.REJECTED) {
      if (!actorId) {
        throw new BadRequestException('거절 처리자의 정보가 필요합니다.');
      }
      return this.rejectRegistrationUseCase.execute(
        userId,
        actorId,
        reason ?? null
      );
    }

    const updated = await this.userRepository.update(userId, {
      approvalStatus: UserApprovalStatusEnum.PENDING,
      status: UserStatusEnum.INACTIVE,
      inactiveAt: new Date(),
      approvalCompletedAt: null,
      approvalCompletedByUserId: null,
    });

    if (!updated) {
      throw new BadRequestException('Failed to update user approval status');
    }

    return updated;
  }
}
