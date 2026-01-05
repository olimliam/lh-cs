import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class SoftDeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedAt = new Date();
    await this.userRepository.update(userId, {
      status: UserStatusEnum.DELETED,
      deletedAt,
      phoneHash: null as any,
      phoneEncrypted: null,
      phoneIv: null,
      phoneTag: null,
      phoneVerifiedAt: null,
      name: '삭제된 사용자',
      department: null,
      profileImageUrl: null,
    });

    await this.userRepository.softDelete(userId);
  }
}
