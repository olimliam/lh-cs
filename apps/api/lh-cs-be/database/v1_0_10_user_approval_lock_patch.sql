-- v1.0.10 schema patch: 사용자 승인·잠금 관리 고도화
-- MySQL 5.7+ 호환. 실행 전 전체 백업을 권장합니다.

-- 1. approval_status 컬럼 추가 (ENUM → VARCHAR(30))
ALTER TABLE lh_cs__users 
  ADD COLUMN approval_status VARCHAR(30) 
  NOT NULL DEFAULT 'pending' 
  COMMENT '가입 승인 상태' 
  AFTER status;

-- 2. 기존 데이터 승인 상태 갱신
UPDATE lh_cs__users 
  SET approval_status = 'approved' 
  WHERE approval_status IS NULL;

-- 3. approval_status 인덱스 추가
CREATE INDEX idx_users_approval_status 
  ON lh_cs__users (approval_status);

-- 4. locked_until 인덱스 추가
CREATE INDEX idx_users_locked_until 
  ON lh_cs__users (locked_until);
