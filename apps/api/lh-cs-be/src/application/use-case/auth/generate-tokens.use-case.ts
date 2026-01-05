import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenService } from '../../service/refresh-token.service';
import { UserEntity } from '@/infrastructure/repository/entity/user.entity';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

@Injectable()
export class GenerateTokensUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  async execute(user: UserEntity) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id
    );

    const passwordChangeRequired =
      user.status === UserStatusEnum.PASSWORD_CHANGE_REQUIRED;

    return {
      accessToken,
      refreshToken,
      passwordChangeRequired,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        approvalStatus: user.approvalStatus,
        profileImageUrl: user.profileImageUrl,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
