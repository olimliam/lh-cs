import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserEntity, UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, status: UserStatusEnum): Promise<UserEntity> {
    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const updatePayload: Partial<UserEntity> = { status };

    if (status === UserStatusEnum.INACTIVE) {
      updatePayload.inactiveAt = new Date();
    } else if (currentUser.status === UserStatusEnum.INACTIVE) {
      updatePayload.inactiveAt = null;
    }

    const updated = await this.userRepository.update(userId, updatePayload);
    if (!updated) {
      throw new NotFoundException('User not found');
    }
    return updated;
  }
}
