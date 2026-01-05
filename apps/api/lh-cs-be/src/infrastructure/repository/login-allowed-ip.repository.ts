import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoginAllowedIpEntity } from './entity/login-allowed-ip.entity';

export interface LoginAllowedIpPaginationOptions {
  page: number;
  limit: number;
  orderDirection?: 'ASC' | 'DESC';
}

@Injectable()
export class LoginAllowedIpRepository {
  constructor(
    @InjectRepository(LoginAllowedIpEntity)
    private readonly repository: Repository<LoginAllowedIpEntity>
  ) {}

  async findPaginated(
    options: LoginAllowedIpPaginationOptions
  ): Promise<{ data: LoginAllowedIpEntity[]; total: number }> {
    const page = Math.max(options.page, 1);
    const limit = Math.max(options.limit, 1);
    const orderDirection = options.orderDirection ?? 'DESC';

    const qb = this.repository
      .createQueryBuilder('login_allowed_ip')
      .leftJoinAndSelect('login_allowed_ip.user', 'user')
      .orderBy('login_allowed_ip.createdAt', orderDirection)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async findById(id: string): Promise<LoginAllowedIpEntity | null> {
    return this.repository
      .createQueryBuilder('login_allowed_ip')
      .where('login_allowed_ip.id = :id', { id })
      .getOne();
  }

  async findByIp(ipCandidates: string[]): Promise<LoginAllowedIpEntity | null> {
    if (ipCandidates.length === 0) {
      return null;
    }

    return this.repository.findOne({
      where: { ipAddress: In(ipCandidates) },
    });
  }

  async findActive(): Promise<LoginAllowedIpEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async hasActive(): Promise<boolean> {
    return this.repository.exist({ where: { isActive: true } });
  }

  async create(data: {
    ipAddress: string;
    description?: string | null;
    isActive: boolean;
    createdBy: string;
  }): Promise<LoginAllowedIpEntity> {
    const entity = this.repository.create({
      ipAddress: data.ipAddress,
      description: data.description ?? null,
      isActive: data.isActive,
      createdBy: data.createdBy,
    });

    const saved = await this.repository.save(entity);
    return this.findById(saved.id).then((result) => result ?? saved);
  }

  async update(
    id: string,
    data: Partial<
      Pick<LoginAllowedIpEntity, 'ipAddress' | 'description' | 'isActive'>
    >
  ): Promise<LoginAllowedIpEntity> {
    const payload: Partial<LoginAllowedIpEntity> = {};

    if (data.ipAddress !== undefined) {
      payload.ipAddress = data.ipAddress;
    }

    if (data.description !== undefined) {
      payload.description = data.description ?? null;
    }

    if (data.isActive !== undefined) {
      payload.isActive = data.isActive;
    }

    if (Object.keys(payload).length === 0) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('LoginAllowedIpEntity update failed: entity not found');
      }
      return existing;
    }

    await this.repository
      .createQueryBuilder()
      .update(LoginAllowedIpEntity)
      .set(payload)
      .where('id = :id', { id })
      .execute();

    const next = await this.findById(id);
    if (!next) {
      throw new Error('LoginAllowedIpEntity update failed: entity not found');
    }

    return next;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async isIpWhitelisted(ipCandidates: string[]): Promise<boolean> {
    if (ipCandidates.length === 0) {
      return false;
    }

    const record = await this.repository.findOne({
      where: {
        ipAddress: In(ipCandidates),
        isActive: true,
      },
    });

    return Boolean(record);
  }

  async isIpBlocked(ipCandidates: string[]): Promise<boolean> {
    if (ipCandidates.length === 0) {
      return false;
    }

    const record = await this.repository.findOne({
      where: {
        ipAddress: In(ipCandidates),
        isActive: false,
      },
    });

    return Boolean(record);
  }
}
