import { HttpStatus, Injectable } from '@nestjs/common';
import { CustomException } from '@/common/exception/custom.exception';
import { UserErrorCode } from '@/common/exception/error/user-error-code.enum';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import { ChangePasswordCommand } from '../../dto/command/change-password.command';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { PasswordValidationException } from '../../../common/exception/password-validation.exception';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { UserEntity, UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly kcmvpCrypto: KcmvpCryptoUtil
  ) {}

  async execute({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordCommand): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomException(
        UserErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    if (!this.hasPasswordData(user)) {
      throw new CustomException(
        UserErrorCode.USER_PASSWORD_DATA_INCOMPLETE,
        HttpStatus.BAD_REQUEST
      );
    }

    const isCurrentPasswordValid = await this.kcmvpCrypto.verifyPassword(
      currentPassword,
      user.passwordHash,
      user.passwordSalt,
      user.kdfParams,
      user.pepperVersion
    );
    if (!isCurrentPasswordValid) {
      throw new CustomException(
        UserErrorCode.USER_PASSWORD_INCORRECT,
        HttpStatus.BAD_REQUEST
      );
    }

    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new PasswordValidationException(passwordValidation.errors);
    }

    const isSamePassword = await this.kcmvpCrypto.verifyPassword(
      newPassword,
      user.passwordHash,
      user.passwordSalt,
      user.kdfParams,
      user.pepperVersion
    );
    if (isSamePassword) {
      throw new CustomException(
        UserErrorCode.USER_PASSWORD_SAME_AS_BEFORE,
        HttpStatus.BAD_REQUEST
      );
    }

    const salt = this.kcmvpCrypto.generateSalt();
    const hashResult = await this.kcmvpCrypto.derivePasswordHash(
      newPassword,
      salt
    );

    const updatePayload: Partial<UserEntity> = {
      passwordHash: hashResult.hash,
      passwordSalt: hashResult.salt,
      kdfAlgorithm: hashResult.kdfAlgo,
      kdfParams: hashResult.kdfParams,
      pepperVersion: hashResult.pepperVersion,
      hashCreatedAt: hashResult.hashCreatedAt,
    };

    if (user.status === UserStatusEnum.PASSWORD_CHANGE_REQUIRED) {
      updatePayload.status = UserStatusEnum.ACTIVE;
    }

    await this.userRepository.update(userId, updatePayload);
  }

  private hasPasswordData(
    user: UserEntity
  ): user is UserEntity &
    Required<
      Pick<
        UserEntity,
        'passwordHash' | 'passwordSalt' | 'kdfParams' | 'pepperVersion'
      >
    > {
    return Boolean(
      user.passwordHash &&
        user.passwordSalt &&
        user.kdfParams &&
        user.pepperVersion
    );
  }
}
