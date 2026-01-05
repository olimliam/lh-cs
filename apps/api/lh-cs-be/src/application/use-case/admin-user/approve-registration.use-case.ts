import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  UserApprovalStatusEnum,
  UserEntity,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

@Injectable()
export class ApproveRegistrationUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, approvedBy?: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.approvalStatus === UserApprovalStatusEnum.APPROVED) {
      return user;
    }

    if (user.approvalStatus !== UserApprovalStatusEnum.PENDING) {
      throw new ConflictException('가입 승인 대기 상태가 아닙니다.');
    }

    const approvalCompletedAt = new Date();

    const updated = await this.userRepository.update(userId, {
      approvalStatus: UserApprovalStatusEnum.APPROVED,
      status: UserStatusEnum.ACTIVE,
      lockedUntil: null,
      loginAttemptCount: 0,
      inactiveAt: null,
      approvalCompletedAt,
      approvalCompletedByUserId: approvedBy ?? null,
    });

    if (!updated) {
      throw new NotFoundException('Failed to update user');
    }

    return updated;
  }
}
