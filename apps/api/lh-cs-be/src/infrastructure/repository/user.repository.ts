import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, SelectQueryBuilder } from 'typeorm';
import {
  UserEntity,
  UserStatusEnum,
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserLockStatusEnum,
} from './entity';

type FindUsersQueryOptions = {
  page?: number;
  limit?: number;
  status?: UserStatusEnum;
  statuses?: UserStatusEnum[];
  excludeStatuses?: UserStatusEnum[];
  role?: UserRoleEnum;
  roles?: UserRoleEnum[];
  username?: string;
  name?: string;
  department?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  approvalStatus?: UserApprovalStatusEnum;
  approvalStatuses?: UserApprovalStatusEnum[];
  phoneHash?: string;
  allowedRoles?: UserRoleEnum[];
  excludeRoles?: UserRoleEnum[];
  lockState?: UserLockStatusEnum;
  lockStates?: UserLockStatusEnum[];
};

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findByPhoneHash(phoneHash: string): Promise<UserEntity | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.phoneHash = :phoneHash', { phoneHash })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  async findByIds(
    ids: string[],
    options?: { includeDeleted?: boolean }
  ): Promise<UserEntity[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.username'])
      .where('user.id IN (:...ids)', { ids });

    if (options?.includeDeleted) {
      queryBuilder.withDeleted();
    } else {
      queryBuilder.andWhere('user.deletedAt IS NULL');
    }

    return queryBuilder.getMany();
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    updateData: Partial<UserEntity>
  ): Promise<UserEntity | null> {
    await this.userRepository.update(id, updateData);
    return this.findById(id);
  }

  private buildFilteredQuery(
    options?: FindUsersQueryOptions
  ): SelectQueryBuilder<UserEntity> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    const statusFiltersRaw =
      options?.statuses && options.statuses.length > 0
        ? options.statuses
        : options?.status
          ? [options.status]
          : undefined;

    const statusFilters = statusFiltersRaw
      ? Array.from(new Set(statusFiltersRaw))
      : undefined;

    if (statusFilters?.length) {
      queryBuilder.andWhere('user.status IN (:...statuses)', {
        statuses: statusFilters,
      });
    }

    const excludeStatusFilters =
      options?.excludeStatuses && options.excludeStatuses.length > 0
        ? Array.from(new Set(options.excludeStatuses))
        : undefined;

    if (excludeStatusFilters?.length) {
      queryBuilder.andWhere('user.status NOT IN (:...excludeStatuses)', {
        excludeStatuses: excludeStatusFilters,
      });
    }

    const approvalFiltersRaw =
      options?.approvalStatuses && options.approvalStatuses.length > 0
        ? options.approvalStatuses
        : options?.approvalStatus
          ? [options.approvalStatus]
          : undefined;

    const approvalFilters = approvalFiltersRaw
      ? Array.from(new Set(approvalFiltersRaw))
      : undefined;

    if (approvalFilters?.length) {
      queryBuilder.andWhere('user.approvalStatus IN (:...approvalStatuses)', {
        approvalStatuses: approvalFilters,
      });
    }

    if (options?.roles?.length) {
      const uniqueRoles = Array.from(new Set(options.roles));
      queryBuilder.andWhere('user.role IN (:...roles)', { roles: uniqueRoles });
    } else if (options?.role) {
      queryBuilder.andWhere('user.role = :role', { role: options.role });
    } else if (options?.allowedRoles?.length) {
      queryBuilder.andWhere('user.role IN (:...allowedRoles)', {
        allowedRoles: options.allowedRoles,
      });
    }

    if (options?.excludeRoles?.length) {
      queryBuilder.andWhere('user.role NOT IN (:...excludeRoles)', {
        excludeRoles: options.excludeRoles,
      });
    }

    if (options?.lockStates?.length) {
      const uniqueLockStates = Array.from(new Set(options.lockStates));
      queryBuilder.andWhere('user.lockState IN (:...lockStates)', {
        lockStates: uniqueLockStates,
      });
    } else if (options?.lockState) {
      queryBuilder.andWhere('user.lockState = :lockState', {
        lockState: options.lockState,
      });
    }

    if (options?.username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${options.username}%`,
      });
    }

    if (options?.name) {
      queryBuilder.andWhere('user.name LIKE :name', {
        name: `%${options.name}%`,
      });
    }

    if (options?.department) {
      queryBuilder.andWhere('user.department LIKE :department', {
        department: `%${options.department}%`,
      });
    }

    if (options?.phoneHash) {
      queryBuilder.andWhere('user.phoneHash = :phoneHash', {
        phoneHash: options.phoneHash,
      });
    }

    return queryBuilder;
  }

  async findAll(
    options?: FindUsersQueryOptions
  ): Promise<{ users: UserEntity[]; total: number }> {
    const queryBuilder = this.buildFilteredQuery(options);

    const sortFieldMap: Record<string, string> = {
      createdAt: 'user.createdAt',
      lastLoginAt: 'user.lastLoginAt',
      name: 'user.name',
    };

    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'DESC';
    const orderByColumn = sortFieldMap[sortBy] ?? 'user.createdAt';

    queryBuilder.orderBy(orderByColumn, sortOrder);

    if (options?.page && options?.limit) {
      const skip = (options.page - 1) * options.limit;
      queryBuilder.skip(skip).take(options.limit);
    }

    const [users, total] = await queryBuilder.getManyAndCount();
    return { users, total };
  }

  async softDelete(id: string): Promise<void> {
    await this.userRepository.update(id, {
      status: UserStatusEnum.DELETED,
    });
    await this.userRepository.softDelete(id);
  }

  async incrementLoginAttempt(id: string): Promise<void> {
    await this.userRepository.increment({ id: id }, 'loginAttemptCount', 1);
  }

  async resetLoginAttempt(id: string): Promise<void> {
    await this.userRepository.update(id, {
      loginAttemptCount: 0,
      lockedUntil: () => 'NULL',
      lockAt: () => 'NULL',
    });
  }

  async lockAccount(id: string, lockDuration: number): Promise<Date> {
    const lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    await this.userRepository.update(id, {
      lockedUntil,
      lockAt: new Date(),
    });
    return lockedUntil;
  }

  async countStatusAndLockStates(options?: FindUsersQueryOptions): Promise<{
    activeCount: number;
    inactiveCount: number;
    deletedCount: number;
    lockedCount: number;
  }> {
    const baseQuery = this.buildFilteredQuery(options);

    const result = await baseQuery
      .select([])
      .addSelect(
        `SUM(CASE WHEN user.status = :activeStatus THEN 1 ELSE 0 END)`,
        'activeCount'
      )
      .addSelect(
        `SUM(CASE WHEN user.status = :inactiveStatus THEN 1 ELSE 0 END)`,
        'inactiveCount'
      )
      .addSelect(
        `SUM(CASE WHEN user.status = :deletedStatus THEN 1 ELSE 0 END)`,
        'deletedCount'
      )
      .addSelect(
        `SUM(CASE WHEN user.lockState = :lockedState THEN 1 ELSE 0 END)`,
        'lockedCount'
      )
      .setParameters({
        activeStatus: UserStatusEnum.ACTIVE,
        inactiveStatus: UserStatusEnum.INACTIVE,
        deletedStatus: UserStatusEnum.DELETED,
        lockedState: UserLockStatusEnum.LOCKED,
      })
      .getRawOne<{
        activeCount: string;
        inactiveCount: string;
        deletedCount: string;
        lockedCount: string;
      }>();

    return {
      activeCount: Number(result?.activeCount ?? 0),
      inactiveCount: Number(result?.inactiveCount ?? 0),
      deletedCount: Number(result?.deletedCount ?? 0),
      lockedCount: Number(result?.lockedCount ?? 0),
    };
  }

  async findUsedProfileImages(): Promise<string[]> {
    const users = await this.userRepository.find({
      select: ['profileImageUrl'],
      where: {
        profileImageUrl: Not(IsNull()),
        deletedAt: IsNull(),
      },
    });
    return users
      .map((user) => user.profileImageUrl)
      .filter((url): url is string => url !== null);
  }
}
