import { Injectable } from '@nestjs/common';
import { UserRegistrationRejectionRepository } from '../../../infrastructure/repository/user-registration-rejection.repository';
import { UserRepository } from '../../../infrastructure/repository/user.repository';
import {
  RejectionHistoryItem,
  RejectionHistoryResult,
} from '../../dto/user/user.dto';

@Injectable()
export class GetRejectionHistoryUseCase {
  constructor(
    private readonly rejectionRepository: UserRegistrationRejectionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    page = 1,
    limit = 20,
    filters?: {
      username?: string;
      name?: string;
      department?: string;
    }
  ): Promise<RejectionHistoryResult> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { data, total } = await this.rejectionRepository.findAll({
      page: safePage,
      limit: safeLimit,
      ...filters,
    });

    const userIds = Array.from(
      new Set(
        data
          .map((history) => history.userId)
          .filter((id): id is string => Boolean(id))
      )
    );
    const rejectorIds = Array.from(
      new Set(
        data
          .map((history) => history.rejectedBy)
          .filter((id): id is string => Boolean(id))
      )
    );
    const relatedUserIds = Array.from(new Set([...userIds, ...rejectorIds]));

    const relatedUsers = await this.userRepository.findByIds(relatedUserIds, {
      includeDeleted: true,
    });
    const userMap = new Map(
      relatedUsers.map((user) => [user.id, user.username])
    );

    const items: RejectionHistoryItem[] = data.map((history) => ({
      userId: history.userId,
      username: userMap.get(history.userId) ?? null,
      department: history.department ?? null,
      signedAt: history.signedAt,
      rejectedAt: history.rejectedAt,
      rejectedBy: history.rejectedBy
        ? (userMap.get(history.rejectedBy) ?? null)
        : null,
      reason: history.reason ?? null,
    }));

    return {
      items,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: safeLimit ? Math.max(1, Math.ceil(total / safeLimit)) : 1,
      },
    };
  }
}
