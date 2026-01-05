# 보안 강화 인증 시스템 설계

## 개요

localStorage + CSRF Token + CSP를 활용한 다층 보안 인증 시스템 설계

### 보안 목표

- **XSS 방어**: CSP(Content Security Policy)를 통한 스크립트 주입 차단
- **CSRF 방어**: CSRF Token을 통한 크로스 사이트 요청 위조 방지
- **토큰 보안**: 짧은 수명의 Access Token과 안전한 Refresh Token 관리
- **사용성**: 새로고침 시에도 로그인 상태 유지

## 아키텍처

### 전체 흐름도

```
┌─────────────────┐    HTTPS/WSS     ┌─────────────────┐
│   Frontend      │◄─────────────────►│   Backend       │
│  (Port: 8888)   │                  │  (Port: 8080)   │
│                 │                  │                 │
│ ┌─────────────┐ │                  │ ┌─────────────┐ │
│ │localStorage │ │                  │ │ JWT Service │ │
│ │- accessToken│ │                  │ │- Generate   │ │
│ │- refreshToken│ │                  │ │- Verify     │ │
│ │- csrfToken  │ │                  │ │- Refresh    │ │
│ └─────────────┘ │                  │ └─────────────┘ │
│                 │                  │                 │
│ ┌─────────────┐ │                  │ ┌─────────────┐ │
│ │ CSP Headers │ │                  │ │CSRF Guard   │ │
│ │- script-src │ │                  │ │- Token Gen  │ │
│ │- connect-src│ │                  │ │- Validation │ │
│ └─────────────┘ │                  │ └─────────────┘ │
└─────────────────┘                  └─────────────────┘
```

## 백엔드 구현

### 1. CSRF 토큰 서비스

```typescript
// src/auth/service/csrf.service.ts
import { Injectable } from '@nestjs/common';
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class CsrfService {
  private readonly secret = process.env.CSRF_SECRET || 'csrf-secret-key';

  generateToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const random = randomBytes(16).toString('hex');
    const payload = `${sessionId}:${timestamp}:${random}`;
    const signature = createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    return Buffer.from(`${payload}:${signature}`).toString('base64');
  }

  validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString();
      const [session, timestamp, random, signature] = decoded.split(':');

      // 세션 ID 검증
      if (session !== sessionId) return false;

      // 시간 검증 (1시간 유효)
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      if (now - tokenTime > 3600000) return false;

      // 서명 검증
      const payload = `${session}:${timestamp}:${random}`;
      const expectedSignature = createHmac('sha256', this.secret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch {
      return false;
    }
  }
}
```

### 2. 인증 응답 DTO 수정

```typescript
// src/auth/dto/auth-response.dto.ts
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ description: 'CSRF 방어용 토큰' })
  csrfToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };

  @ApiProperty()
  expiresIn: number;
}
```

### 3. Auth Controller 수정

```typescript
// src/auth/controller/auth.controller.ts
import { CsrfService } from '../service/csrf.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private csrfService: CsrfService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(
      loginDto,
      req.ip,
      req.get('User-Agent')
    );

    // CSRF 토큰 생성
    const sessionId = `${result.user.id}:${Date.now()}`;
    const csrfToken = this.csrfService.generateToken(sessionId);

    return {
      success: true,
      message: 'Login successful',
      data: {
        ...result,
        csrfToken,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshDto: RefreshTokenDto, @Req() req: Request) {
    const result = await this.authService.refreshToken(refreshDto.refreshToken);

    // 새로운 CSRF 토큰 생성
    const sessionId = `${result.user.id}:${Date.now()}`;
    const csrfToken = this.csrfService.generateToken(sessionId);

    return {
      success: true,
      data: {
        ...result,
        csrfToken,
      },
    };
  }
}
```

### 4. CSRF Guard 구현

