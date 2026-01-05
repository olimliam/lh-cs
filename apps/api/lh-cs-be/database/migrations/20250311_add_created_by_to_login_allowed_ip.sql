-- =============================================================
-- 로그인 허용 IP 등록자 컬럼 추가
-- 작성일: 2025-03-11
-- 목적: 허용/차단 IP를 등록한 관리자 UID 추적
-- 사전 작업: 운영자 계정이 최소 1개 이상 존재하는지 확인
-- =============================================================

-- 0. 대상 스키마 선택 (필요 시 주석 해제 후 사용)
-- USE `elypecs_solution`;

-- 1. 컬럼 추가 (임시로 NULL 허용 후 백필)
ALTER TABLE `lh_cs__login_allowed_ip`
  ADD COLUMN `created_by` BIGINT NULL COMMENT 'IP를 등록한 관리자 ID' AFTER `is_active`;

-- 2. 최초 변경 이력의 작성자(changed_by)로 등록자 백필
UPDATE `lh_cs__login_allowed_ip` AS li
LEFT JOIN (
  SELECT
    h.login_allowed_ip_id,
    h.changed_by
  FROM `lh_cs__login_allowed_ip_histories` h
  JOIN (
    SELECT login_allowed_ip_id, MIN(login_allowed_ip_history_id) AS first_history_id
    FROM `lh_cs__login_allowed_ip_histories`
    GROUP BY login_allowed_ip_id
  ) first_history
    ON h.login_allowed_ip_id = first_history.login_allowed_ip_id
   AND h.login_allowed_ip_history_id = first_history.first_history_id
) history_first
  ON li.login_allowed_ip_id = history_first.login_allowed_ip_id
SET li.created_by = history_first.changed_by
WHERE li.created_by IS NULL
  AND history_first.changed_by IS NOT NULL;

-- 3. 관리자 계정이 존재할 경우 남은 NULL 값을 관리자 ID로 채움
UPDATE `lh_cs__login_allowed_ip` AS li
JOIN (
  SELECT MIN(user_id) AS fallback_admin_id
  FROM `lh_cs__users`
  WHERE role IN ('SUPER_ADMIN','ADMIN')
) admin_user ON admin_user.fallback_admin_id IS NOT NULL
SET li.created_by = COALESCE(li.created_by, admin_user.fallback_admin_id)
WHERE li.created_by IS NULL;

-- 4. 관리자 계정이 하나도 없는 경우, 임의의 사용자 ID로 채움 (테이블이 비어 있으면 영향 없음)
UPDATE `lh_cs__login_allowed_ip` AS li
JOIN (
  SELECT MIN(user_id) AS fallback_user_id
  FROM `lh_cs__users`
) any_user ON any_user.fallback_user_id IS NOT NULL
SET li.created_by = COALESCE(li.created_by, any_user.fallback_user_id)
WHERE li.created_by IS NULL;

-- 5. NOT NULL + 인덱스 + FK 제약 적용
ALTER TABLE `lh_cs__login_allowed_ip`
  MODIFY COLUMN `created_by` BIGINT NOT NULL COMMENT 'IP를 등록한 관리자 ID';

ALTER TABLE `lh_cs__login_allowed_ip`
  ADD INDEX `idx_login_allowed_ip_created_by` (`created_by`),
  ADD CONSTRAINT `fk_login_allowed_ip_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `lh_cs__users` (`user_id`);
