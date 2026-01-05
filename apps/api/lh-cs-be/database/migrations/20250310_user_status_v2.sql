-- 사용자 상태 v2 전환: signed_at 컬럼 추가, 상태 enum 업데이트, SUSPENDED → DELETED 치환

-- 1) 신규 컬럼 추가 (이미 존재하면 건너뜀)
ALTER TABLE users ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 신청 시각';

-- 2) 기존 데이터 이관
UPDATE users SET signed_at = COALESCE(signed_at, created_at) WHERE signed_at IS NULL;
UPDATE users SET status = 'DELETED' WHERE status = 'SUSPENDED';

-- 3) 상태 체크 제약 재정의
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_status_allowed_values;
ALTER TABLE users
  ADD CONSTRAINT chk_users_status_allowed_values
  CHECK (status IN ('ACTIVE','INACTIVE','WAIT','DELETED','PASSWORD_CHANGE_REQUIRED'));

-- 4) 거절 이력 테이블의 요청 시각 컬럼명을 signed_at으로 통일
ALTER TABLE user_registration_rejections
  CHANGE COLUMN requested_at signed_at TIMESTAMP NOT NULL;
