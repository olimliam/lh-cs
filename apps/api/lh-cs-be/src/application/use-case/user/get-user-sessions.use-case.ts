import { Injectable } from '@nestjs/common';
import { UserSessionRepository } from '../../../infrastructure/repository/user-session.repository';
import { IpEncryptionService } from '@/application/service/ip-encryption.service';

@Injectable()
export class GetUserSessionsUseCase {
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
    }>
  > {
    const sessions =
      await this.userSessionRepository.findAllSessionsByUserId(userId);

    return sessions.map((session) => ({
      id: session.id,
      ipAddress: this.ipEncryptionService.decrypt(session.ipAddress) ?? null,
      userAgent: session.userAgent,
      loginAt: session.loginAt,
      logoutAt: session.logoutAt,
      isActive: session.isActive(),
    }));
  }
}
