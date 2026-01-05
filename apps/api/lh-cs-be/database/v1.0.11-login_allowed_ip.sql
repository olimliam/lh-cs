CREATE TABLE `lh_cs__login_allowed_ip` (
  `login_allowed_ip_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'PK',
  `ip_address` VARCHAR(45) NOT NULL COMMENT '허용된 클라이언트 IP 주소',
  `description` VARCHAR(255) NULL COMMENT 'IP에 대한 설명 또는 메모',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '허용 여부 플래그',
  `created_by` BIGINT NOT NULL COMMENT 'IP를 등록한 관리자 ID',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
  UNIQUE KEY `idx_login_allowed_ip_ip_address` (`ip_address`),
  KEY `idx_login_allowed_ip_created_by` (`created_by`),
  CONSTRAINT `fk_login_allowed_ip_created_by` FOREIGN KEY (`created_by`) REFERENCES `lh_cs__users` (`user_id`)
) COMMENT='로그인 허용 IP 관리 테이블';

-- 기존 테이블 수정시 사용
alter table lh_cs__login_allowed_ip
    add created_by bigint not null comment 'IP를 등록한 관리자 ID';
