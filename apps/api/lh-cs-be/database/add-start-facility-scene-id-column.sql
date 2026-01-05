-- 상담 시작 시설 Scene ID 필드 추가 마이그레이션 스크립트
-- 실행 전 데이터베이스 백업을 권장합니다.

-- 1. read_consultations 테이블에 start_facility_scene_id 컬럼 추가
ALTER TABLE read_consultations 
ADD COLUMN start_facility_scene_id BIGINT NOT NULL DEFAULT 0
COMMENT '상담 시작 시설 Scene ID';

-- 2. 기존 데이터에 대해 start_facility_scene_id 업데이트
-- consultations 테이블의 start_tour_facility_id와 매핑된 scene_id를 가져와서 업데이트
UPDATE read_consultations rc
INNER JOIN consultations c ON rc.id = c.id
INNER JOIN tour_facilities tf ON c.start_tour_facility_id = tf.id
SET rc.start_facility_scene_id = tf.scene_id;

-- 3. 인덱스 추가 (성능 최적화 - 선택적)
CREATE INDEX idx_read_consultations_start_facility_scene_id ON read_consultations(start_facility_scene_id);

-- 마이그레이션 완료 확인
SELECT 
    'read_consultations' as table_name,
    COUNT(*) as total_records,
    COUNT(start_facility_scene_id) as records_with_scene_id,
    COUNT(*) - COUNT(CASE WHEN start_facility_scene_id = 0 THEN NULL ELSE start_facility_scene_id END) as records_with_valid_scene_id
FROM read_consultations;

-- 샘플 데이터 확인 (최근 5개 레코드)
SELECT 
    id,
    room_number,
    facility_title,
    start_facility_scene_id,
    created_at
FROM read_consultations 
ORDER BY created_at DESC 
LIMIT 5;