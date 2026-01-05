
  CREATE TABLE IF NOT EXISTS `lh_cs__vision_ai_tokens` (
    `id` CHAR(36) NOT NULL COMMENT 'UUID(PK)',
    `jti` VARCHAR(64) NOT NULL COMMENT 'JWT ID (1회성 키)',
    `token_type` ENUM('EPT') NOT NULL DEFAULT 'EPT' COMMENT '토큰 유형',
    `user_id` VARCHAR(64) NOT NULL COMMENT '발급 사용자 ID',
    `origin` VARCHAR(255) NOT NULL COMMENT '허용된 iframe origin',
    `audience` VARCHAR(255) NOT NULL COMMENT '허용된 audience(app id)',
    `scope` VARCHAR(255) NOT NULL COMMENT '권한 범위',
    `expires_at` DATETIME NOT NULL COMMENT '만료 시각',
    `redeemed_at` DATETIME NULL COMMENT '1회 사용 완료 시각',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시각',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시각',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_lh_cs__vision_ai_tokens_jti` (`jti`),
    KEY `idx_lh_cs__vision_ai_tokens_expires_at` (`expires_at`)
  ) ENGINE=InnoDB
    DEFAULT CHARSET=utf8mb4
    COLLATE=utf8mb4_unicode_ci
    COMMENT='비전AI EPT 1회성 관리 테이블';