-- 현재 CONSULTING 상태인 상담실에 시작 시간 설정
-- 이미 상담 중인 세션에 시작 시간이 없는 경우를 위한 임시 수정

-- 1. consultations 테이블에서 CONSULTING 상태이지만 consulting_started_at이 NULL인 레코드 확인
SELECT id, status, consulting_started_at, updated_at 
FROM consultations 
WHERE status = 'CONSULTING' AND consulting_started_at IS NULL;

-- 2. 해당 레코드들의 consulting_started_at을 updated_at으로 설정 (임시 조치)
UPDATE consultations 
SET consulting_started_at = updated_at 
WHERE status = 'CONSULTING' 
  AND consulting_started_at IS NULL;

-- 3. read_consultations 테이블도 동일하게 업데이트
UPDATE read_consultations 
SET consulting_started_at = updated_at 
WHERE status = 'CONSULTING' 
  AND consulting_started_at IS NULL;

-- 4. 업데이트 결과 확인
SELECT id, status, consulting_started_at, updated_at 
FROM consultations 
WHERE status = 'CONSULTING';

-- 실행 후 브라우저에서 페이지 새로고침하면 타이머가 정상 작동할 것입니다.