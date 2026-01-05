import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import type { Session } from 'express-session';
import { CsrfService } from './csrf.service';
import {
  clearAllAuthCookies,
  setCsrfTokenCookie,
  setRefreshTokenCookie,
} from '@/common/utils/cookie-utils';

interface SessionPayload {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

type AuthSession = Session & {
  userId?: string;
  accessToken?: string;
  csrfToken?: string;
  loginTime?: number;
};

@Injectable()
export class AuthSessionService {
  private readonly logger = new Logger(AuthSessionService.name);

  constructor(
    private readonly csrfService: CsrfService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async establishSession(
    req: Request,
    res: Response,
    payload: SessionPayload
  ): Promise<void> {
    const csrfToken = this.csrfService.generateToken();
    this.assignSession(req, payload.userId, payload.accessToken, csrfToken);
    await this.saveSession(req);
    this.setAuthCookies(res, payload.refreshToken, csrfToken);
  }

  async clearSession(req: Request, res: Response): Promise<void> {
    await this.destroySession(req);
    clearAllAuthCookies(res);
  }

  buildTokenVerificationPayload(
    accessToken: string | undefined,
    req: Request,
    user: { id: string; username: string }
  ) {
    if (!accessToken) {
      throw new BadRequestException('Access token is required');
    }

    const decoded = this.jwtService.decode(accessToken);
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      typeof (decoded as any).exp !== 'number'
    ) {
      throw new BadRequestException('Invalid access token');
    }

    const expiresAt = new Date((decoded as any).exp * 1000);

    return {
      isValid: true,
      userId: user.id,
      username: user.username,
      expiresAt: expiresAt.toISOString(),
      tokenType: 'Bearer',
      csrfValid: this.isCsrfValid(req),
      hasRefreshToken: !!req.cookies?.refreshToken,
      sessionActive: !!req.session?.userId,
    };
  }

  private assignSession(
    req: Request,
    userId: string,
    accessToken: string,
    csrfToken: string
  ): void {
    const session = this.ensureSession(req);
    session.userId = userId;
    session.accessToken = accessToken;
    session.csrfToken = csrfToken;
    session.loginTime = Date.now();
  }

  private setAuthCookies(
    res: Response,
    refreshToken: string,
    csrfToken: string
  ): void {
    const refreshMaxAge = this.getRefreshMaxAge();
    setRefreshTokenCookie(res, refreshToken, refreshMaxAge);
    setCsrfTokenCookie(res, csrfToken);
  }

  private ensureSession(req: Request): AuthSession {
    if (!req.session) {
      throw new BadRequestException('Session store is not available.');
    }
    return req.session as AuthSession;
  }

  private async saveSession(req: Request): Promise<void> {
    const session = this.ensureSession(req);
    await new Promise<void>((resolve, reject) => {
      session.save((err: any) => {
        if (err) {
          this.logger.error('Failed to save session', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async destroySession(req: Request): Promise<void> {
    if (!req.session) {
      return;
    }

    await new Promise<void>((resolve) => {
      req.session!.destroy((err: any) => {
        if (err) {
          this.logger.warn('Failed to destroy session', err);
        }
        resolve();
      });
    });
  }

  private getRefreshMaxAge(): number {
    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d'
    );
    return this.parseJwtExpiration(refreshExpiresIn);
  }

  private parseJwtExpiration(expiresIn: string): number {
    const time = parseInt(expiresIn.slice(0, -1), 10);
    const unit = expiresIn.slice(-1);

    switch (unit) {
      case 's':
        return time * 1000;
      case 'm':
        return time * 60 * 1000;
      case 'h':
        return time * 60 * 60 * 1000;
      case 'd':
        return time * 24 * 60 * 60 * 1000;
      default:
        return time;
    }
  }

  private isCsrfValid(req: Request): boolean {
    const sessionCsrfToken = req.session?.csrfToken;
    const csrfTokenFromCookie = req.cookies?.csrfToken;

    return !!(
      sessionCsrfToken &&
      csrfTokenFromCookie &&
      sessionCsrfToken === csrfTokenFromCookie
    );
  }
}
