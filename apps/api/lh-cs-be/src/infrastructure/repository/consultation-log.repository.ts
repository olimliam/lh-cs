import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ConsultationLogEntity } from './entity/consultation-log.entity';

export interface ConsultationLogQueryOptions {
  page?: number;
  limit?: number;
  consultationId?: string;
  counselorId?: string;
  tourId?: string;
  facilityId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

@Injectable()
export class ConsultationLogRepository {
  constructor(
    @InjectRepository(ConsultationLogEntity)
    private readonly repository: Repository<ConsultationLogEntity>
  ) {}

  private getRepository(
    manager?: EntityManager
  ): Repository<ConsultationLogEntity> {
    return manager
      ? manager.getRepository(ConsultationLogEntity)
      : this.repository;
  }

  async findAll(
    options: ConsultationLogQueryOptions
  ): Promise<{ data: ConsultationLogEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      consultationId,
      counselorId,
      tourId,
      facilityId,
      actionType,
      startDate,
      endDate,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
    } = options;

    const query = this.getRepository().createQueryBuilder('log');

    if (consultationId) {
      query.andWhere('log.consultationId = :consultationId', {
        consultationId,
      });
    }

    if (counselorId) {
      query.andWhere('log.counselorId = :counselorId', { counselorId });
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
    consultationLog: ConsultationLogEntity,
    manager?: EntityManager
  ): Promise<ConsultationLogEntity> {
    const repo = this.getRepository(manager);
    return await repo.save(consultationLog);
  }
}
