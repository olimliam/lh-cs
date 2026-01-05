-- =====================================================
-- 콘텐츠 인라인 이미지 메타데이터 테이블 생성
-- 배포 일자: 2025-10-07
-- =====================================================

CREATE TABLE IF NOT EXISTS lh_cs__content_images (
    content_image_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '콘텐츠 이미지 식별자',
    content_id BIGINT NULL COMMENT '콘텐츠 ID (공지/문의 등)',
    content_type VARCHAR(16) NOT NULL COMMENT '콘텐츠 도메인 식별자',
    s3_key VARCHAR(500) NOT NULL COMMENT 'S3 오브젝트 키',
    url VARCHAR(1000) NOT NULL COMMENT '공개 URL',
    file_name VARCHAR(255) NULL COMMENT '업로드 시 입력 파일명',
    content_type_header VARCHAR(255) NULL COMMENT '클라이언트 전송 MIME',
    uploaded_by BIGINT NOT NULL COMMENT '업로더 사용자 ID',
    is_used TINYINT(1) NOT NULL DEFAULT 0 COMMENT '콘텐츠에서 사용 여부',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '갱신 일시',
    PRIMARY KEY (content_image_id),
    UNIQUE KEY ux_content_images_type_id_s3key (content_type, content_id, s3_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT 'HTML 인라인 이미지 메타데이터';

CREATE INDEX idx_content_images_content_id
    ON lh_cs__content_images (content_id);

CREATE INDEX idx_content_images_is_used
    ON lh_cs__content_images (is_used);

-- =====================================================
-- 롤백
-- =====================================================
/*
DROP TABLE IF EXISTS lh_cs__content_images;
*/
-- =====================================================
