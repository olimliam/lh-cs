-- =====================================================
-- KCMVP 패스워드 암호화 시스템 배포 스크립트
-- 버전: v1.0.6
-- 배포일: 2025-09-23
-- 목적: 공공기관 보안 요구사항 준수를 위한 DB 스키마 업데이트
-- 
-- ID 네이밍 규칙:
-- - Primary Key: 모든 테이블에서 id 사용
-- - Foreign Key: {참조테이블명}_id 형식
-- - 자세한 규칙: docs/database-id-naming-convention.md
-- =====================================================

-- 배포 전 백업 권장
-- mysqldump -u [username] -p [database_name] users > backup_users_v1.0.6_$(date +%Y%m%d_%H%M%S).sql

-- =====================================================
-- 1. 사용자 테이블 KCMVP 필드 추가
-- =====================================================

-- 1.1 password_salt 필드 추가 (사용자별 고유 salt)
ALTER TABLE lh_cs__users 
ADD COLUMN password_salt VARCHAR(128) NOT NULL 
COMMENT 'KCMVP 비밀번호 salt (256bit hex)' 
AFTER password_hash;

-- 1.2 kdf_algorithm 필드 추가 (서버 정책 고정)
ALTER TABLE lh_cs__users 
ADD COLUMN kdf_algorithm VARCHAR(50) NOT NULL 
DEFAULT 'pbkdf2-hmac-sha256' 
COMMENT 'KDF 알고리즘 (서버 정책 고정)' 
AFTER password_salt;

-- 1.3 kdf_params 필드 추가 (해싱 파라미터)
ALTER TABLE lh_cs__users 
ADD COLUMN kdf_params JSON NOT NULL 
COMMENT 'KDF 파라미터 {algorithm, iterations, hashLength}' 
AFTER kdf_algorithm;

-- 1.4 pepper_version 필드 추가 (키 회전용)
ALTER TABLE lh_cs__users 
ADD COLUMN pepper_version INT NOT NULL 
DEFAULT 1 
COMMENT 'Pepper 버전 (HSM 키 회전용)' 
AFTER kdf_params;

-- 1.5 hash_created_at 필드 추가 (감사용)
ALTER TABLE lh_cs__users 
ADD COLUMN hash_created_at TIMESTAMP NOT NULL 
DEFAULT CURRENT_TIMESTAMP
COMMENT '해시 생성 시간 (감사 추적용)' 
AFTER pepper_version;

-- 1.6 migration_status 필드 제거 (신규 프로젝트는 불필요)
-- 레거시 마이그레이션 불필요로 생략

-- =====================================================
-- 2. 기존 필드 업데이트
-- =====================================================

-- 2.1 password_hash 필드 코멘트 업데이트 및 NOT NULL 설정
ALTER TABLE lh_cs__users 
MODIFY COLUMN password_hash VARCHAR(255) NOT NULL 
COMMENT '비밀번호 해시 (KCMVP PBKDF2-HMAC-SHA256)';

-- =====================================================
-- 3. 인덱스 추가 (성능 최적화)
-- =====================================================

-- 3.1 pepper_version 인덱스 (키 회전 시 조회용)
CREATE INDEX idx_users_pepper_version ON lh_cs__users(pepper_version);

-- 3.2 kdf_algorithm 인덱스 (알고리즘별 통계용)
CREATE INDEX idx_users_kdf_algorithm ON lh_cs__users(kdf_algorithm);

-- 3.3 hash_created_at 인덱스 (감사 조회용)
CREATE INDEX idx_users_hash_created_at ON lh_cs__users(hash_created_at);

-- 3.4 migration_status 인덱스 제거 (신규 프로젝트는 불필요)
-- 레거시 마이그레이션 불필요로 생략

-- 3.5 복합 인덱스 (KCMVP 해시 조회 최적화용)
CREATE INDEX idx_users_kcmvp_hash ON lh_cs__users(pepper_version, kdf_algorithm);

-- =====================================================
-- 4. 보안 감사 테이블 생성
-- =====================================================

-- 4.1 패스워드 보안 감사 로그 테이블
CREATE TABLE IF NOT EXISTS lh_cs_password_security_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(32) NOT NULL COMMENT '보안 이벤트 유형' CHECK (
        event_type IN (
            'PASSWORD_CHANGE', 
            'PASSWORD_RESET', 
            'LOGIN_SUCCESS', 
            'LOGIN_FAILURE',
            'ADMIN_PASSWORD_CHANGE',
            'ADMIN_PASSWORD_RESET',
            'KCMVP_MIGRATION',
            'HASH_UPGRADE',
            'PEPPER_ROTATION'
        )
    ),
    
    user_id VARCHAR(36) NULL COMMENT '대상 사용자 ID',
    admin_id VARCHAR(36) NULL COMMENT '관리자 ID (관리자 작업시)',
    
    -- 암호화 정보
    kdf_algorithm VARCHAR(50) NULL COMMENT '사용된 KDF 알고리즘',
    iterations INT NULL COMMENT 'PBKDF2 반복 횟수',
    pepper_version INT NULL COMMENT 'Pepper 버전',
    
    -- 접속 정보
    ip_address VARCHAR(45) NULL COMMENT '클라이언트 IP',
    user_agent TEXT NULL COMMENT '사용자 에이전트',
    
    -- 추가 정보
    reason VARCHAR(500) NULL COMMENT '작업 사유',
    compliance_standard VARCHAR(50) DEFAULT 'KCMVP' COMMENT '준수 표준',
    
    -- 메타데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '이벤트 발생 시간',
    
    -- 인덱스
    INDEX idx_audit_event_type (event_type),
    INDEX idx_audit_user_id (user_id),
    INDEX idx_audit_admin_id (admin_id),
    INDEX idx_audit_created_at (created_at),
    INDEX idx_audit_pepper_version (pepper_version),
    
    -- 외래 키
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='KCMVP 패스워드 보안 감사 로그';

