-- Fix consultation ID column naming consistency
-- Date: 2025-01-25
-- Description: Read 엔티티의 PK 컬럼명을 id로 통일

-- read_consultations 테이블의 consultation_id → id 변경
-- 주의: 이 변경은 기존 FK 참조가 있다면 먼저 해당 참조를 수정해야 함

-- 1. 기존 인덱스 확인 및 백업
SHOW INDEXES FROM read_consultations WHERE Column_name = 'consultation_id';

-- 2. consultation_id를 id로 변경
ALTER TABLE read_consultations
CHANGE COLUMN consultation_id id BIGINT NOT NULL COMMENT '상담 ID (Primary Key)';

-- 3. 변경 사항 확인
DESCRIBE read_consultations;

-- 참고: TypeORM 엔티티도 함께 수정 필요
-- @PrimaryColumn({ type: 'bigint', name: 'id' })
-- id: string;

-- 또는 반대로 일관성을 위해 모든 테이블을 consultation_id로 통일할 수도 있음
-- 그 경우 consultations 테이블도 수정:
-- ALTER TABLE consultations
-- CHANGE COLUMN consultation_id consultation_id BIGINT NOT NULL AUTO_INCREMENT COMMENT '상담 ID (Primary Key)';