import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ZoomSessionLogEntity } from './entity/zoom-session-log.entity';

@Injectable()
export class ZoomSessionLogRepository {
  constructor(
    @InjectRepository(ZoomSessionLogEntity)
    private readonly repo: Repository<ZoomSessionLogEntity>
  ) {}

  async upsertLog(
    consultationId: string,
    zoomSessionId: string
  ): Promise<ZoomSessionLogEntity> {
    await this.repo.upsert(
      {
        consultationId,
        zoomSessionId,
        closedAt: null,
        lastEndError: null,
      },
      { conflictPaths: ['zoomSessionId'] }
    );

    return this.repo.findOneOrFail({
      where: { zoomSessionId },
    });
  }

  async findOpenByConsultationId(
    consultationId: string
  ): Promise<ZoomSessionLogEntity[]> {
    return this.repo.find({
      where: { consultationId, closedAt: IsNull() },
    });
  }

  async markClosed(id: string): Promise<void> {
    await this.repo.update(
      { id },
      {
        closedAt: new Date(),
        lastEndError: null,
      }
    );
  }

  async markError(id: string, message?: string): Promise<void> {
    await this.repo.update(
      { id },
      {
        lastEndError: message?.slice(0, 500) ?? null,
        closedAt: null,
      }
    );
  }
}
