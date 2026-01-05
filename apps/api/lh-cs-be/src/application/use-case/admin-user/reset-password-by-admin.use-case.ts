import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class ResetPasswordByAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly kcmvpCrypto: KcmvpCryptoUtil
  ) {}

  async execute(
    userId: string,
    adminId: string,
    passwordLength: number,
    reason?: string
  ): Promise<{
    temporaryPassword: string;
    passwordStrength: number;
    passwordStrengthText: string;
  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const temporaryPassword =
      PasswordValidator.generateValidatedPassword(passwordLength);

    const passwordStrength =
      PasswordValidator.getStrengthLevel(temporaryPassword);
    const passwordStrengthText =
      PasswordValidator.getStrengthText(passwordStrength);

    const salt = this.kcmvpCrypto.generateSalt();
    const hashResult = await this.kcmvpCrypto.derivePasswordHash(
      temporaryPassword,
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
      `Password reset by admin ${adminId} for user ${userId}. Reason: ${
        reason || 'Admin initiated'
      }. Strength: ${passwordStrengthText}. Algorithm: ${hashResult.kdfAlgo}`
    );

    return {
      temporaryPassword,
      passwordStrength,
      passwordStrengthText,
    };
  }
}
