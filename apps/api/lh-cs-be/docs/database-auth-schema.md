# 데이터베이스 스키마 업데이트 - 사용자 인증 시스템

## 기존 테이블 수정

### 1. users 테이블 업데이트

````sql
-- 기존 users 테이블에 인증 관련 필드 추가
ALTER TABLE users
ADD COLUMN role VARCHAR(30) DEFAULT 'USER' COMMENT '사용자 역할',
ADD COLUMN status VARCHAR(30) DEFAULT 'ACTIVE' COMMENT '계정 상태',
ADD COLUMN last_login_at TIMESTAMP NULL COMMENT '마지막 로그인 시간',
ADD COLUMN login_attempt_count INT DEFAULT 0 COMMENT '로그인 시도 횟수',
ADD COLUMN locked_until TIMESTAMP NULL COMMENT '계정 잠금 해제 시간';

-- 인덱스 추가
ALTER TABLE users
ADD INDEX idx_role (role),
ADD INDEX idx_status (status),
ADD INDEX idx_last_login_at (last_login_at),
ADD INDEX idx_locked_until (locked_until);

-- password_hash 필드가 NULL 허용이면 NOT NULL로 변경
ALTER TABLE users MODIFY password_hash VARCHAR(255) NOT NULL COMMENT '비밀번호 해시';
```## 새 테이블 추가

### 2. refresh_tokens 테이블

```sql
-- Refresh Token 관리 테이블
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
````

### 3. user_sessions 테이블

```sql
-- 사용자 세션 로그 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45) COMMENT 'IP 주소 (IPv4/IPv6 지원)',
    user_agent TEXT COMMENT '사용자 에이전트 정보',
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL COMMENT '로그아웃 시간',

    INDEX idx_user_id (user_id),
    INDEX idx_login_at (login_at),
    INDEX idx_logout_at (logout_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '사용자 세션 로그';
```

### 4. user_password_history 테이블 (선택적)

```sql
-- 비밀번호 이력 관리 (비밀번호 재사용 방지용)
CREATE TABLE IF NOT EXISTS user_password_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '사용자 비밀번호 이력';
```

## 데이터 타입 및 제약 조건 설명

### users 테이블 새 필드

- `role`: 사용자 권한 (VARCHAR(16) - 'ADMIN', 'USER' 등, 애플리케이션에서
  TypeScript enum으로 관리)
- `status`: 계정 상태 (VARCHAR(16) - 'ACTIVE', 'INACTIVE', 'SUSPENDED' 등,
  TypeScript enum으로 관리)
- `last_login_at`: 마지막 로그인 시간 추적
- `login_attempt_count`: 연속 로그인 실패 횟수
- `locked_until`: 계정 잠금 해제 시간

### refresh_tokens 테이블

- `token_hash`: SHA-256으로 해싱된 refresh token
- `expires_at`: 토큰 만료 시간 (기본 7일)
- `revoked_at`: 토큰 강제 폐기 시간 (로그아웃 시)

### user_sessions 테이블

- `ip_address`: IPv4(15자) 및 IPv6(45자) 지원
- `user_agent`: 브라우저 및 OS 정보
- `logout_at`: 명시적 로그아웃 시간

## 인덱스 전략

### 성능 최적화를 위한 인덱스

```sql
-- 복합 인덱스 (선택적 추가)
ALTER TABLE refresh_tokens
ADD INDEX idx_user_expires (user_id, expires_at),
ADD INDEX idx_token_revoked (token_hash, revoked_at);

ALTER TABLE user_sessions
ADD INDEX idx_user_login (user_id, login_at),
ADD INDEX idx_active_sessions (user_id, logout_at);

-- 사용자 계정 상태 조회 최적화
ALTER TABLE users
ADD INDEX idx_active_users (status, deleted_at);
```

## 데이터 정리 작업 (유지보수)

### 1. 만료된 토큰 정리

```sql
-- 만료된 refresh token 삭제 (일일 작업)
DELETE FROM refresh_tokens
WHERE expires_at < NOW() - INTERVAL 1 DAY;

-- 폐기된 토큰 정리 (주간 작업)
DELETE FROM refresh_tokens
WHERE revoked_at IS NOT NULL
  AND revoked_at < NOW() - INTERVAL 7 DAY;
```

### 2. 세션 로그 정리

```sql
-- 90일 이전 세션 로그 삭제
DELETE FROM user_sessions
WHERE login_at < NOW() - INTERVAL 90 DAY;

-- 비밀번호 이력 정리 (최근 5개만 유지)
DELETE ph1 FROM user_password_history ph1
INNER JOIN (
    SELECT user_id,
           id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM user_password_history
) ph2 ON ph1.id = ph2.id
WHERE ph2.rn > 5;
```

## 마이그레이션 스크립트 실행 순서

1. **백업 생성**

   ```sql
   -- 기존 users 테이블 백업
   CREATE TABLE users_backup AS SELECT * FROM users;
   ```

2. **기존 테이블 수정**

   ```sql
   -- users 테이블 필드 추가
   SOURCE /path/to/alter_users_table.sql;
   ```

3. **새 테이블 생성**

   ```sql
   -- 새 테이블들 생성
   SOURCE /path/to/create_auth_tables.sql;
   ```

4. **인덱스 최적화**

   ```sql
   -- 추가 인덱스 생성
   SOURCE /path/to/create_indexes.sql;
   ```

5. **데이터 검증**

   ```sql
   -- 테이블 구조 확인
   DESCRIBE users;
   DESCRIBE refresh_tokens;
   DESCRIBE user_sessions;

   -- 제약 조건 확인
   SHOW CREATE TABLE refresh_tokens;
   ```

## 롤백 계획

### 문제 발생 시 롤백 스크립트

```sql
-- 새 테이블 삭제
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS user_password_history;

-- users 테이블 복원 (새 필드 제거)
ALTER TABLE users
DROP COLUMN role,
DROP COLUMN status,
DROP COLUMN last_login_at,
DROP COLUMN login_attempt_count,
DROP COLUMN locked_until;

-- 인덱스 제거
ALTER TABLE users
DROP INDEX idx_role,
DROP INDEX idx_status,
DROP INDEX idx_last_login_at,
DROP INDEX idx_locked_until;
```

## 예상 테이블 크기 및 성능

### 예상 데이터 볼륨 (1년 기준)

- users: 기존 + 새 필드 (용량 증가 미미)
- refresh_tokens: ~100KB (사용자 1,000명 기준)
- user_sessions: ~1MB (로그인 세션 10,000건 기준)

### 성능 고려사항

- refresh_tokens 테이블의 정기적인 정리 필요
- user_sessions 로그는 파티셔닝 고려 (대용량 시)
- 복합 인덱스로 조회 성능 최적화
