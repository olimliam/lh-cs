-- 상담 시작 시간 필드 추가 마이그레이션 스크립트
-- 실행 전 데이터베이스 백업을 권장합니다.

-- 1. consultations 테이블에 consulting_started_at 컬럼 추가
ALTER TABLE consultations 
ADD COLUMN consulting_started_at TIMESTAMP NULL 
COMMENT '상담 시작 시간 (CONSULTING 상태가 된 시점)';

-- 2. read_consultations 테이블에 consulting_started_at 컬럼 추가 (읽기 모델용)
ALTER TABLE read_consultations 
ADD COLUMN consulting_started_at TIMESTAMP NULL 
COMMENT '상담 시작 시간';

-- 3. 기존 CONSULTING 상태인 레코드들의 consulting_started_at을 updated_at으로 초기화 (선택적)
-- 주의: 이미 상담 중인 세션이 있다면 해당 세션의 업데이트 시간을 시작 시간으로 가정
UPDATE consultations 
SET consulting_started_at = updated_at 
WHERE status = 'CONSULTING' 
  AND consulting_started_at IS NULL;

UPDATE read_consultations 
SET consulting_started_at = updated_at 
WHERE status = 'CONSULTING' 
  AND consulting_started_at IS NULL;

-- 4. 인덱스 추가 (성능 최적화 - 선택적)
CREATE INDEX idx_consultations_consulting_started_at ON consultations(consulting_started_at);
CREATE INDEX idx_read_consultations_consulting_started_at ON read_consultations(consulting_started_at);

-- 마이그레이션 완료 확인
SELECT 
    'consultations' as table_name,
    COUNT(*) as total_records,
    COUNT(consulting_started_at) as records_with_start_time,
    COUNT(*) - COUNT(consulting_started_at) as records_without_start_time
FROM consultations
UNION ALL
SELECT 
    'read_consultations' as table_name,
    COUNT(*) as total_records,
    COUNT(consulting_started_at) as records_with_start_time,
    COUNT(*) - COUNT(consulting_started_at) as records_without_start_time
FROM read_consultations;