import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  UserEntity,
  UserRoleEnum,
} from '@/infrastructure/repository/entity';
import { UserRepository } from '@/infrastructure/repository/user.repository';
import {
  UpdateUserUseCase,
  UpdateUserUseCasePayload,
} from '@/application/use-case/user';

@Injectable()
export class UpdateUserByAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly updateUserUseCase: UpdateUserUseCase
  ) {}

  private isManagedRole(role: UserRoleEnum): boolean {
    return (
      role === UserRoleEnum.ADMIN || role === UserRoleEnum.CONSULTANT
    );
  }

  async execute(
    userId: string,
    payload: UpdateUserUseCasePayload
  ): Promise<UserEntity> {
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (!this.isManagedRole(targetUser.role)) {
      throw new BadRequestException(
        'ADMIN 또는 CONSULTANT 사용자만 수정할 수 있습니다.'
      );
    }

    if (
      typeof payload.role !== 'undefined' &&
      !this.isManagedRole(payload.role)
    ) {
      throw new BadRequestException(
        '사용자 역할은 ADMIN 또는 CONSULTANT만 설정할 수 있습니다.'
      );
    }

    return this.updateUserUseCase.execute(userId, payload);
  }
}
