-- v1.0.9 schema patch: email → username 전환 및 관련 읽기 모델 정비
-- MySQL 5.7+ 호환. 실행 전 전체 백업을 권장합니다.


-- 1. users 테이블: username 컬럼 추가
ALTER TABLE lh_cs__users 
  ADD COLUMN username VARCHAR(100) NULL COMMENT '로그인 아이디' AFTER name;

-- 2. 기존 email 값을 username으로 마이그레이션
UPDATE lh_cs__users 
  SET username = email 
  WHERE username IS NULL AND email IS NOT NULL;

-- 3. email 고유 인덱스 제거
ALTER TABLE lh_cs__users DROP INDEX email;

-- 4. email 컬럼 제거
ALTER TABLE lh_cs__users DROP COLUMN email;

-- 5. username 컬럼 NOT NULL 및 주석 정비
ALTER TABLE lh_cs__users 
  MODIFY COLUMN username VARCHAR(100) NOT NULL COMMENT '로그인 아이디';

-- 5-1. 전화번호 관련 컬럼 추가
ALTER TABLE lh_cs__users 
  ADD COLUMN phone_hash CHAR(64) NOT NULL COMMENT '전화번호 SHA-256 해시' AFTER username,
  ADD COLUMN phone_encrypted VARBINARY(256) NULL COMMENT '암호화된 전화번호' AFTER phone_hash,
  ADD COLUMN phone_iv VARBINARY(32) NULL COMMENT '전화번호 암호화 IV' AFTER phone_encrypted,
  ADD COLUMN phone_tag VARBINARY(32) NULL COMMENT '전화번호 암호화 인증 태그' AFTER phone_iv,
  ADD COLUMN phone_verified_at DATETIME NULL COMMENT '전화번호 인증 완료 시각' AFTER phone_tag;

-- 5-2. phone_hash 유니크 인덱스 추가
ALTER TABLE lh_cs__users 
  ADD UNIQUE INDEX phone_hash_unique (phone_hash);

-- 6. username 고유 인덱스 추가
ALTER TABLE lh_cs__users 
  ADD UNIQUE INDEX username_unique (username);

-- 7. username 조회용 보조 인덱스 재생성
ALTER TABLE lh_cs__users DROP INDEX idx_users_username;
ALTER TABLE lh_cs__users ADD INDEX idx_users_username (username);

-- 8. read_consultations 테이블: 상담원 이메일 → 아이디 컬럼 전환
ALTER TABLE lh_cs__read_consultations 
  CHANGE COLUMN consultant_email consultant_username VARCHAR(100) NOT NULL COMMENT '상담원 아이디';


----------------------------------------

-- 9. 전화번호 인증 테이블 생성
CREATE TABLE IF NOT EXISTS lh_cs__phone_verifications (
  phone_verification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone_hash CHAR(64) NOT NULL,
  phone_encrypted VARBINARY(256) NOT NULL,
  phone_iv VARBINARY(32) NOT NULL,
  phone_tag VARBINARY(32) NOT NULL,
  verification_code CHAR(6) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone_verifications_expires_at (expires_at)
);

CREATE INDEX idx_phone_verifications_phone_hash ON lh_cs__phone_verifications (phone_hash);

