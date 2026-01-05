-- =====================================================
-- 공지/Q&A 첨부 파일명 관리 테이블 및 FK 추가
-- 배포 일자: 2025-03-31
-- =====================================================

CREATE TABLE IF NOT EXISTS lh_cs__content_attachments (
    content_attachment_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '첨부 식별자',
    owner_type ENUM('NOTIFICATION', 'QUESTION_ANSWER') NOT NULL COMMENT '첨부 소유 도메인',
    owner_id BIGINT NOT NULL COMMENT '첨부 소유 ID',
    file_name VARCHAR(255) NOT NULL COMMENT '요청된 파일명',
    file_url VARCHAR(500) NOT NULL COMMENT '파일 접근 URL',
    file_key VARCHAR(500) NOT NULL COMMENT 'S3 파일 키',
    mime_type VARCHAR(100) NULL COMMENT 'MIME 타입',
    file_size BIGINT NULL COMMENT '파일 크기(바이트)',
    created_by BIGINT NOT NULL COMMENT '업로더 ID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    UNIQUE KEY ux_content_attachments_key (file_key),
    UNIQUE KEY ux_content_attachments_owner (owner_type, owner_id)
) COMMENT '공지/Q&A 첨부 메타데이터';

ALTER TABLE lh_cs__notifications
    ADD COLUMN content_attachment_id BIGINT NULL COMMENT '첨부 메타데이터 ID' AFTER file_url,
    ADD INDEX idx_notifications_content_attachment_id (content_attachment_id),
    ADD CONSTRAINT fk_notifications_content_attachment
        FOREIGN KEY (content_attachment_id)
        REFERENCES lh_cs__content_attachments (content_attachment_id)
            ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE lh_cs__question_answers
    ADD COLUMN content_attachment_id BIGINT NULL COMMENT '첨부 메타데이터 ID' AFTER file_url,
    ADD INDEX idx_question_answers_content_attachment_id (content_attachment_id),
    ADD CONSTRAINT fk_question_answers_content_attachment
        FOREIGN KEY (content_attachment_id)
        REFERENCES lh_cs__content_attachments (content_attachment_id)
            ON UPDATE CASCADE ON DELETE SET NULL;

-- =====================================================
-- 롤백
-- =====================================================
/*
ALTER TABLE lh_cs__notifications
    DROP FOREIGN KEY fk_notifications_content_attachment,
    DROP INDEX idx_notifications_content_attachment_id,
    DROP COLUMN content_attachment_id;

ALTER TABLE lh_cs__question_answers
    DROP FOREIGN KEY fk_question_answers_content_attachment,
    DROP INDEX idx_question_answers_content_attachment_id,
    DROP COLUMN content_attachment_id;

DROP TABLE IF EXISTS lh_cs__content_attachments;
*/
-- =====================================================