```typescript
// src/auth/guard/csrf.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { CsrfService } from '../service/csrf.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private csrfService: CsrfService,
    private jwtService: JwtService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const csrfToken = request.headers['x-csrf-token'];
    const authHeader = request.headers.authorization;

    // GET 요청은 CSRF 검증 제외
    if (request.method === 'GET') {
      return true;
    }

    if (!csrfToken) {
      throw new ForbiddenException('CSRF token is required');
    }

    if (!authHeader) {
      throw new ForbiddenException('Authorization header is required');
    }

    try {
      // JWT에서 사용자 ID 추출
      const token = authHeader.replace('Bearer ', '');
      const payload = this.jwtService.decode(token) as any;
      const sessionId = `${payload.sub}:${Math.floor(payload.iat * 1000)}`;

      // CSRF 토큰 검증
      if (!this.csrfService.validateToken(csrfToken, sessionId)) {
        throw new ForbiddenException('Invalid CSRF token');
      }

      return true;
    } catch (error) {
      throw new ForbiddenException('CSRF validation failed');
    }
  }
}
```

### 5. Protected Routes에 CSRF Guard 적용

```typescript
// src/user/controller/user.controller.ts
@Controller('user')
@UseGuards(JwtAuthGuard, CsrfGuard)
export class UserController {
  @Post('update-profile')
  async updateProfile(
    @Body() updateDto: UpdateProfileDto,
    @CurrentUser() user
  ) {
    // CSRF + JWT 검증 완료된 상태
    return this.userService.updateProfile(user.id, updateDto);
  }

  @Delete('delete-account')
  async deleteAccount(@CurrentUser() user) {
    // 위험한 작업도 CSRF로 보호
    return this.userService.deleteAccount(user.id);
  }
}
```

## 프론트엔드 구현

### 1. CSP 헤더 설정

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- CSP 보안 헤더 -->
    <meta
      http-equiv="Content-Security-Policy"
      content="
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          font-src 'self' https://fonts.gstatic.com;
          img-src 'self' data: https: blob:;
          connect-src 'self' http://localhost:8080 ws://localhost:8080;
          frame-src 'none';
          object-src 'none';
          base-uri 'self';
          form-action 'self';
        " />

    <!-- 추가 보안 헤더들 -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-XSS-Protection" content="1; mode=block" />

    <title>LH 상담 시스템</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 2. Token Storage 개선

```typescript
// src/features/auth/api/auth-api.ts
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// 토큰 저장 관련 유틸리티
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  getCsrfToken: () => localStorage.getItem('csrfToken'),

  setTokens: (accessToken: string, refreshToken: string, csrfToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('csrfToken', csrfToken);
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('csrfToken');
  },
};
```

### 3. API 요청 함수 개선

