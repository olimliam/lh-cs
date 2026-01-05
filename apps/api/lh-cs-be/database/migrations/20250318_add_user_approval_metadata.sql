-- =====================================================
-- 사용자 승인 메타데이터 컬럼 추가
-- 배포 일자: 2025-03-18
-- =====================================================

ALTER TABLE lh_cs__users
    ADD COLUMN approval_completed_at DATETIME NULL COMMENT '가입 승인 완료 일시' AFTER approval_status,
    ADD COLUMN approval_completed_by_user_id BIGINT NULL COMMENT '가입 승인 처리 관리자 ID' AFTER approval_completed_at;

-- 롤백 시
-- ALTER TABLE lh_cs__users
--     DROP COLUMN approval_completed_by_user_id,
--     DROP COLUMN approval_completed_at;
-- =====================================================
