-- 일자별 상담 통계 집계 테이블
CREATE TABLE IF NOT EXISTS lh_cs__tour_stats_daily (
    stat_date DATE NOT NULL COMMENT '통계 기준 일자 (UTC)',
    tour_id BIGINT NOT NULL COMMENT '투어 ID',
    consultations_count INT NOT NULL COMMENT '상담 세션 건수',
    total_seconds INT NOT NULL COMMENT '상담 시간 합계(초)',
    avg_seconds INT NOT NULL COMMENT '평균 상담 시간(초)',
    PRIMARY KEY (stat_date, tour_id),
    INDEX idx_tour_stats_daily_tour_id (tour_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lh_cs__tour_facility_stats_daily (
    stat_date DATE NOT NULL COMMENT '통계 기준 일자 (UTC)',
    tour_facility_id BIGINT NOT NULL COMMENT '투어 시설 ID',
    tour_id BIGINT NOT NULL COMMENT '투어 ID',
    facility_id BIGINT NOT NULL COMMENT '시설 ID',
    consultations_count INT NOT NULL COMMENT '상담 세션 건수',
    total_seconds INT NOT NULL COMMENT '상담 시간 합계(초)',
    avg_seconds INT NOT NULL COMMENT '평균 상담 시간(초)',
    PRIMARY KEY (stat_date, tour_facility_id),
    INDEX idx_tour_facility_stats_daily_tour (tour_id),
    INDEX idx_tour_facility_stats_daily_facility (facility_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
