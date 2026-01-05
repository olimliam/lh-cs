import {
  UserApprovalStatusEnum,
  UserEntity,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';
import { UpdateProfileRequest } from '@/presentation/dto/request/update-profile.request';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomException } from '../../common/exception/custom.exception';
import { UserErrorCode } from '../../common/exception/error';
import { PasswordValidationException } from '../../common/exception/password-validation.exception';
import { KcmvpCryptoUtil } from '../../common/utils/kcmvp-crypto.util';
import { PasswordValidator } from '../../common/utils/password-validator.util';
import { UserSessionRepository } from '../../infrastructure/repository/user-session.repository';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { ChangePasswordCommand } from '../dto/command/change-password.command';
import { CreateUserDto, UpdateUserDto } from '../dto/user/user.dto';
import { PhoneEncryptionService } from './phone-encryption.service';
import { IpEncryptionService } from './ip-encryption.service';
import { decryptPhoneNumber, normalizePhoneNumber } from './user-phone.helper';

import {
  ChangePasswordUseCase,
  GetProfileWithPhoneUseCase,
  GetUserSessionsUseCase,
  UpdateProfileUseCase,
  UpdateUserUseCase,
  UpdateUserUseCasePayload,
} from '../use-case/user';
import { RemoveUnusedProfileImagesUseCase } from '../use-case/user/remove-unused-profile-images.use-case';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userSessionRepository: UserSessionRepository,
    private readonly configService: ConfigService,
    private readonly kcmvpCrypto: KcmvpCryptoUtil,
    private readonly phoneEncryptionService: PhoneEncryptionService,
    private readonly ipEncryptionService: IpEncryptionService,
    private readonly getProfileWithPhoneUseCase: GetProfileWithPhoneUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUnusedProfileImagesUseCase: RemoveUnusedProfileImagesUseCase
  ) {}

  async getProfileWithPhone(userId: string): Promise<{
    user: UserEntity;
    phoneNumber: string | null;
  }> {
    return this.getProfileWithPhoneUseCase.execute(userId);
  }

  enrichWithPhone(user: UserEntity): {
    user: UserEntity;
    phoneNumber: string | null;
  } {
    return {
      user,
      phoneNumber: decryptPhoneNumber(this.phoneEncryptionService, user),
    };
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository.findByUsername(username);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserEntity | null> {
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    if (!normalizedPhone) {
      return null;
    }

    const phoneHash = this.phoneEncryptionService.hash(normalizedPhone);
    return this.userRepository.findByPhoneHash(phoneHash);
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // 아이디 중복 확인
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new CustomException(
        UserErrorCode.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST
      );
    }

    // 비밀번호 유효성 검사
    const passwordValidation = PasswordValidator.validate(
      createUserDto.password
    );
    if (!passwordValidation.isValid) {
      throw new PasswordValidationException(passwordValidation.errors);
    }

    // KCMVP 기준 비밀번호 해싱
    const salt = this.kcmvpCrypto.generateSalt();
    const hashResult = await this.kcmvpCrypto.derivePasswordHash(
      createUserDto.password,
      salt
    );

    const normalizedPhone = normalizePhoneNumber(createUserDto.phoneNumber);
    const phonePayload = this.phoneEncryptionService.encrypt(normalizedPhone);

    const targetStatus = createUserDto.status ?? UserStatusEnum.INACTIVE;
    const targetApprovalStatus =
      createUserDto.approvalStatus ?? UserApprovalStatusEnum.PENDING;
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
      password: undefined, // 평문 비밀번호 제거
      status: targetStatus,
      approvalStatus: targetApprovalStatus,
      isConfirmedTerms: Boolean(createUserDto.isConfirmedTerms),
      signedAt: createUserDto.signedAt ?? new Date(),
      inactiveAt,
    };

    return this.userRepository.create(userData);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new CustomException(
        UserErrorCode.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new CustomException(
        UserErrorCode.USER_UPDATE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return updatedUser;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileRequest,
    profileImage?: Express.Multer.File
  ): Promise<UserEntity> {
    return this.updateProfileUseCase.execute(
      userId,
      updateProfileDto,
      profileImage
    );
  }

  async updateUserById(
    userId: string,
    payload: UpdateUserUseCasePayload
  ): Promise<UserEntity> {
    return this.updateUserUseCase.execute(userId, payload);
  }

  async changePassword(command: ChangePasswordCommand): Promise<void> {
    await this.changePasswordUseCase.execute(command);
  }

  async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const encryptedIp = this.ipEncryptionService.encrypt(ipAddress);
    await this.userSessionRepository.create(userId, encryptedIp, userAgent);
  }

  async getUserSessions(userId: string): Promise<any[]> {
    return this.getUserSessionsUseCase.execute(userId);
  }

  async logoutAllSessions(userId: string): Promise<void> {
    await this.userSessionRepository.logoutAllUserSessions(userId);
  }

  // 로그인 시도 관련 메서드들
  async handleFailedLogin(user: UserEntity): Promise<{
    currentAttempts: number;
    maxAttempts: number;
    lockedUntil: Date | null;
  }> {
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    const lockDuration = this.configService.get<number>(
      'ACCOUNT_LOCK_DURATION_MINUTES',
      30
    );

    await this.userRepository.incrementLoginAttempt(user.id);

    const currentAttempts = (user.loginAttemptCount ?? 0) + 1;

    let lockedUntil: Date | null = null;
    if (currentAttempts >= maxAttempts) {
      lockedUntil = await this.userRepository.lockAccount(
        user.id,
        lockDuration
      );
    }

    return { currentAttempts, maxAttempts, lockedUntil };
  }

  async handleSuccessfulLogin(
    user: UserEntity,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.userRepository.resetLoginAttempt(user.id);
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    if (ipAddress || userAgent) {
      await this.createSession(user.id, ipAddress, userAgent);
    }
  }
  async removeUnusedProfileImages(): Promise<void> {
    await this.removeUnusedProfileImagesUseCase.execute();
  }
}
