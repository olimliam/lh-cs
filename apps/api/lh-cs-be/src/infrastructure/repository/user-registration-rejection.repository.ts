import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRegistrationRejectionEntity } from './entity/user-registration-rejection.entity';
import { UserEntity } from './entity';

export interface RejectionHistoryQueryOptions {
  page?: number;
  limit?: number;
  username?: string;
  name?: string;
  department?: string;
}

@Injectable()
export class UserRegistrationRejectionRepository {
  constructor(
    @InjectRepository(UserRegistrationRejectionEntity)
    private readonly repository: Repository<UserRegistrationRejectionEntity>
  ) {}

  async createHistory(
    data: Partial<UserRegistrationRejectionEntity>
  ): Promise<UserRegistrationRejectionEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(
    options: RejectionHistoryQueryOptions
  ): Promise<{ data: UserRegistrationRejectionEntity[]; total: number }> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;

    const query = this.repository.createQueryBuilder('history');

    const needsUserJoin = Boolean(options.username || options.name);

    if (needsUserJoin) {
      query.leftJoin(UserEntity, 'user', 'user.id = history.userId');
    }

    if (options.username) {
      query.andWhere('user.username LIKE :username', {
        username: `%${options.username}%`,
      });
    }

    if (options.name) {
      query.andWhere('user.name LIKE :name', {
        name: `%${options.name}%`,
      });
    }

    if (options.department) {
      query.andWhere('history.department LIKE :department', {
        department: `%${options.department}%`,
      });
    }

    query
      .orderBy('history.rejectedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }
}
