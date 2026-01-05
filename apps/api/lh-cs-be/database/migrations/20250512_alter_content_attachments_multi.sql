-- =====================================================
-- 공지/Q&A 첨부 다중화 및 owner_type 컬럼 타입 변경
-- 배포 일자: 2025-05-12
-- =====================================================
ALTER TABLE lh_cs__content_attachments
    MODIFY COLUMN owner_type VARCHAR(16) NOT NULL COMMENT '첨부 소유 도메인',
    ADD COLUMN attachment_index INT UNSIGNED NULL COMMENT '첨부 순서' AFTER owner_id;

ALTER TABLE lh_cs__content_attachments
    DROP INDEX uk_lh_cs__content_attachments_owner,
    ADD INDEX idx_content_attachments_owner (owner_type, owner_id),
    ADD UNIQUE KEY ux_content_attachments_owner_index (owner_type, owner_id, attachment_index);

-- =====================================================
-- 롤백
-- =====================================================
/*
ALTER TABLE lh_cs__content_attachments
    DROP INDEX idx_content_attachments_owner,
    DROP INDEX uk_lh_cs__content_attachments_owner,
    ADD UNIQUE KEY ux_content_attachments_owner (owner_type, owner_id),
    DROP COLUMN attachment_index,
    MODIFY COLUMN owner_type ENUM('NOTIFICATION', 'QUESTION_ANSWER') NOT NULL COMMENT '첨부 소유 도메인';
*/
-- =====================================================
