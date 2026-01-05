import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import {
  VisionAiAuthTokenEntity,
  VisionAiTokenType,
} from './entity/vision-ai-auth-token.entity';

interface CreateVisionAiEptRecordParams {
  jti: string;
  userId: string;
  origin: string;
  audience: string;
  scope: string;
  expiresAt: Date;
}

@Injectable()
export class VisionAiAuthTokenRepository {
  constructor(
    @InjectRepository(VisionAiAuthTokenEntity)
    private readonly repository: Repository<VisionAiAuthTokenEntity>
  ) {}

  async createEptRecord(params: CreateVisionAiEptRecordParams): Promise<void> {
    const entity = this.repository.create({
      jti: params.jti,
      userId: params.userId,
      origin: params.origin,
      audience: params.audience,
      scope: params.scope,
      expiresAt: params.expiresAt,
      tokenType: VisionAiTokenType.EPT,
    });
    await this.repository.save(entity);
  }

  async consumeEpt(jti: string, now: Date): Promise<boolean> {
    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({ redeemedAt: now })
      .where({ jti, tokenType: VisionAiTokenType.EPT })
      .andWhere({ redeemedAt: IsNull() })
      .andWhere('expiresAt > :now', { now })
      .execute();

    return Boolean(result.affected && result.affected > 0);
  }

  async pruneExpired(before: Date): Promise<number> {
    const result = await this.repository.delete({
      tokenType: VisionAiTokenType.EPT,
      expiresAt: LessThan(before),
    });
    return result.affected ?? 0;
  }
}
