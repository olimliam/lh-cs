import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import { UserEntity, UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class InactivateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const inactiveAt = new Date();
    const sanitizedPhoneHash = this.generateRandomPhoneHash();

    await this.userRepository.update(userId, {
      status: UserStatusEnum.INACTIVE,
      inactiveAt,
      phoneHash: sanitizedPhoneHash,
      phoneEncrypted: null,
      phoneIv: null,
      phoneTag: null,
      phoneVerifiedAt: null,
      name: '중지된 사용자',
      department: null,
      profileImageUrl: null,
      loginAttemptCount: 0,
      lockedUntil: null,
    });

    const updatedUser = await this.userRepository.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    return updatedUser;
  }

  private generateRandomPhoneHash(): string {
    const randomValue = randomBytes(16).toString('hex');
    return this.phoneEncryptionService.hash(randomValue);
  }
}
