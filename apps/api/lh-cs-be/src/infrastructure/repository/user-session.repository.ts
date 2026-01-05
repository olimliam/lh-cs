import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { UserSessionEntity } from './entity/user-session.entity';

@Injectable()
export class UserSessionRepository {
  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly userSessionRepository: Repository<UserSessionEntity>
  ) {}

  async create(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<UserSessionEntity> {
    const session = this.userSessionRepository.create({
      userId,
      ipAddress,
      userAgent,
    });
    return this.userSessionRepository.save(session);
  }

  async findActiveSessionsByUserId(
    userId: string
  ): Promise<UserSessionEntity[]> {
    return this.userSessionRepository.find({
      where: { userId, logoutAt: IsNull() },
      order: { loginAt: 'DESC' },
    });
  }

  async findAllSessionsByUserId(userId: string): Promise<UserSessionEntity[]> {
    return this.userSessionRepository.find({
      where: { userId },
      order: { loginAt: 'DESC' },
    });
  }

  async logoutSession(sessionId: string): Promise<void> {
    await this.userSessionRepository.update(sessionId, {
      logoutAt: new Date(),
    });
  }

  async logoutAllUserSessions(userId: string): Promise<void> {
    await this.userSessionRepository.update(
      { userId, logoutAt: IsNull() },
      { logoutAt: new Date() }
    );
  }

  async deleteOldSessions(olderThanDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    await this.userSessionRepository.delete({
      loginAt: LessThan(cutoffDate),
    });
  }
}
