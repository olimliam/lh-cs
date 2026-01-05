import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { AuthErrorCode } from '../exception/error/auth-error-code.enum';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const session = request.session;
    const csrfTokenFromCookie = request.cookies?.csrfToken;
    const pathname = request.originalUrl || request.url;

    // refresh 이외의 경로는 CSRF 검증을 수행하지 않음
    if (!pathname.includes('/auth/refresh')) {
      this.logger.log(
        `CSRF Guard - skipped (non-refresh path): ${pathname}, method=${request.method}`
      );
      return true;
    }

    // const sessionCsrfToken = session?.req.cookies.csrfToken;
    const sessionCsrfToken = session?.csrfToken;

    this.logger.log(
      `🛡️ CSRF Guard - Method: ${request.method}`,
      `CSRF Token (Cookie): ${csrfTokenFromCookie}`,
      `Session CSRF Token: ${sessionCsrfToken}`,
      `URL: ${request.url}`
    );

    // GET 요청은 CSRF 검증 제외
    if (request.method === 'GET') {
      this.logger.log('✅ CSRF Guard - GET request, skipping validation');
      return true;
    }

    // CSRF 토큰이 쿠키에 없는 경우
    if (!csrfTokenFromCookie) {
      this.logger.log('❌ CSRF Guard - CSRF token not found in cookies');
      throw new ForbiddenException({
        code: AuthErrorCode.CSRF_TOKEN_REQUIRED,
        message: 'CSRF token이 쿠키에 없습니다.',
      });
    }

    // 세션이 없거나 세션에 CSRF 토큰이 없는 경우
    if (!session || !sessionCsrfToken) {
      this.logger.log('❌ CSRF Guard - Session or session CSRF token missing');
      throw new ForbiddenException({
        code: AuthErrorCode.CSRF_TOKEN_REQUIRED,
        message: '세션에 CSRF token이 없습니다.',
      });
    }

    // 세션의 CSRF 토큰과 쿠키의 CSRF 토큰 비교 (Double Submit Cookie Pattern)
    if (sessionCsrfToken !== csrfTokenFromCookie) {
      this.logger.log('❌ CSRF Guard - Token mismatch, destroying session');
      this.logger.log('Session token:', sessionCsrfToken);
      this.logger.log('Cookie token:', csrfTokenFromCookie);

      // CSRF 공격 감지 시 세션 무효화
      request.session.destroy(() => {});

      throw new ForbiddenException({
        code: AuthErrorCode.CSRF_TOKEN_INVALID,
        message: 'CSRF token이 일치하지 않습니다. 세션이 무효화되었습니다.',
      });
    }

    this.logger.log('✅ CSRF Guard - Validation successful');
    return true;
  }
}
