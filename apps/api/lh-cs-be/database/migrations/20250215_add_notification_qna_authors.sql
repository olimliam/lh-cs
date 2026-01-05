-- =====================================================
-- 공지/Q&A 작성자 추적 필드 및 FK 추가
-- 배포 일자: 2025-02-15
-- =====================================================

-- 1. 작성자 백필용 기본 사용자 설정 (필요 시 직접 수정)
SET @fallback_user_id := (
    SELECT user_id
    FROM lh_cs__users
    ORDER BY created_at ASC
    LIMIT 1
);

-- 2. 공지사항 테이블 컬럼 및 제약 추가
ALTER TABLE lh_cs__notifications
    ADD COLUMN created_by BIGINT NULL COMMENT '작성자 ID' AFTER is_public,
    ADD COLUMN updated_by BIGINT NULL COMMENT '최종 수정자 ID' AFTER created_by;

UPDATE lh_cs__notifications
SET
    created_by = COALESCE(created_by, @fallback_user_id),
    updated_by = COALESCE(updated_by, @fallback_user_id);

ALTER TABLE lh_cs__notifications
    MODIFY COLUMN created_by BIGINT NOT NULL COMMENT '작성자 ID',
    MODIFY COLUMN updated_by BIGINT NOT NULL COMMENT '최종 수정자 ID';

ALTER TABLE lh_cs__notifications
    ADD CONSTRAINT fk_notifications_created_by
        FOREIGN KEY (created_by) REFERENCES lh_cs__users (user_id)
            ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD CONSTRAINT fk_notifications_updated_by
        FOREIGN KEY (updated_by) REFERENCES lh_cs__users (user_id)
            ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE INDEX idx_notifications_created_by
    ON lh_cs__notifications (created_by);

CREATE INDEX idx_notifications_updated_by
    ON lh_cs__notifications (updated_by);

-- 3. Q&A 테이블 컬럼 및 제약 추가
ALTER TABLE lh_cs__question_answers
    ADD COLUMN created_by BIGINT NULL COMMENT '작성자 ID' AFTER is_public,
    ADD COLUMN updated_by BIGINT NULL COMMENT '최종 수정자 ID' AFTER created_by;

UPDATE lh_cs__question_answers
SET
    created_by = COALESCE(created_by, @fallback_user_id),
    updated_by = COALESCE(updated_by, @fallback_user_id);

ALTER TABLE lh_cs__question_answers
    MODIFY COLUMN created_by BIGINT NOT NULL COMMENT '작성자 ID',
    MODIFY COLUMN updated_by BIGINT NOT NULL COMMENT '최종 수정자 ID';

ALTER TABLE lh_cs__question_answers
    ADD CONSTRAINT fk_question_answers_created_by
        FOREIGN KEY (created_by) REFERENCES lh_cs__users (user_id)
            ON UPDATE CASCADE ON DELETE RESTRICT,
    ADD CONSTRAINT fk_question_answers_updated_by
        FOREIGN KEY (updated_by) REFERENCES lh_cs__users (user_id)
            ON UPDATE CASCADE ON DELETE RESTRICT;

CREATE INDEX idx_question_answers_created_by
    ON lh_cs__question_answers (created_by);

CREATE INDEX idx_question_answers_updated_by
    ON lh_cs__question_answers (updated_by);

-- =====================================================
-- 롤백 스크립트 (필요 시)
-- =====================================================
/*
ALTER TABLE lh_cs__notifications
    DROP FOREIGN KEY fk_notifications_created_by,
    DROP FOREIGN KEY fk_notifications_updated_by,
    DROP COLUMN created_by,
    DROP COLUMN updated_by;

ALTER TABLE lh_cs__question_answers
    DROP FOREIGN KEY fk_question_answers_created_by,
    DROP FOREIGN KEY fk_question_answers_updated_by,
    DROP COLUMN created_by,
    DROP COLUMN updated_by;

DROP INDEX idx_notifications_created_by ON lh_cs__notifications;
DROP INDEX idx_notifications_updated_by ON lh_cs__notifications;
DROP INDEX idx_question_answers_created_by ON lh_cs__question_answers;
DROP INDEX idx_question_answers_updated_by ON lh_cs__question_answers;
*/
-- =====================================================
