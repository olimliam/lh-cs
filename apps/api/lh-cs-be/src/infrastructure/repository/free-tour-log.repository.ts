import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { FreeTourLogEntity } from './entity/free-tour-log.entity';

export interface FreeTourLogQueryOptions {
  page?: number;
  limit?: number;
  sessionId?: string;
  tourId?: string;
  facilityId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

@Injectable()
export class FreeTourLogRepository {
  constructor(
    @InjectRepository(FreeTourLogEntity)
    private readonly repository: Repository<FreeTourLogEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<FreeTourLogEntity> {
    return manager
      ? manager.getRepository(FreeTourLogEntity)
      : this.repository;
  }

  async findAll(
    options: FreeTourLogQueryOptions
  ): Promise<{ data: FreeTourLogEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sessionId,
      tourId,
      facilityId,
      actionType,
      startDate,
      endDate,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
    } = options;

    const query = this.getRepository().createQueryBuilder('log');

    if (sessionId) {
      query.andWhere('log.sessionId = :sessionId', { sessionId });
    }

    if (tourId) {
      query.andWhere('log.tourId = :tourId', { tourId });
    }

    if (facilityId) {
      query.andWhere('log.facilityId = :facilityId', { facilityId });
    }

    if (actionType) {
      query.andWhere('log.actionType = :actionType', { actionType });
    }

    if (startDate) {
      query.andWhere('log.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere('log.createdAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    query.orderBy(
      `log.${orderBy}`,
      orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    );
    query.skip((page - 1) * limit);
    query.take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async create(
    freeTourLog: FreeTourLogEntity,
    manager?: EntityManager
  ): Promise<FreeTourLogEntity> {
    const repo = this.getRepository(manager);
    return await repo.save(freeTourLog);
  }
}
