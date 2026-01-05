-- users.inactive_at 컬럼 추가 및 기존 INACTIVE 계정 이력 보정

-- 1) 컬럼 추가 (이미 존재하면 건너뜀)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS inactive_at TIMESTAMP NULL DEFAULT NULL COMMENT '계정 비활성화 시각';

-- 2) 기존 INACTIVE 사용자에 대해 inactive_at 기본값 보정
UPDATE users
SET inactive_at = COALESCE(inactive_at, updated_at, created_at)
WHERE status = 'INACTIVE';