-- =====================================================
-- 5. 뷰 생성 (관리자 대시보드용)
-- =====================================================

-- 5.1 KCMVP 사용자 현황 뷰 (간소화)
CREATE OR REPLACE VIEW v_kcmvp_user_status AS
SELECT 
    kdf_algorithm,
    pepper_version,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage,
    MIN(hash_created_at) as first_created,
    MAX(hash_created_at) as last_created
FROM users 
GROUP BY kdf_algorithm, pepper_version
ORDER BY kdf_algorithm, pepper_version;

-- 5.2 보안 이벤트 요약 뷰 (최근 30일)
CREATE OR REPLACE VIEW v_security_events_summary AS
SELECT 
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as affected_users,
    MIN(created_at) as first_occurrence,
    MAX(created_at) as last_occurrence
FROM password_security_audit 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY event_type
ORDER BY event_count DESC;

-- =====================================================
-- 6. 기존 데이터 검증 및 통계
-- =====================================================

-- 6.1 배포 전 현황 확인 (신규 프로젝트)
SELECT 
    'Pre-deployment Status (New Project)' as status,
    COUNT(*) as total_users,
    COUNT(password_hash) as users_with_password
FROM users;

-- 6.2 테이블 구조 확인
SHOW CREATE TABLE users;

-- =====================================================
-- 7. 권한 설정 (필요시 실행)
-- =====================================================

-- 7.1 애플리케이션 사용자 권한 부여
-- GRANT SELECT, INSERT, UPDATE ON users TO 'app_user'@'%';
-- GRANT SELECT, INSERT ON password_security_audit TO 'app_user'@'%';

-- 7.2 읽기 전용 감사 사용자 권한
-- GRANT SELECT ON password_security_audit TO 'audit_user'@'%';
-- GRANT SELECT ON v_kcmvp_user_status TO 'audit_user'@'%';
-- GRANT SELECT ON v_security_events_summary TO 'audit_user'@'%';

-- =====================================================
-- 8. 배포 후 검증 쿼리
-- =====================================================

-- 8.1 스키마 변경 확인
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'elypecs_solution' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME IN (
    'PASSWORD_SALT', 'KDF_ALGORITHM', 'KDF_PARAMS', 
    'PEPPER_VERSION', 'HASH_CREATED_AT'
  )
ORDER BY ORDINAL_POSITION;

-- 8.2 인덱스 생성 확인
SELECT 
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'elypecs_solution' 
  AND TABLE_NAME = 'users'
  AND INDEX_NAME LIKE 'idx_users_%'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- 8.3 KCMVP 사용자 현황 확인
SELECT * FROM v_kcmvp_user_status;

-- =====================================================
-- 9. 롤백 스크립트 (문제 발생시)
-- =====================================================

/*
-- 주의: 롤백 시 데이터 손실 발생 가능
-- 반드시 백업 후 실행

-- 인덱스 삭제
DROP INDEX idx_users_kcmvp_hash ON users;
DROP INDEX idx_users_hash_created_at ON users;
DROP INDEX idx_users_kdf_algorithm ON users;
DROP INDEX idx_users_pepper_version ON users;

-- 뷰 삭제
DROP VIEW IF EXISTS v_security_events_summary;
DROP VIEW IF EXISTS v_kcmvp_user_status;

-- 감사 테이블 삭제
DROP TABLE IF EXISTS password_security_audit;

-- 새 컬럼 삭제
ALTER TABLE users DROP COLUMN hash_created_at;
ALTER TABLE users DROP COLUMN pepper_version;
ALTER TABLE users DROP COLUMN kdf_params;
ALTER TABLE users DROP COLUMN kdf_algorithm;
ALTER TABLE users DROP COLUMN password_salt;

-- password_hash 원복
ALTER TABLE users 
MODIFY COLUMN password_hash VARCHAR(255) NULL 
COMMENT '비밀번호 해시 (로그인 허용시)';
*/

-- =====================================================
-- 배포 완료 로그
-- =====================================================

INSERT INTO password_security_audit (
    event_type,
    reason,
    compliance_standard,
    created_at
) VALUES (
    'KCMVP_MIGRATION',
    'KCMVP 보안 기준 신규 프로젝트 데이터베이스 스키마 적용 완료 (v1.0.6)',
    'KCMVP',
    NOW()
);

SELECT 'KCMVP Database Migration v1.0.6 완료' as deployment_status, NOW() as completed_at;

-- =====================================================
-- 배포 스크립트 종료
-- =====================================================
