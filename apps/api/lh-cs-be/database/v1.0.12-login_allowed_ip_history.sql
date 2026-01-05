CREATE TABLE `lh_cs__login_allowed_ip_histories` (
  `login_allowed_ip_history_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'PK',
  `login_allowed_ip_id` BIGINT NOT NULL COMMENT 'login_allowed_ip 테이블의 PK',
  `ip_address` VARCHAR(45) NOT NULL COMMENT '변경된 IP 주소',
  `description` VARCHAR(255) NULL COMMENT 'IP 설명 스냅샷',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '허용 여부 스냅샷',
  `action` VARCHAR(16) NOT NULL COMMENT '변경 유형' CHECK (`action` IN ('CREATE','UPDATE','DELETE')),
  `changed_by` BIGINT NOT NULL COMMENT '변경을 수행한 사용자 ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '이력 생성 시각',
  KEY `idx_login_allowed_ip_history_ip_id` (`login_allowed_ip_id`),
  KEY `idx_login_allowed_ip_history_changed_by` (`changed_by`),
  CONSTRAINT `fk_login_allowed_ip_history_ip_id`
    FOREIGN KEY (`login_allowed_ip_id`)
    REFERENCES `lh_cs__login_allowed_ip` (`login_allowed_ip_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_login_allowed_ip_history_changed_by`
    FOREIGN KEY (`changed_by`)
    REFERENCES `lh_cs__users` (`user_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='로그인 허용 IP 변경 이력';
