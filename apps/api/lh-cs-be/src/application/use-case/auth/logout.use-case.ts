import { Injectable } from '@nestjs/common';
import { RefreshTokenService } from '../../service/refresh-token.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async execute(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeToken(refreshToken);
  }
}
