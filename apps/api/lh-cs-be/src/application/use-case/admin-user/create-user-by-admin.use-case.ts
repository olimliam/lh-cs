import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  CreateUserDto,
} from '../../dto/user/user.dto';
import { PasswordValidator } from '../../../common/utils/password-validator.util';
import { PasswordValidationException } from '../../../common/exception/password-validation.exception';
import { KcmvpCryptoUtil } from '../../../common/utils/kcmvp-crypto.util';
import { PhoneEncryptionService } from '../../service/phone-encryption.service';
import {
  UserApprovalStatusEnum,
  UserEntity,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { normalizePhoneNumber } from '../../service/user-phone.helper';

@Injectable()
export class CreateUserByAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly kcmvpCrypto: KcmvpCryptoUtil,
    private readonly phoneEncryptionService: PhoneEncryptionService
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByUsername(
      createUserDto.username
    );
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const passwordValidation = PasswordValidator.validate(
      createUserDto.password
    );
    if (!passwordValidation.isValid) {
      throw new PasswordValidationException(passwordValidation.errors);
    }

    const salt = this.kcmvpCrypto.generateSalt();
    const hashResult = await this.kcmvpCrypto.derivePasswordHash(
      createUserDto.password,
      salt
    );

    const normalizedPhone = normalizePhoneNumber(
      createUserDto.phoneNumber
    );
    const phonePayload =
      this.phoneEncryptionService.encrypt(normalizedPhone);

    const targetStatus = createUserDto.status ?? UserStatusEnum.ACTIVE;
    const targetApprovalStatus =
      createUserDto.approvalStatus ?? UserApprovalStatusEnum.APPROVED;
    const approvalCompletedAt =
      targetApprovalStatus === UserApprovalStatusEnum.APPROVED
        ? new Date()
        : null;
    const inactiveAt =
      targetStatus === UserStatusEnum.INACTIVE ? new Date() : null;

    const userData = {
      ...createUserDto,
      passwordHash: hashResult.hash,
      passwordSalt: hashResult.salt,
      kdfAlgorithm: hashResult.kdfAlgo,
      kdfParams: hashResult.kdfParams,
      pepperVersion: hashResult.pepperVersion,
      hashCreatedAt: hashResult.hashCreatedAt,
      phoneHash: phonePayload.hash,
      phoneNumber: undefined,
      phoneEncrypted: phonePayload.encrypted,
      phoneIv: phonePayload.iv,
      phoneTag: phonePayload.authTag,
      phoneVerifiedAt: createUserDto.phoneVerifiedAt ?? new Date(),
      password: undefined,
      status: targetStatus,
      approvalStatus: targetApprovalStatus,
      approvalCompletedAt,
      approvalCompletedByUserId: null,
      signedAt: createUserDto.signedAt ?? new Date(),
      inactiveAt,
    };

    return this.userRepository.create(userData);
  }
}
