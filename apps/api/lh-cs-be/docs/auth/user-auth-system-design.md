# 사용자 관리 및 인증 시스템 설계

## 1. 개요

이 문서는 사용자 관리 기능과 JWT 기반 인증 시스템(Access Token + Refresh
Token)의 설계를 다룹니다.

## 2. 시스템 아키텍처

### 2.1 인증 플로우

```
1. 로그인 요청 → 사용자 인증 → Access Token + Refresh Token 발급
2. API 요청 시 Access Token 검증
3. Access Token 만료 시 Refresh Token으로 재발급
4. Refresh Token 만료 시 재로그인 필요
```

### 2.2 토큰 구조

- **Access Token**: 15분 만료, API 인증용
- **Refresh Token**: 7일 만료, Access Token 재발급용
- **토큰 저장**: Refresh Token은 DB에 저장, Access Token은 클라이언트 메모리

## 3. 데이터베이스 설계

### 3.1 사용자 테이블 (기존 users 테이블 확장)

```sql
-- 기존 users 테이블에 추가 필드
ALTER TABLE users ADD COLUMN role VARCHAR(30) DEFAULT 'USER' COMMENT '사용자 역할';
ALTER TABLE users ADD COLUMN status VARCHAR(30) DEFAULT 'ACTIVE' COMMENT '계정 상태';
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP NULL COMMENT '마지막 로그인 시간';
ALTER TABLE users ADD COLUMN login_attempt_count INT DEFAULT 0 COMMENT '로그인 시도 횟수';
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL COMMENT '계정 잠금 해제 시간';
```

### 3.2 Refresh Token 테이블

```sql
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

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT 'Refresh Token 관리';
```

### 3.3 사용자 세션 로그 테이블

```sql
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

## 4. API 엔드포인트 설계

### 4.1 인증 관련 API

```
POST /auth/register          # 회원가입
POST /auth/login             # 로그인
POST /auth/refresh           # 토큰 재발급
POST /auth/logout            # 로그아웃
POST /auth/logout-all        # 모든 세션 로그아웃
```

### 4.2 사용자 관리 API

```
GET    /users/profile        # 내 프로필 조회
PUT    /users/profile        # 내 프로필 수정
POST   /users/change-password # 비밀번호 변경
DELETE /users/account        # 계정 삭제

# 관리자용
GET    /admin/users          # 사용자 목록 조회
GET    /admin/users/:id      # 특정 사용자 조회
PUT    /admin/users/:id/status # 사용자 상태 변경
DELETE /admin/users/:id      # 사용자 삭제
```

## 5. 모듈 구조

### 5.1 디렉토리 구조

```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   ├── refresh-token.dto.ts
│   │   └── auth-response.dto.ts
│   ├── guard/
│   │   ├── jwt-auth.guard.ts
│   │   ├── jwt-refresh.guard.ts
│   │   └── roles.guard.ts
│   ├── strategy/
│   │   ├── jwt.strategy.ts
│   │   └── jwt-refresh.strategy.ts
│   ├── decorator/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── service/
│   │   ├── auth.service.ts
│   │   ├── jwt.service.ts
│   │   └── password.service.ts
│   ├── controller/
│   │   └── auth.controller.ts
│   └── auth.module.ts
├── user/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   ├── change-password.dto.ts
│   │   └── user-response.dto.ts
│   ├── entity/
│   │   ├── user.entity.ts
│   │   ├── refresh-token.entity.ts
│   │   └── user-session.entity.ts
│   ├── repository/
│   │   ├── user.repository.ts
│   │   ├── refresh-token.repository.ts
│   │   └── user-session.repository.ts
│   ├── service/
│   │   └── user.service.ts
│   ├── controller/
│   │   ├── user.controller.ts
│   │   └── admin-user.controller.ts
│   └── user.module.ts
```

## 6. 보안 고려사항

### 6.1 비밀번호 보안

- bcrypt를 사용한 해싱 (saltRounds: 12)
- 비밀번호 정책: 최소 8자, 대소문자+숫자+특수문자 포함

### 6.2 토큰 보안

- Access Token: 메모리에만 저장, HttpOnly 쿠키 사용 금지
- Refresh Token: HttpOnly 쿠키로 전송, Secure 플래그 설정
- JWT Secret은 환경변수로 관리

### 6.3 계정 보안

- 로그인 실패 5회 시 계정 30분 잠금
- 세션 관리 및 동시 로그인 제한 옵션
- IP 기반 접근 제한 (선택적)

### 6.4 CORS 및 보안 헤더

```typescript
// CORS 설정
app.enableCors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// 보안 헤더
app.use(helmet());
```

## 7. 환경 변수

```env
# JWT 설정
JWT_ACCESS_SECRET=your-access-token-secret
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 보안 설정
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=30m

# CORS 설정
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 8. 구현 우선순위

### Phase 1 (Core 기능)

1. User Entity 및 Repository 구현
2. JWT 서비스 및 전략 구현
3. 기본 인증 API (로그인, 회원가입, 토큰 재발급)
4. Auth Guard 및 Decorator 구현

### Phase 2 (보안 강화)

1. Refresh Token 관리
2. 계정 잠금 기능
3. 세션 로그 관리
4. 비밀번호 변경 기능

### Phase 3 (관리 기능)

1. 사용자 관리 API
2. 관리자 권한 관리
3. 사용자 상태 관리
4. 로그 분석 기능

## 9. 테스트 전략

### 9.1 단위 테스트

- 각 서비스의 핵심 로직 테스트
- JWT 토큰 생성/검증 테스트
- 비밀번호 해싱/검증 테스트

### 9.2 통합 테스트

- 인증 플로우 전체 테스트
- API 엔드포인트 테스트
- 데이터베이스 연동 테스트

### 9.3 E2E 테스트

- 로그인부터 API 호출까지 전체 플로우
- 토큰 만료 및 재발급 시나리오
- 권한별 접근 제어 테스트
