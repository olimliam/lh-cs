import { Injectable } from '@nestjs/common';
import { IpEncryptionService } from '@/application/service/ip-encryption.service';
import { UserSessionRepository } from '../../../infrastructure/repository/user-session.repository';

@Injectable()
export class GetLoginHistoryUseCase {
  constructor(
    private readonly userSessionRepository: UserSessionRepository,
    private readonly ipEncryptionService: IpEncryptionService
  ) {}

  async execute(userId: string): Promise<
    Array<{
      id: string;
      ipAddress: string | null;
      userAgent: string | null;
      loginAt: Date;
      logoutAt: Date | null;
      isActive: boolean;
      duration: number | null;
    }>
  > {
    const sessions =
      await this.userSessionRepository.findAllSessionsByUserId(userId);

    return sessions.map((session) => {
      const duration = session.logoutAt
        ? Math.floor(
            (session.logoutAt.getTime() - session.loginAt.getTime()) /
              (1000 * 60)
          )
        : null;

      return {
        id: session.id,
        ipAddress: this.ipEncryptionService.decrypt(session.ipAddress) ?? null,
        userAgent: session.userAgent,
        loginAt: session.loginAt,
        logoutAt: session.logoutAt,
        isActive: session.isActive(),
        duration,
      };
    });
  }
}
