import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { ConfigService } from '@nestjs/config';
import { UserEntity, UserLockStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class LockAccountByAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService
  ) {}

  async execute(userId: string, durationMinutes?: number): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const lockDuration =
      durationMinutes ??
      this.configService.get<number>('ACCOUNT_LOCK_DURATION_MINUTES', 30);

    const lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);

    const updated = await this.userRepository.update(userId, {
      lockedUntil,
      lockAt: new Date(),
      loginAttemptCount:
        user.loginAttemptCount && user.loginAttemptCount > 0
          ? user.loginAttemptCount
          : this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5),
      lockReason: 'Locked by admin',
      lockState: UserLockStatusEnum.LOCKED,
    });

    if (!updated) {
      throw new NotFoundException('Failed to update user');
    }

    return updated;
  }
}
