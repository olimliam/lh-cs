CREATE TABLE lh_cs__admin_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '로그 고유 ID',

    -- 이벤트 기본 정보
    action_type VARCHAR(50) NOT NULL COMMENT '이벤트 유형 (create_account, change_name, change_department, change_photo, change_role, change_password, change_status)',
    action_value VARCHAR(500) COMMENT '변경된 값',
    created_at DATETIME NOT NULL COMMENT '이벤트 발생 시간',
    user_id BIGINT NOT NULL COMMENT '대상 사용자 ID',

    -- 컨텍스트 정보
    device TEXT COMMENT '기기 정보',
    ip_address VARCHAR(45) COMMENT 'IP 주소',

    -- 인덱스
    INDEX idx_created_at (created_at) COMMENT '시간 기반 조회용',
    INDEX idx_user_id (user_id) COMMENT '사용자별 조회용',
    INDEX idx_action_type (action_type) COMMENT '액션 타입별 조회용',
    INDEX idx_user_action (user_id, action_type) COMMENT '사용자+액션 복합 조회용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 계정 활동 로그';


CREATE TABLE lh_cs__login_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '로그 고유 ID',

    -- 이벤트 기본 정보
    action_type VARCHAR(50) NOT NULL COMMENT '이벤트 유형 (try_login, success_login, fail_login)',
    action_value VARCHAR(100) COMMENT '실패 사유 또는 세부 값',
    created_at DATETIME NOT NULL COMMENT '이벤트 발생 시간',
    user_id BIGINT COMMENT '대상 사용자 ID (실패시 null 가능)',

    -- 컨텍스트 정보
    device TEXT COMMENT '기기 정보',
    ip_address VARCHAR(45) COMMENT 'IP 주소',

    -- 인덱스
    INDEX idx_created_at (created_at) COMMENT '시간 기반 조회용',
    INDEX idx_user_id (user_id) COMMENT '사용자별 조회용',
    INDEX idx_action_type (action_type) COMMENT '액션 타입별 조회용',
    INDEX idx_user_action (user_id, action_type) COMMENT '사용자+액션 복합 조회용',
    INDEX idx_ip_address (ip_address) COMMENT 'IP 기반 조회용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='로그인 활동 로그';


CREATE TABLE lh_cs__free_tour_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '로그 고유 ID',

    -- 이벤트 기본 정보
    action_type VARCHAR(50) NOT NULL COMMENT '이벤트 유형 (visitor_enter, visitor_exit, move, pop_open, pop_close)',
    action_value VARCHAR(500) COMMENT '세부 값 (씬 ID 등)',
    created_at DATETIME NOT NULL COMMENT '이벤트 발생 시간',

    -- 세션 및 컨텍스트 정보
    session_id VARCHAR(100) COMMENT '고객 임시 ID (세션 추적용)',
    tour_id VARCHAR(50) COMMENT '평형 타입 ID',
    facility_id VARCHAR(50) COMMENT '시설물 ID',

    -- 접속 정보
    device TEXT COMMENT '접속 기기 정보 (PC, Android, iOS)',
    ip_address VARCHAR(45) COMMENT 'IP 주소',

    -- 인덱스
    INDEX idx_created_at (created_at) COMMENT '시간 기반 조회용',
    INDEX idx_session_id (session_id) COMMENT '세션별 조회용',
    INDEX idx_action_type (action_type) COMMENT '액션 타입별 조회용',
    INDEX idx_session_action (session_id, action_type) COMMENT '세션+액션 복합 조회용',
    INDEX idx_tour_id (tour_id) COMMENT '평형 타입별 조회용',
    INDEX idx_facility_id (facility_id) COMMENT '시설물별 조회용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='자가점검 설정 활동 로그';


CREATE TABLE lh_cs__consultation_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '로그 고유 ID',

    -- 이벤트 기본 정보
    action_type VARCHAR(50) NOT NULL COMMENT '이벤트 유형 (consultation_create, counselor_enter, admin_enter, visitor_enter, counselor_exit, visitor_exit, drawing_mode_start, drawing_mode_end, pop_open, pop_close, consultation_destroy)',
    action_value VARCHAR(500) COMMENT '세부 값 (Marker ID, 씬ID 등)',
    created_at DATETIME NOT NULL COMMENT '이벤트 발생 시간',

    -- 상담실 및 사용자 정보
    consultation_id VARCHAR(50) COMMENT '상담실 번호',
    user_id BIGINT COMMENT '사용자 ID (상담원, 고객 등)',
    tour_id VARCHAR(50) COMMENT '평형 타입 ID',
    facility_id VARCHAR(50) COMMENT '시설물 ID',

    -- 접속 정보
    device TEXT COMMENT '접속 기기 정보',
    ip_address VARCHAR(45) COMMENT 'IP 주소',

    -- 인덱스
    INDEX idx_created_at (created_at) COMMENT '시간 기반 조회용',
    INDEX idx_consultation_id (consultation_id) COMMENT '룸별 조회용',
    INDEX idx_user_id (user_id) COMMENT '사용자별 조회용',
    INDEX idx_action_type (action_type) COMMENT '액션 타입별 조회용',
    INDEX idx_consultation_action (consultation_id, action_type) COMMENT '룸+액션 복합 조회용',
    INDEX idx_tour_id (tour_id) COMMENT '평형 타입별 조회용',
    INDEX idx_facility_id (facility_id) COMMENT '시설물별 조회용'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='상담실 활동 로그';
