# 인증 시스템 구현 가이드

## 1. 필수 패키지 설치

```bash
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
pnpm add -D @types/passport-jwt @types/bcryptjs
```

## 2. 환경 설정

### 2.1 .env 파일 설정

```env
# JWT 설정
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 보안 설정
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION_MINUTES=30
```

## 3. 데이터베이스 마이그레이션

### 3.1 사용자 테이블 업데이트

```sql
-- 기존 users 테이블 업데이트
ALTER TABLE users
ADD COLUMN role VARCHAR(16) DEFAULT 'USER' COMMENT '사용자 역할' CHECK (role IN ('ADMIN', 'USER')),
ADD COLUMN status VARCHAR(16) DEFAULT 'ACTIVE' COMMENT '계정 상태' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
ADD COLUMN last_login_at TIMESTAMP NULL COMMENT '마지막 로그인 시간',
ADD COLUMN login_attempt_count INT DEFAULT 0 COMMENT '로그인 시도 횟수',
ADD COLUMN locked_until TIMESTAMP NULL COMMENT '계정 잠금 해제 시간',
ADD INDEX idx_role (role),
ADD INDEX idx_status (status);

-- password_hash 필드가 NULL이면 NOT NULL로 변경
ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL COMMENT '비밀번호 해시';
```

### 3.2 새 테이블 생성

```sql
-- Refresh Token 테이블
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL COMMENT 'Refresh Token 해시값',
    expires_at TIMESTAMP NOT NULL COMMENT '만료 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL COMMENT '토큰 폐기 시간',

    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked_at (revoked_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT 'Refresh Token 관리';

-- 사용자 세션 로그 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45) COMMENT 'IP 주소',
    user_agent TEXT COMMENT '사용자 에이전트',
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL,

    INDEX idx_user_id (user_id),
    INDEX idx_login_at (login_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '사용자 세션 로그';
```

## 4. 핵심 구현 파일들

### 4.1 User Entity (TypeORM)

```typescript
// src/user/entity/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { UserSession } from './user-session.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  WAIT = 'WAIT',
  DELETED = 'DELETED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'profile_image_url',
  })
  profileImageUrl?: string;

  @Column({ type: 'varchar', length: 16, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'varchar', length: 16, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date;

  @Column({ type: 'int', default: 0, name: 'login_attempt_count' })
  loginAttemptCount: number;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_until' })
  lockedUntil?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  // 계정이 잠겨있는지 확인
  isLocked(): boolean {
    return this.lockedUntil && this.lockedUntil > new Date();
  }

  // 활성 상태인지 확인
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE && !this.isLocked();
  }
}
```

### 4.2 JWT Strategy

```typescript
// src/auth/strategy/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/service/user.service';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findById(payload.sub);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }
}
```

### 4.3 Auth Service 핵심 로직

```typescript
// src/auth/service/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../../user/service/user.service';
import { RefreshTokenService } from './refresh-token.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService
  ) {}

  async register(registerDto: RegisterDto) {
    // 이메일 중복 확인
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 비밀번호 해싱
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // 사용자 생성
    const user = await this.userService.create({
      ...registerDto,
      passwordHash,
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 계정 잠금 확인
    if (user.isLocked()) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 로그인 성공 처리
    await this.handleSuccessfulLogin(user, ipAddress, userAgent);

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    const tokenData =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    const user = await this.userService.findById(tokenData.userId);

    if (!user || !user.isActive()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // 기존 refresh token 폐기
    await this.refreshTokenService.revokeToken(refreshToken);

    // 새 토큰 발급
    return this.generateTokens(user);
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.refreshTokenService.createRefreshToken(
      user.id
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private async handleFailedLogin(user: any) {
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS', 5);
    const lockDuration = this.configService.get<number>(
      'ACCOUNT_LOCK_DURATION_MINUTES',
      30
    );

    const newAttemptCount = user.loginAttemptCount + 1;
    const updateData: any = { loginAttemptCount: newAttemptCount };

    if (newAttemptCount >= maxAttempts) {
      updateData.lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    }

    await this.userService.update(user.id, updateData);
  }

  private async handleSuccessfulLogin(
    user: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.userService.update(user.id, {
      lastLoginAt: new Date(),
      loginAttemptCount: 0,
      lockedUntil: null,
    });

    // 세션 로그 기록
    if (ipAddress || userAgent) {
      await this.userService.createSession(user.id, ipAddress, userAgent);
    }
  }
}
```

## 5. Guard 및 Decorator

### 5.1 JWT Auth Guard

```typescript
// src/auth/guard/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 5.2 Roles Guard

```typescript
// src/auth/guard/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entity/user.entity';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### 5.3 Current User Decorator

```typescript
// src/auth/decorator/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```

## 6. Controller 사용 예시

```typescript
// src/auth/controller/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnlyEndpoint() {
    return { message: 'Admin access granted' };
  }
}
```

## 7. 다음 단계

1. 위 가이드를 참고하여 구현 시작
2. 단위 테스트 작성
3. API 문서화 (Swagger)
4. 보안 검토 및 개선
5. 프론트엔드 연동 테스트
