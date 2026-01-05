-- Rename id column to consultation_id in read_consultations table
-- Date: 2025-01-25
-- Description: 현재 DB의 id 컬럼을 consultation_id로 변경 (TypeORM 엔티티와 매핑)

USE olim_common_dev; -- 또는 해당 스키마명

-- 1. 현재 테이블 구조 확인
DESCRIBE read_consultations;

-- 2. 기존 인덱스 확인
SHOW INDEXES FROM read_consultations WHERE Column_name = 'id';

-- 3. 외래키 제약조건 확인 (있다면 먼저 삭제해야 함)
SELECT
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'olim_common_dev'
  AND TABLE_NAME = 'read_consultations'
  AND COLUMN_NAME = 'id'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 4. id 컬럼을 consultation_id로 변경
ALTER TABLE read_consultations
CHANGE COLUMN id consultation_id BIGINT NOT NULL COMMENT '상담 ID (Primary Key)';

-- 5. 변경 후 테이블 구조 확인
DESCRIBE read_consultations;

-- 6. Primary Key 재설정 (필요한 경우)
-- ALTER TABLE read_consultations DROP PRIMARY KEY;
-- ALTER TABLE read_consultations ADD PRIMARY KEY (consultation_id);

-- 7. 변경된 인덱스 확인
SHOW INDEXES FROM read_consultations WHERE Column_name = 'consultation_id';

-- 참고: 다른 테이블에서 read_consultations.id를 참조하는 FK가 있다면
-- 해당 테이블들도 함께 수정해야 합니다.
-- 예시:
-- ALTER TABLE some_other_table
-- CHANGE COLUMN read_consultation_id consultation_id BIGINT;