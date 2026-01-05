import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { AdminLogEntity } from './entity/admin-log.entity';

export interface AdminLogQueryOptions {
  page?: number;
  limit?: number;
  actionType?: string;
  counselorId?: string;
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

@Injectable()
export class AdminLogRepository {
  constructor(
    @InjectRepository(AdminLogEntity)
    private readonly repository: Repository<AdminLogEntity>
  ) {}

  private getRepository(manager?: EntityManager): Repository<AdminLogEntity> {
    return manager ? manager.getRepository(AdminLogEntity) : this.repository;
  }

  async findAll(
    options: AdminLogQueryOptions
  ): Promise<{ data: AdminLogEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      actionType,
      counselorId,
      startDate,
      endDate,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
    } = options;

    const where: FindOptionsWhere<AdminLogEntity> = {};

    if (actionType) {
      where.actionType = actionType;
    }

    if (counselorId) {
      where.counselorId = counselorId;
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      where.createdAt = Between(start, end);
    }

    const repo = this.getRepository();
    const [data, total] = await repo.findAndCount({
      where,
      order: {
        [orderBy]: orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async create(
    adminLog: AdminLogEntity,
    manager?: EntityManager
  ): Promise<AdminLogEntity> {
    const repo = this.getRepository(manager);
    return await repo.save(adminLog);
  }
}
