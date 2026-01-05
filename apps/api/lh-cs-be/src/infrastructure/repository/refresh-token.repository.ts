import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { RefreshTokenEntity } from './entity/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>
  ) {}

  async create(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<RefreshTokenEntity> {
    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    return this.refreshTokenRepository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
      relations: ['user'],
    });
  }

  async revokeToken(tokenHash: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { tokenHash },
      { revokedAt: new Date() }
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  async deleteRevokedTokens(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await this.refreshTokenRepository.delete({
      revokedAt: LessThan(cutoffDate),
    });
  }
}
