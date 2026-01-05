-- =====================================================
-- LH 공지사항/질의응답 테이블 생성 스크립트
-- 배포 일자: 2024-12-09
-- =====================================================

CREATE TABLE IF NOT EXISTS lh_cs__notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '공지 식별자',
    title VARCHAR(200) NOT NULL COMMENT '공지 제목',
    content TEXT NOT NULL COMMENT '공지 내용',
    file_url VARCHAR(500) NULL COMMENT '첨부 파일 URL',
    is_public TINYINT(1) NOT NULL DEFAULT 1 COMMENT '공개 여부 (1: 공개, 0: 비공개)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시'
) COMMENT 'LH 공지사항';

CREATE INDEX idx_notifications_created_at
    ON lh_cs__notifications (created_at);

CREATE TABLE IF NOT EXISTS lh_cs__question_answers (
    question_answer_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Q&A 식별자',
    title VARCHAR(200) NOT NULL COMMENT '질문 제목',
    content TEXT NOT NULL COMMENT '답변 본문',
    file_url VARCHAR(500) NULL COMMENT '첨부 파일 URL',
    is_public TINYINT(1) NOT NULL DEFAULT 1 COMMENT '공개 여부 (1: 공개, 0: 비공개)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시'
) COMMENT 'LH 질의응답';

CREATE INDEX idx_question_answers_created_at
    ON lh_cs__question_answers (created_at);

-- 롤백 스크립트 (필요 시)
-- DROP TABLE IF EXISTS lh_cs__question_answers;
-- DROP TABLE IF EXISTS lh_cs__notifications;
-- =====================================================
