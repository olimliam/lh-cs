import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { PasswordValidationException } from '../../../common/exception/password-validation.exception';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class ChangePasswordByAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly kcmvpCrypto: KcmvpCryptoUtil
  ) {}

  async execute(
    userId: string,
    newPassword: string,
    adminId: string,
    reason?: string
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new PasswordValidationException(passwordValidation.errors);
    }

    const hasPasswordData =
      user.passwordHash &&
      user.passwordSalt &&
      user.kdfParams &&
      user.pepperVersion;

    if (hasPasswordData) {
      const isSamePassword = await this.kcmvpCrypto.verifyPassword(
        newPassword,
        user.passwordHash,
        user.passwordSalt,
        user.kdfParams,
        user.pepperVersion
      );

      if (isSamePassword) {
        throw new BadRequestException(
          '새 비밀번호는 기존 비밀번호와 달라야 합니다.'
        );
      }
    }

    const salt = this.kcmvpCrypto.generateSalt();
    const hashResult = await this.kcmvpCrypto.derivePasswordHash(
      newPassword,
      salt
    );

    await this.userRepository.update(userId, {
      passwordHash: hashResult.hash,
      passwordSalt: hashResult.salt,
      kdfAlgorithm: hashResult.kdfAlgo,
      kdfParams: hashResult.kdfParams,
      pepperVersion: hashResult.pepperVersion,
      hashCreatedAt: hashResult.hashCreatedAt,
      status: UserStatusEnum.PASSWORD_CHANGE_REQUIRED,
    });

    console.log(
      `Password changed by admin ${adminId} for user ${userId}. Reason: ${reason}. Algorithm: ${hashResult.kdfAlgo}`
    );
  }
}
