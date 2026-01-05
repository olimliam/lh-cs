import { AuthErrorCode } from '@/common/exception/error/auth-error-code.enum';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshTokenRepository } from '../../infrastructure/repository/refresh-token.repository';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async createRefreshToken(userId: string): Promise<string> {
    const jti = crypto.randomBytes(16).toString('hex');

    const payload = {
      sub: userId,
      jti,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // DB에 토큰 해시 저장
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.refreshTokenRepository.create(userId, tokenHash, expiresAt);

    return refreshToken;
  }

  async validateRefreshToken(token: string): Promise<any> {
    try {
      // 1. JWT 구조 검증
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException(AuthErrorCode.INVALID_TOKEN);
      }

      // 2. DB에서 토큰 존재 및 유효성 검증
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const tokenData = await this.refreshTokenRepository.findByTokenHash(tokenHash);

      if (!tokenData) {
        throw new UnauthorizedException(AuthErrorCode.REFRESH_TOKEN_NOT_FOUND);
      }

      if (!tokenData.isValid()) {
        throw new UnauthorizedException(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
      }

      return {
        userId: payload.sub,
        jti: payload.jti,
        tokenEntity: tokenData,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(AuthErrorCode.INVALID_REFRESH_TOKEN);
    }
  }

  async revokeToken(token: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.refreshTokenRepository.revokeToken(tokenHash);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId);
  }
}
