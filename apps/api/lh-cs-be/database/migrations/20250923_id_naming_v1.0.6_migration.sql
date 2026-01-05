-- =====================================================
-- ID 네이밍 규칙 통일 마이그레이션 스크립트
-- 버전: v1.0.6
-- 배포일: 2025-09-23
-- 목적: 모든 테이블의 Primary Key를 table_name_id 형식으로 통일
-- =====================================================

-- 배포 전 백업 권장
-- mysqldump -u [username] -p [database_name] > backup_before_id_naming_$(date +%Y%m%d_%H%M%S).sql

-- =====================================================
-- 1. Primary Key 컬럼명 변경
-- =====================================================

-- 1.1 users 테이블
ALTER TABLE lh_cs__users CHANGE id user_id BIGINT AUTO_INCREMENT;

-- 1.2 tours 테이블
ALTER TABLE lh_cs__tours CHANGE id tour_id BIGINT AUTO_INCREMENT;

-- 1.3 facilities 테이블
ALTER TABLE lh_cs__facilities CHANGE id facility_id BIGINT AUTO_INCREMENT;

-- 1.4 consultations 테이블
ALTER TABLE lh_cs__consultations CHANGE id consultation_id BIGINT AUTO_INCREMENT;

-- 1.5 tour_facilities 테이블
ALTER TABLE lh_cs__tour_facilities CHANGE id tour_facility_id BIGINT AUTO_INCREMENT;

-- 1.6 consultation_histories 테이블
ALTER TABLE lh_cs__consultation_histories CHANGE id consultation_history_id BIGINT AUTO_INCREMENT;

-- 1.7 refresh_tokens 테이블
ALTER TABLE lh_cs__refresh_tokens CHANGE id refresh_token_id BIGINT AUTO_INCREMENT;

-- 1.8 user_sessions 테이블
ALTER TABLE lh_cs__user_sessions CHANGE id user_session_id BIGINT AUTO_INCREMENT;

-- =====================================================
-- 2. 배포 후 검증 쿼리
-- =====================================================

-- 2.1 모든 테이블의 PK 컬럼명 확인
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'elypecs_solution' 
  AND COLUMN_KEY = 'PRI'
  AND TABLE_NAME LIKE 'lh_cs__%'
ORDER BY TABLE_NAME;

-- 2.2 Foreign Key 관계 확인
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'elypecs_solution' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
  AND TABLE_NAME LIKE 'lh_cs__%'
ORDER BY TABLE_NAME, COLUMN_NAME;

-- =====================================================
-- 3. 롤백 스크립트 (문제 발생시)
-- =====================================================

/*
-- 주의: 애플리케이션 코드 롤백도 함께 필요

-- users 테이블 롤백
ALTER TABLE lh_cs__users CHANGE user_id id BIGINT AUTO_INCREMENT;

-- tours 테이블 롤백
ALTER TABLE lh_cs__tours CHANGE tour_id id BIGINT AUTO_INCREMENT;

-- facilities 테이블 롤백
ALTER TABLE lh_cs__facilities CHANGE facility_id id BIGINT AUTO_INCREMENT;

-- consultations 테이블 롤백
ALTER TABLE lh_cs__consultations CHANGE consultation_id id BIGINT AUTO_INCREMENT;

-- tour_facilities 테이블 롤백
ALTER TABLE lh_cs__tour_facilities CHANGE tour_facility_id id BIGINT AUTO_INCREMENT;

-- consultation_histories 테이블 롤백
ALTER TABLE lh_cs__consultation_histories CHANGE consultation_history_id id BIGINT AUTO_INCREMENT;

-- refresh_tokens 테이블 롤백
ALTER TABLE lh_cs__refresh_tokens CHANGE refresh_token_id id BIGINT AUTO_INCREMENT;

-- user_sessions 테이블 롤백
ALTER TABLE lh_cs__user_sessions CHANGE user_session_id id BIGINT AUTO_INCREMENT;
*/

-- =====================================================
-- 배포 완료 확인
-- =====================================================

SELECT 'ID 네이밍 규칙 통일 마이그레이션 v1.0.7 완료' as migration_status, NOW() as completed_at;

-- =====================================================
-- 마이그레이션 스크립트 종료
-- =====================================================