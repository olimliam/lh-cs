-- =====================================================
-- consultations 및 read_consultations 테이블에 end_requested_at 컬럼 추가
-- =====================================================

-- 1. consultations 테이블에 end_requested_at 컬럼 추가 (기존)
ALTER TABLE consultations 
ADD COLUMN end_requested_at TIMESTAMP NULL 
COMMENT '상담 종료 요청 시간 (END 상태로 변경된 시점)';

-- 기존 END 상태 레코드에 대해 updated_at을 end_requested_at로 설정 (데이터 정합성)
UPDATE consultations 
SET end_requested_at = updated_at 
WHERE status = 'END' AND end_requested_at IS NULL;

-- =====================================================
-- 2. read_consultations 테이블에 end_requested_at 컬럼 추가 (신규)
-- =====================================================

-- end_requested_at 컬럼 추가
ALTER TABLE read_consultations 
ADD COLUMN end_requested_at TIMESTAMP NULL 
COMMENT '상담 종료 요청 시간 (END 상태로 변경된 시점)' 
AFTER consulting_started_at;

-- 기존 데이터 동기화 (consultations 테이블에서 복사)
UPDATE read_consultations rc
JOIN consultations c ON rc.id = c.id
SET rc.end_requested_at = c.end_requested_at
WHERE c.end_requested_at IS NOT NULL;

-- =====================================================
-- 3. 컬럼 추가 및 동기화 확인
-- =====================================================

-- 테이블 구조 확인
DESCRIBE consultations;
DESCRIBE read_consultations;

-- 데이터 확인
SELECT 
    'consultations' as table_name,
    id,
    room_number,
    status,
    consulting_started_at,
    end_requested_at,
    updated_at
FROM consultations 
WHERE end_requested_at IS NOT NULL
ORDER BY end_requested_at DESC
LIMIT 5

UNION ALL

SELECT 
    'read_consultations' as table_name,
    id,
    room_number,
    status,
    consulting_started_at,
    end_requested_at,
    updated_at
FROM read_consultations 
WHERE end_requested_at IS NOT NULL
ORDER BY end_requested_at DESC
LIMIT 5;

-- 동기화 상태 확인
SELECT 
    'consultations' as table_name,
    COUNT(*) as total_records,
    COUNT(end_requested_at) as has_end_requested_at,
    COUNT(CASE WHEN status = 'END' THEN 1 END) as end_status_count
FROM consultations

UNION ALL

SELECT 
    'read_consultations' as table_name,
    COUNT(*) as total_records,
    COUNT(end_requested_at) as has_end_requested_at,
    COUNT(CASE WHEN status = 'END' THEN 1 END) as end_status_count
FROM read_consultations;