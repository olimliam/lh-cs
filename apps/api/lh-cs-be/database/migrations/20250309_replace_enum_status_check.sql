-- =============================================================
-- ENUM → VARCHAR(16) + CHECK Constraint Migration
-- 작성일: 2025-03-09
-- 목적: MySQL ENUM 의존성을 제거하고 CHECK 제약 기반 문자열 컬럼으로 전환
-- 사전 작업: 충분한 백업 및 트랜잭션 범위 확인
-- =============================================================

-- 0. 대상 스키마 선택 (필요 시 주석 해제 후 사용)
-- USE `elypecs_solution`;

-- 1. 상담실 상태 값 전환
ALTER TABLE `lh_cs__consultations`
  MODIFY COLUMN `status`
    VARCHAR(16) NOT NULL
    DEFAULT 'READY'
    COMMENT '상담실 상태: READY, CONSULTING, END'
    CHECK (`status` IN ('READY','CONSULTING','END'));

ALTER TABLE `lh_cs__consultation_histories`
  MODIFY COLUMN `status`
    VARCHAR(16) NOT NULL
    COMMENT '변경된 상태 (''READY'', ''CONSULTING'', ''END'')'
    CHECK (`status` IN ('READY','CONSULTING','END'));

ALTER TABLE `lh_cs__read_consultations`
  MODIFY COLUMN `status`
    VARCHAR(16) NULL
    DEFAULT 'READY'
    COMMENT '''READY'', ''CONSULTING'', ''END'''
    CHECK (`status` IN ('READY','CONSULTING','END'));

-- 2. 로그인 허용 IP 변경 이력 액션 전환
ALTER TABLE `lh_cs__login_allowed_ip_histories`
  MODIFY COLUMN `action`
    VARCHAR(16) NOT NULL
    COMMENT '변경 유형'
    CHECK (`action` IN ('CREATE','UPDATE','DELETE'));

ALTER TABLE `lh_cs__users`
  MODIFY COLUMN `status`
    VARCHAR(16) NULL
    DEFAULT 'active'
    COMMENT '사용자 상태'
    CHECK (`status` IN ('ACTIVE','INACTIVE','SUSPENDED','PASSWORD_CHANGE_REQUIRED'));

ALTER TABLE `lh_cs__users`
  MODIFY COLUMN `role`
    VARCHAR(16) NULL
    DEFAULT 'consultant'
    COMMENT '사용자 상태'
    CHECK (`role` IN ('CONSULTANT','ADMIN','SUPER_ADMIN'));

ALTER TABLE `lh_cs__users`
  MODIFY COLUMN `approval_status`
    VARCHAR(16) NULL
    DEFAULT 'pending'
    COMMENT '사용자 승인 상태'
    CHECK (`approval_status` IN ('PENDING','APPROVED','REJECTED'));


-- 4. 패스워드 보안 감사 이벤트 타입 (스키마별 길이 조정)
ALTER TABLE `lh_cs_password_security_audit`
  MODIFY COLUMN IF EXISTS `event_type`
    VARCHAR(32) NOT NULL
    COMMENT '보안 이벤트 유형'
    CHECK (
      `event_type` IN (
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'ADMIN_PASSWORD_CHANGE',
        'ADMIN_PASSWORD_RESET',
        'KCMVP_MIGRATION',
        'HASH_UPGRADE',
        'PEPPER_ROTATION'
      )
    );

-- 5. 검증 쿼리 (실행 후 결과 확인)
SELECT TABLE_SCHEMA,
       TABLE_NAME,
       COLUMN_NAME,
       DATA_TYPE,
       COLUMN_TYPE
  FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE()
   AND DATA_TYPE = 'enum';
