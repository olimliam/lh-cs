-- =====================================================
-- 회원 가입 거절 히스토리 테이블 생성
-- 배포 일자: 2024-12-10
-- =====================================================

CREATE TABLE IF NOT EXISTS lh_cs__user_registration_rejections (
    user_registration_rejection_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '거절 이력 ID',
    user_id BIGINT NOT NULL COMMENT '거절된 사용자 ID',
    department VARCHAR(100) NULL COMMENT '거절 당시 부서',
    requested_at TIMESTAMP NOT NULL COMMENT '가입 신청 일시',
    rejected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '거절 일시',
    rejected_by BIGINT NOT NULL COMMENT '거절 처리 관리자 ID',
    reason VARCHAR(255) NULL COMMENT '거절 사유',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '레코드 생성 시각'
) COMMENT '회원 가입 거절 히스토리';

-- 롤백 시
-- DROP TABLE IF EXISTS lh_cs__user_registration_rejections;
-- =====================================================

  -- 1) 신규 컬럼 추가 (없을 때만)
  ALTER TABLE lh_cs__user_registration_rejections
    ADD COLUMN signed_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 신청
  일시';

  -- 2) 기존 데이터 이관 (signed_at 비어 있으면 requested_at으로 채움)
  UPDATE lh_cs__user_registration_rejections
  SET signed_at = COALESCE(signed_at, requested_at);

  -- 3) NOT NULL로 고정 (요건이 불변이라면)
  ALTER TABLE lh_cs__user_registration_rejections
    MODIFY COLUMN signed_at TIMESTAMP NOT NULL COMMENT '가입 신청 일시';

  -- 4) 기존 컬럼 제거 (있을 때만)
  ALTER TABLE lh_cs__user_registration_rejections
    DROP COLUMN requested_at;