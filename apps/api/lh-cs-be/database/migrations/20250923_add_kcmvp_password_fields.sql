/**
 * KCMVP 기준 사용자 테이블 마이그레이션
 * 
 * 공공기관 보안 요구사항에 따른 비밀번호 필드 추가
 * - password_salt: 사용자별 고유 salt
 * - kdf_algorithm: 사용된 KDF 알고리즘 (서버 정책 고정)
 * - kdf_params: KDF 파라미터 (iterations, keyLength 등)
 * - pepper_version: Pepper 버전 (키 회전용)
 * - hash_created_at: 해시 생성 시간
 */

-- 1. 새로운 KCMVP 필드 추가
ALTER TABLE users 
ADD COLUMN password_salt VARCHAR(128) NULL COMMENT '비밀번호 salt (KCMVP)' AFTER password_hash;

ALTER TABLE users 
ADD COLUMN kdf_algorithm VARCHAR(50) NULL DEFAULT 'pbkdf2-hmac-sha256' COMMENT 'KDF 알고리즘 (KCMVP)' AFTER password_salt;

ALTER TABLE users 
ADD COLUMN kdf_params JSON NULL COMMENT 'KDF 파라미터 (iterations, hashLength 등)' AFTER kdf_algorithm;

ALTER TABLE users 
ADD COLUMN pepper_version INT NULL DEFAULT 1 COMMENT 'Pepper 버전 (키 회전용)' AFTER kdf_params;

ALTER TABLE users 
ADD COLUMN hash_created_at TIMESTAMP NULL COMMENT '해시 생성 시간' AFTER pepper_version;

-- 2. 기존 password_hash 필드 코멘트 업데이트
ALTER TABLE users 
MODIFY COLUMN password_hash VARCHAR(255) NULL COMMENT '비밀번호 해시 (KCMVP 기준)';

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX idx_users_pepper_version ON users(pepper_version);
CREATE INDEX idx_users_kdf_algorithm ON users(kdf_algorithm);
CREATE INDEX idx_users_hash_created_at ON users(hash_created_at);

-- 4. 기존 데이터 마이그레이션을 위한 임시 플래그
ALTER TABLE users 
ADD COLUMN migration_status VARCHAR(16) NULL DEFAULT 'pending' COMMENT '마이그레이션 상태' CHECK (migration_status IN ('pending', 'migrated', 'failed'));

-- 5. 보안 감사를 위한 인덱스
CREATE INDEX idx_users_migration_status ON users(migration_status);

-- 6. 제약 조건 추가
-- 새로운 사용자는 반드시 KCMVP 필드가 있어야 함
-- (기존 사용자는 로그인 시 마이그레이션 됨)

-- 7. 환경별 설정 확인 쿼리
-- 운영 환경에서 실행 전 확인 필요
SELECT 
    'KCMVP Migration Ready' as status,
    COUNT(*) as total_users,
    COUNT(password_hash) as users_with_password,
    COUNT(password_salt) as users_with_salt
FROM users;

-- 8. 백업 권장사항
-- 마이그레이션 전 전체 users 테이블 백업:
-- mysqldump -u [username] -p [database_name] users > users_backup_before_kcmvp.sql

-- 9. 롤백 스크립트 (필요시)
/*
-- KCMVP 필드 제거 (롤백용 - 주의!)
ALTER TABLE users DROP COLUMN migration_status;
ALTER TABLE users DROP COLUMN hash_created_at;
ALTER TABLE users DROP COLUMN pepper_version;
ALTER TABLE users DROP COLUMN kdf_params;
ALTER TABLE users DROP COLUMN kdf_algorithm;
ALTER TABLE users DROP COLUMN password_salt;

-- 인덱스 제거
DROP INDEX idx_users_migration_status ON users;
DROP INDEX idx_users_hash_created_at ON users;
DROP INDEX idx_users_kdf_algorithm ON users;
DROP INDEX idx_users_pepper_version ON users;

-- password_hash 코멘트 원복
ALTER TABLE users 
MODIFY COLUMN password_hash VARCHAR(255) NULL COMMENT '비밀번호 해시 (로그인 허용시)';
*/
