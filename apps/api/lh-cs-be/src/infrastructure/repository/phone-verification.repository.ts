import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { PhoneVerificationEntity } from './entity/phone-verification.entity';

@Injectable()
export class PhoneVerificationRepository {
  constructor(
    @InjectRepository(PhoneVerificationEntity)
    private readonly repo: Repository<PhoneVerificationEntity>
  ) {}

  async createVerification(payload: {
    phoneHash: string;
    phoneEncrypted: Buffer;
    phoneIv: Buffer;
    phoneTag: Buffer;
    code: string;
    expiresAt: Date;
  }): Promise<PhoneVerificationEntity> {
    const entity = this.repo.create({
      phoneHash: payload.phoneHash,
      phoneEncrypted: payload.phoneEncrypted,
      phoneIv: payload.phoneIv,
      phoneTag: payload.phoneTag,
      verificationCode: payload.code,
      expiresAt: payload.expiresAt,
      verified: false,
    });

    return this.repo.save(entity);
  }

  async findLatestByPhoneHash(phoneHash: string): Promise<PhoneVerificationEntity | null> {
    return this.repo.findOne({
      where: { phoneHash },
      order: { createdAt: 'DESC' },
    });
  }

  async markVerified(id: string): Promise<void> {
    await this.repo.update(id, {
      verified: true,
      verifiedAt: new Date(),
    });
  }

  async incrementAttempts(id: string): Promise<void> {
    await this.repo.increment({ id }, 'attemptCount', 1);
  }

  async cleanupExpired(now = new Date()): Promise<number> {
    const result = await this.repo.delete({ expiresAt: LessThan(now) });
    return result.affected ?? 0;
  }
}