```typescript
// src/features/auth/api/auth-api.ts
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const accessToken = tokenStorage.getAccessToken();
  const csrfToken = tokenStorage.getCsrfToken();

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(csrfToken &&
        options.method !== 'GET' && { 'X-CSRF-Token': csrfToken }),
      ...options.headers,
    },
  });

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401 && url !== '/auth/refresh') {
    try {
      await authApi.refreshToken();

      // 새 토큰으로 재요청
      const newAccessToken = tokenStorage.getAccessToken();
      const newCsrfToken = tokenStorage.getCsrfToken();

      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newAccessToken}`,
          ...(newCsrfToken &&
            options.method !== 'GET' && { 'X-CSRF-Token': newCsrfToken }),
          ...options.headers,
        },
      });
    } catch (refreshError) {
      tokenStorage.clearTokens();
      window.location.href = '/login';
      throw refreshError;
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
```

### 4. Auth API 함수들 수정

```typescript
// src/features/auth/api/auth-api.ts
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<ApiResponse<AuthResponse>>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || '로그인에 실패했습니다.');
    }

    // 모든 토큰 저장 (CSRF 토큰 포함)
    tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.csrfToken
    );

    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    const response = await apiRequest<ApiResponse<AuthResponse>>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || '토큰 갱신에 실패했습니다.');
    }

    // 새로운 토큰들 저장
    tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.csrfToken
    );

    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken) {
      await apiRequest<ApiResponse<void>>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }

    tokenStorage.clearTokens();
  },
};
```

## 보안 강화 사항

### 1. 운영 환경 CSP (더 엄격)

```typescript
// vite.config.ts - 운영 빌드 시 CSP 헤더
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        {
          name: 'inject-csp',
          generateBundle(options, bundle) {
            Object.keys(bundle).forEach((fileName) => {
              if (fileName.endsWith('.html')) {
                const file = bundle[fileName];
                if (file.type === 'asset' && typeof file.source === 'string') {
                  file.source = file.source.replace(
                    '<head>',
                    `<head>
                    <meta http-equiv="Content-Security-Policy" 
                          content="default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:;">`
                  );
                }
              }
            });
          },
        },
      ],
    },
  },
});
```

### 2. 토큰 만료 시간 설정

```typescript
// 백엔드 JWT 설정
JWT_ACCESS_TOKEN_EXPIRATION=15m   # 15분
JWT_REFRESH_TOKEN_EXPIRATION=7d   # 7일
CSRF_TOKEN_EXPIRATION=1h          # 1시간
```

### 3. 보안 모니터링

```typescript
// src/auth/service/security-monitor.service.ts
@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);

  logSuspiciousActivity(event: string, details: any, request: Request) {
    this.logger.warn(`Security Event: ${event}`, {
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      timestamp: new Date().toISOString(),
      details,
    });
  }

  detectAnomalous(userId: string, action: string, request: Request) {
    // 비정상적인 요청 패턴 감지 로직
    const rateLimit = this.checkRateLimit(userId, action);
    const locationCheck = this.checkLocation(request.ip);

    if (!rateLimit || !locationCheck) {
      this.logSuspiciousActivity(
        'Anomalous Activity',
        {
          userId,
          action,
          rateLimit,
          locationCheck,
        },
        request
      );
    }
  }
}
```

## 테스트 전략

### 1. 보안 테스트

```typescript
// test/security/csrf.e2e-spec.ts
describe('CSRF Protection', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/update-profile')
      .set('Authorization', `Bearer ${validToken}`)
      // CSRF 토큰 없이 요청
      .send({ name: 'Updated Name' })
      .expect(403);

    expect(response.body.message).toContain('CSRF token is required');
  });

  it('should reject requests with invalid CSRF token', async () => {
    const response = await request(app.getHttpServer())
      .post('/user/update-profile')
      .set('Authorization', `Bearer ${validToken}`)
      .set('X-CSRF-Token', 'invalid-token')
      .send({ name: 'Updated Name' })
      .expect(403);

    expect(response.body.message).toContain('Invalid CSRF token');
  });

  it('should accept requests with valid CSRF token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });

    const { accessToken, csrfToken } = loginResponse.body.data;

    await request(app.getHttpServer())
      .post('/user/update-profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Updated Name' })
      .expect(200);
  });
});
```

### 2. CSP 테스트

```typescript
// cypress/e2e/security/csp.cy.ts
describe('CSP Protection', () => {
  it('should block inline scripts', () => {
    cy.visit('/');

    // 인라인 스크립트 삽입 시도
    cy.window().then((win) => {
      const script = win.document.createElement('script');
      script.innerHTML = 'window.maliciousCode = true;';
      win.document.head.appendChild(script);

      // CSP에 의해 차단되어야 함
      expect(win.maliciousCode).to.be.undefined;
    });
  });
});
```

## 배포 가이드

### 1. 환경변수 설정

```bash
# .env.production
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_TOKEN_EXPIRATION=15m
JWT_REFRESH_TOKEN_EXPIRATION=7d
CSRF_SECRET=your-csrf-secret-key
```

### 2. 보안 헤더 설정 (Nginx/Apache)

```nginx
# nginx.conf
server {
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # CSP는 HTML에서 설정하므로 여기서는 제외
}
```

## 결론

이 설계는 다음과 같은 다층 보안을 제공합니다:

1. **XSS 방어**: CSP를 통한 스크립트 주입 차단
2. **CSRF 방어**: 토큰 기반 요청 위조 방지
3. **토큰 보안**: 짧은 수명과 안전한 갱신 메커니즘
4. **모니터링**: 보안 이벤트 로깅 및 감지

localStorage의 XSS 취약점을 CSP로 완화하고, CSRF 토큰으로 추가 보안층을 구축하여
실용적이면서도 안전한 인증 시스템을 구현할 수 있습니다.
