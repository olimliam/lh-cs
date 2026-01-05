import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserEntity, UserLockStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class UnlockAccountByAdminUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.userRepository.update(userId, {
      lockedUntil: null,
      lockAt: null,
      loginAttemptCount: 0,
      lockReason: 'Unlocked by admin',
      lockState: UserLockStatusEnum.UNLOCKED,
    });

    if (!updated) {
      throw new NotFoundException('Failed to update user');
    }

    return updated;
  }
}
