import { HttpStatus, Injectable } from '@nestjs/common';
import { PhoneEncryptionService } from './phone-encryption.service';
import { PhoneVerificationRepository } from '@/infrastructure/repository/phone-verification.repository';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { SmsQueueService } from './sms-queue.service';
import { CustomException } from '@/common/exception/custom.exception';
import { PhoneVerificationErrorCode } from '@/common/exception/error';

const DEFAULT_EXPIRES_MIN = 5;
const DEFAULT_MAX_ATTEMPTS = 5;

export interface VerificationRemainingTimeResult {
  phoneNumber: string;
  remainingSeconds: number;
  expiresAt: Date;
  isExpired: boolean;
  verified: boolean;
  serverTime: Date;
}

@Injectable()
export class PhoneVerificationService {
  private readonly codeTtlMinutes: number;
  private readonly maxAttempts: number;
  private readonly freePassCode?: string;

  constructor(
    private readonly phoneEncryptionService: PhoneEncryptionService,
    private readonly repository: PhoneVerificationRepository,
    private readonly userService: UserService,
    private readonly smsQueueService: SmsQueueService,
    configService: ConfigService
  ) {
    this.codeTtlMinutes = Number(
      configService.get<string>('PHONE_VERIFICATION_TTL', '5')
    );
    this.maxAttempts = Number(
      configService.get<string>('PHONE_VERIFICATION_MAX_ATTEMPTS', '5')
    );
    this.freePassCode = configService.get<string>(
      'PHONE_VERIFICATION_FREE_PASS_CODE',
      '000000'
    );
  }

  private normalizePhone(phoneNumber: string): string {
    return phoneNumber.replace(/[^0-9]/g, '');
  }

  async generateVerificationCode(
    phoneNumber: string,
    options?: { allowExistingUser?: boolean }
  ): Promise<{ expiresAt: Date; code: string }> {
    const normalized = this.normalizePhone(phoneNumber);
    if (!/^\d{10,11}$/.test(normalized)) {
      throw new CustomException(
        PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!options?.allowExistingUser) {
      const existingUser = await this.userService.findByPhoneNumber(
        normalized
      );
      if (existingUser) {
        throw new CustomException(
          PhoneVerificationErrorCode.PHONE_ALREADY_REGISTERED,
          HttpStatus.BAD_REQUEST
        );
      }
    }

    const code = this.generateCode();
    const expiresAt = new Date(
      Date.now() + (this.codeTtlMinutes || DEFAULT_EXPIRES_MIN) * 60 * 1000
    );

    const encryptedPayload = this.phoneEncryptionService.encrypt(normalized);

    await this.repository.createVerification({
      phoneHash: encryptedPayload.hash,
      phoneEncrypted: encryptedPayload.encrypted,
      phoneIv: encryptedPayload.iv,
      phoneTag: encryptedPayload.authTag,
      code,
      expiresAt,
    });

    await this.smsQueueService.sendVerificationCode(normalized, code);

    return { expiresAt, code };
  }

  async generateVerificationCodeForExistingUser(
    userId: string
  ): Promise<{ expiresAt: Date; code: string }> {
    const profile = await this.userService.getProfileWithPhone(userId);
    const phoneNumber = profile.phoneNumber;

    if (!phoneNumber) {
      throw new CustomException(
        PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
        HttpStatus.BAD_REQUEST,
        '등록된 휴대전화 번호가 없습니다.'
      );
    }

    return this.generateVerificationCode(phoneNumber, {
      allowExistingUser: true,
    });
  }

  async verifyCode(phoneNumber: string, inputCode: string): Promise<boolean> {
    // TODO: 핸드폰 인증 붙인 이후 운영 전 반드시 제거 예정
    if (this.freePassCode && inputCode === this.freePassCode) {
      return true;
    }

    const normalized = this.normalizePhone(phoneNumber);
    if (!/^\d{10,11}$/.test(normalized)) {
      throw new CustomException(
        PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!/^\d{6}$/.test(inputCode)) {
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_CODE_MISMATCH,
        HttpStatus.BAD_REQUEST,
        '인증번호는 숫자 6자리여야 합니다.'
      );
    }

    const phoneHash = this.phoneEncryptionService.hash(normalized);
    const record = await this.repository.findLatestByPhoneHash(phoneHash);

    if (!record) {
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_CODE_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    if (record.verified) {
      return true;
    }

    if (record.expiresAt < new Date()) {
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_CODE_EXPIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    if (record.attemptCount >= (this.maxAttempts || DEFAULT_MAX_ATTEMPTS)) {
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_ATTEMPT_EXCEEDED,
        HttpStatus.BAD_REQUEST
      );
    }

    if (record.verificationCode !== inputCode) {
      await this.repository.incrementAttempts(record.id);
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_CODE_MISMATCH,
        HttpStatus.BAD_REQUEST
      );
    }

    await this.repository.markVerified(record.id);
    return true;
  }

  async verifyCodeForExistingUser(
    userId: string,
    inputCode: string
  ): Promise<boolean> {
    const profile = await this.userService.getProfileWithPhone(userId);
    const phoneNumber = profile.phoneNumber;

    if (!phoneNumber) {
      throw new CustomException(
        PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
        HttpStatus.BAD_REQUEST,
        '등록된 휴대전화 번호가 없습니다.'
      );
    }

    return this.verifyCode(phoneNumber, inputCode);
  }

  async getLatestVerificationForAdmin(phoneNumber: string): Promise<{
    phoneNumber: string;
    verificationCode: string;
    expiresAt: Date;
    attemptCount: number;
    verified: boolean;
    createdAt: Date;
  }> {
    const normalized = this.normalizePhone(phoneNumber);

    if (!/^\d{10,11}$/.test(normalized)) {
      throw new CustomException(
        PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
        HttpStatus.BAD_REQUEST
      );
    }

    const phoneHash = this.phoneEncryptionService.hash(normalized);
    const record = await this.repository.findLatestByPhoneHash(phoneHash);

    if (!record) {
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_RECORD_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return {
      phoneNumber: normalized,
      verificationCode: record.verificationCode,
      expiresAt: record.expiresAt,
      attemptCount: record.attemptCount,
      verified: record.verified,
      createdAt: record.createdAt,
    };
  }

  async cleanupExpiredVerifications(now = new Date()): Promise<number> {
    return this.repository.cleanupExpired(now);
  }

  async getRemainingTime(
    phoneNumber: string
  ): Promise<VerificationRemainingTimeResult> {
    const normalized = this.normalizePhone(phoneNumber);

    if (!/^\d{10,11}$/.test(normalized)) {
      throw new CustomException(
        PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
        HttpStatus.BAD_REQUEST
      );
    }

    const phoneHash = this.phoneEncryptionService.hash(normalized);
    const record = await this.repository.findLatestByPhoneHash(phoneHash);

    if (!record) {
      throw new CustomException(
        PhoneVerificationErrorCode.VERIFICATION_CODE_REQUIRED,
        HttpStatus.NOT_FOUND
      );
    }

    const now = new Date();
    const remainingMs = record.expiresAt.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    return {
      phoneNumber: normalized,
      remainingSeconds,
      expiresAt: record.expiresAt,
      isExpired: remainingSeconds === 0,
      verified: record.verified,
      serverTime: now,
    };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
