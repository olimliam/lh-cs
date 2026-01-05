import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '../../service/refresh-token.service';

@Injectable()
export class LogoutAllUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }
}
