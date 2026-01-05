import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenService } from '../../service/refresh-token.service';
import { UserService } from '../../service/user.service';
import {
  AuthErrorCode,
  AuthErrorData,
} from '@/common/exception/error/auth-error-code.enum';
import { GenerateTokensUseCase } from './generate-tokens.use-case';

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly userService: UserService,
    private readonly generateTokensUseCase: GenerateTokensUseCase
  ) {}

  async execute(refreshToken: string) {
    const tokenData =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    const user = await this.userService.findById(tokenData.userId);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException(
        AuthErrorData[AuthErrorCode.USER_NOT_FOUND_OR_INACTIVE]
      );
    }

    await this.refreshTokenService.revokeToken(refreshToken);

    return this.generateTokensUseCase.execute(user);
  }
}
