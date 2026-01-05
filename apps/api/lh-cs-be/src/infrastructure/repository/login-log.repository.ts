import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  EntityManager,
  FindOptionsWhere,
  FindOperator,
  In,
  Repository,
} from 'typeorm';
import { LoginLogEntity } from './entity/login-log.entity';

export interface LoginLogQueryOptions {
  page?: number;
  limit?: number;
  actionType?: string;
  counselorId?: string;
  ipAddress?: string | string[];
  startDate?: string;
  endDate?: string;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

@Injectable()
export class LoginLogRepository {
  constructor(
    @InjectRepository(LoginLogEntity)
    private readonly repository: Repository<LoginLogEntity>
  ) {}

  private getRepository(manager?: EntityManager): Repository<LoginLogEntity> {
    return manager ? manager.getRepository(LoginLogEntity) : this.repository;
  }

  async findAll(
    options: LoginLogQueryOptions
  ): Promise<{ data: LoginLogEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      actionType,
      counselorId,
      ipAddress,
      startDate,
      endDate,
      orderBy = 'createdAt',
      orderDirection = 'DESC',
    } = options;

    const where: FindOptionsWhere<LoginLogEntity> = {};

    if (actionType) {
      where.actionType = actionType;
    }

    if (counselorId) {
      where.counselorId = counselorId;
    }

    let ipFilter: string | FindOperator<string> | undefined;

    if (Array.isArray(ipAddress) && ipAddress.length > 0) {
      ipFilter = In(ipAddress);
    } else if (typeof ipAddress === 'string' && ipAddress) {
      ipFilter = ipAddress;
    }

    if (ipFilter) {
      where.ipAddress = ipFilter;
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
    loginLog: LoginLogEntity,
    manager?: EntityManager
  ): Promise<LoginLogEntity> {
    const repo = this.getRepository(manager);
    return await repo.save(loginLog);
  }
}
