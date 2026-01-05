import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserRegistrationRejectionRepository } from '../../../infrastructure/repository/user-registration-rejection.repository';
import {
  UserApprovalStatusEnum,
  UserEntity,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { randomBytes } from 'crypto';

@Injectable()
export class RejectRegistrationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rejectionRepository: UserRegistrationRejectionRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(
    userId: string,
    rejectedBy: string,
    reason?: string | null
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.approvalStatus === UserApprovalStatusEnum.REJECTED) {
      throw new ConflictException('이미 거절된 사용자입니다.');
    }

    const rejectionTime = new Date();

    await this.rejectionRepository.createHistory({
      userId: user.id,
      department: user.department ?? null,
      signedAt: (user as any).signedAt ?? user.createdAt,
      rejectedAt: rejectionTime,
      rejectedBy,
      reason: reason ?? null,
    });

    const sanitizedPhoneHash = this.generateRandomPhoneHash();

    await this.userRepository.update(userId, {
      approvalStatus: UserApprovalStatusEnum.REJECTED,
      status: UserStatusEnum.INACTIVE,
      inactiveAt: rejectionTime,
      approvalCompletedAt: null,
      approvalCompletedByUserId: null,
      phoneHash: sanitizedPhoneHash,
      phoneEncrypted: null,
      phoneIv: null,
      phoneTag: null,
      phoneVerifiedAt: null,
      department: null,
      profileImageUrl: null,
      name: '거절된 사용자',
      loginAttemptCount: 0,
      lockedUntil: null,
    });

    const updated = await this.userRepository.findById(userId);
    if (!updated) {
      throw new NotFoundException('Failed to update user');
    }

    return updated;
  }

  private generateRandomPhoneHash(): string {
    const randomValue = randomBytes(16).toString('hex');
    return this.phoneEncryptionService.hash(randomValue);
  }
}
