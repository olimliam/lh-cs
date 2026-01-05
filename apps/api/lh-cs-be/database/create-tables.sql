create table lh_cs__admin_log
(
    id           bigint auto_increment comment '로그 고유 ID'
        primary key,
    action_type  varchar(16)  not null comment '이벤트 유형 (CREATE_ACCOUNT, CHANGE_NAME, CHANGE_DEPARTMENT, CHANGE_PHOTO, CHANGE_ROLE, CHANGE_PASSWORD, CHANGE_STATUS)',
    action_value varchar(500) null comment '변경된 값',
    created_at   datetime     not null comment '이벤트 발생 시간',
    user_id      bigint       not null comment '대상 사용자 ID',
    device       text         null comment '기기 정보',
    ip_address   varchar(45)  null comment 'IP 주소'
)
    comment '사용자 계정 활동 로그';

create table lh_cs__consultation_histories
(
    consultation_history_id bigint auto_increment
        primary key,
    consultation_id         bigint                              not null,
    status                  varchar(16)                         not null comment '변경된 상태 (''READY'', ''CONSULTING'', ''END'')' check (status in ('READY', 'CONSULTING', 'END')),
    created_at              timestamp default CURRENT_TIMESTAMP null,
    consultationId          bigint                              null
);

create table lh_cs__consultation_log
(
    id              bigint auto_increment comment '로그 고유 ID'
        primary key,
    action_type     varchar(16)  not null comment '이벤트 유형 (CONSULTATION_CREATE, COUNSELOR_ENTER, ADMIN_ENTER, VISITOR_ENTER, COUNSELOR_EXIT, VISITOR_EXIT, DRAWING_MODE_START, DRAWING_MODE_END, POP_OPEN, POP_CLOSE, CONSULTATION_DESTROY)',
    action_value    varchar(500) null comment '세부 값 (Marker ID, 씬ID 등)',
    created_at      datetime     not null comment '이벤트 발생 시간',
    consultation_id varchar(50)  null comment '상담실 번호',
    user_id         bigint       null comment '사용자 ID (상담원, 고객 등)',
    tour_id         varchar(50)  null comment '평형 타입 ID',
    facility_id     varchar(50)  null comment '시설물 ID',
    device          text         null comment '접속 기기 정보',
    ip_address      varchar(45)  null comment 'IP 주소'
)
    comment '상담실 활동 로그';

create index idx_consultation_action
    on lh_cs__consultation_log (consultation_id, action_type)
    comment '룸+액션 복합 조회용';

create index idx_created_at
    on lh_cs__consultation_log (created_at)
    comment '시간 기반 조회용';

create table lh_cs__consultations
(
    consultation_id        bigint auto_increment
        primary key,
    tour_id                bigint                                                        not null,
    user_id                bigint                                                        not null comment '상담원 ID',
    visitor_id             varchar(36)                                                   null comment '방문자 uuid',
    start_tour_facility_id bigint                                                        not null comment '상담 시작 시설',
    consultation_code      varchar(30)                                                   not null comment '상담원 입력 상담 코드',
    room_number            varchar(10)                                                   not null comment '6자리 상담실 번호',
    room_name              varchar(100)                                                  null comment '상담실 이름',
    enter_code             varchar(4)                                                    null comment '상담실 입장코드 (Random)',
    capacity               int                                 default 2                 null comment '수용 인원',
    status                 varchar(16) default 'READY'           not null comment '상담실 상태: READY, CONSULTING, END' check (status in ('READY', 'CONSULTING', 'END')),
    is_active              tinyint(1)                          default 1                 not null comment '활성화 상태',
    created_at             timestamp                           default CURRENT_TIMESTAMP not null,
    updated_at             timestamp                           default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    userId                 bigint                                                        null,
    tourId                 bigint                                                        null,
    startTourFacilityId    bigint                                                        null,
    consulting_started_at  timestamp                                                     null comment '상담 시작 시간 (CONSULTING 상태가 된 시점)',
    end_requested_at       timestamp                                                     null comment '상담 종료 요청 시간 (END 상태로 변경된 시점)'
);

create index idx_consultations_consulting_started_at
    on lh_cs__consultations (consulting_started_at);

create table lh_cs__facilities
(
    facility_id bigint auto_increment
        primary key,
    title       varchar(50)                          not null comment '시설명',
    description varchar(255)                         null comment '시설 설명',
    created_at  timestamp  default CURRENT_TIMESTAMP null,
    updated_at  timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    is_active   tinyint(1) default 1                 null comment '활성화 여부',
    type        varchar(16)                          not null comment '시설 유형: CONSTRUCTION, MACHINE, ELECTRICITY' check (type in ('CONSTRUCTION', 'MACHINE', 'ELECTRICITY')),
    image_url   varchar(255)                         null comment '시설 이미지 URL'
);

create table lh_cs__free_tour_log
(
    id           bigint auto_increment comment '로그 고유 ID'
        primary key,
    action_type  varchar(16)  not null comment '이벤트 유형 (VISITOR_ENTER, VISITOR_EXIT, MOVE, POP_OPEN, POP_CLOSE)' check (action_type in ('VISITOR_ENTER', 'VISITOR_EXIT', 'MOVE', 'POP_OPEN', 'POP_CLOSE')),
    action_value varchar(500) null comment '세부 값 (씬 ID 등)',
    created_at   datetime     not null comment '이벤트 발생 시간',
    session_id   varchar(100) null comment '고객 임시 ID (세션 추적용)',
    tour_id      varchar(50)  null comment '평형 타입 ID',
    facility_id  varchar(50)  null comment '시설물 ID',
    device       text         null comment '접속 기기 정보 (PC, Android, iOS)',
    ip_address   varchar(45)  null comment 'IP 주소'
)
    comment '자가점검 설정 활동 로그';

create index idx_created_at
    on lh_cs__free_tour_log (created_at)
    comment '시간 기반 조회용';


create table lh_cs__login_allowed_ip
(
    login_allowed_ip_id bigint auto_increment comment 'PK'
        primary key,
    ip_address          varchar(45)                          not null comment '허용된 클라이언트 IP 주소',
    description         varchar(255)                         null comment 'IP에 대한 설명 또는 메모',
    is_active           tinyint(1) default 1                 not null comment '허용 여부 플래그',
    created_by          bigint                               not null comment 'IP를 등록한 관리자 ID',
    created_at          timestamp  default CURRENT_TIMESTAMP not null comment '생성일시',
    updated_at          timestamp  default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '수정일시',
    constraint idx_login_allowed_ip_ip_address
        unique (ip_address),
    index idx_login_allowed_ip_created_by (created_by),
    constraint fk_login_allowed_ip_created_by
        foreign key (created_by) references lh_cs__users (user_id)
)
    comment '로그인 허용 IP 관리 테이블';

create table lh_cs__login_log
(
    id           bigint auto_increment comment '로그 고유 ID'
        primary key,
    action_type  varchar(16)  not null comment '이벤트 유형 (TRY_LOGIN, SUCCESS_LOGIN, FAIL_LOGIN)',
    action_value varchar(100) null comment '실패 사유 또는 세부 값',
    created_at   datetime     not null comment '이벤트 발생 시간',
    user_id      bigint       null comment '대상 사용자 ID (실패시 null 가능)',
    device       text         null comment '기기 정보',
    ip_address   varchar(45)  null comment 'IP 주소'
)
    comment '로그인 활동 로그';

create table lh_cs__read_consultations
(
    consultation_id         bigint                      not null comment '상담 ID (Primary Key)'
        primary key,
    room_number             varchar(10)                 not null,
    room_name               varchar(100)                null,
    consultation_code       varchar(30)                 not null,
    enter_code              varchar(4)                  null,
    status                  varchar(16) default 'READY' null comment 'READY, CONSULTING, END' check (status in ('READY', 'CONSULTING', 'END')),
    is_active               tinyint(1)  default 1       null,
    consultant_id           bigint                      not null,
    consultant_name         varchar(100)                not null,
    consultant_username     varchar(100)                not null comment '상담원 아이디',
    tour_id                 bigint                      not null,
    tour_title              varchar(50)                 not null,
    tour_square_meters      int                         not null,
    facility_id             bigint                      not null,
    facility_title          varchar(50)                 not null,
    facility_camera_pos_x   float                       null,
    facility_camera_pos_y   float                       null,
    facility_camera_pos_z   float                       null,
    visitor_id              varchar(36)                 null,
    created_at              timestamp                   not null,
    updated_at              timestamp                   not null,
    tour_facility_id        bigint                      not null comment '투어 시설 ID',
    facility_scene_id       bigint                      not null comment '시설 Scene ID',
    tour_image_url          varchar(255)                null comment '평형 이미지 URL',
    tour_cdn_id             varchar(20)                 null comment '투어 cdn ID',
    consulting_started_at   timestamp                   null comment '상담 시작 시간',
    end_requested_at        timestamp                   null comment '상담 종료 요청 시간 (END 상태로 변경된 시점)',
    start_facility_scene_id bigint      default 0       not null comment '상담 시작 시설 Scene ID'
);

create index idx_read_consultations_consulting_started_at
    on lh_cs__read_consultations (is_active, consulting_started_at);

create table lh_cs__tours
(
    tour_id       bigint auto_increment
        primary key,
    tour_cdn_id   varchar(200)                         not null comment '투어 접근 ID',
    square_meters int                                  not null comment '평형 제곱미터',
    title         varchar(50)                          not null comment '평형 정보 제목',
    description   varchar(255)                         null comment '투어 설명',
    is_active     tinyint(1) default 1                 null comment '활성화 여부',
    created_at    timestamp  default CURRENT_TIMESTAMP null,
    updated_at    timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    image_url     varchar(255)                         null comment '평형 이미지 URL'
);

create table lh_cs__tour_facilities
(
    tour_facility_id bigint auto_increment
        primary key,
    tour_id          bigint                               not null,
    facility_id      bigint                               not null,
    scene_id         bigint                               not null comment '투어 내 Scene ID',
    camera_pos_x     float                                null comment '해당 투어에서의 카메라 포지션 X',
    camera_pos_y     float                                null comment '해당 투어에서의 카메라 포지션 Y',
    camera_pos_z     float                                null comment '해당 투어에서의 카메라 포지션 Z',
    is_default_start tinyint(1) default 0                 null comment '기본 시작 위치 여부',
    display_order    int        default 0                 null comment '표시 순서',
    is_active        tinyint(1) default 1                 null comment '활성화 여부',
    created_at       timestamp  default CURRENT_TIMESTAMP null,
    updated_at       timestamp  default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    type             varchar(16)                          not null comment '시설 유형: CONSTRUCTION, MACHINE, ELECTRICITY' check (type in ('CONSTRUCTION', 'MACHINE', 'ELECTRICITY')),
    constraint unique_tour_facility_scene
        unique (tour_id, facility_id, scene_id),
    constraint tour_facilities_ibfk_1
        foreign key (tour_id) references lh_cs__tours (tour_id)
            on delete cascade,
    constraint tour_facilities_ibfk_2
        foreign key (facility_id) references lh_cs__facilities (facility_id)
            on delete cascade
)
    comment '투어별 시설 배치 정보';


create index idx_tour_default_start
    on lh_cs__tour_facilities (tour_id, is_default_start);

create index idx_tour_active_order
    on lh_cs__tour_facilities (tour_id, is_active);

create table lh_cs__user_registration_rejections
(
    user_registration_rejection_id bigint auto_increment comment '거절 이력 ID'
        primary key,
    user_id                        bigint                              not null comment '거절된 사용자 ID',
    department                     varchar(100)                        null comment '거절 당시 부서',
    signed_at                      timestamp                           not null comment '가입 신청 일시',
    rejected_at                    timestamp default CURRENT_TIMESTAMP not null comment '거절 일시',
    rejected_by                    bigint                              not null comment '거절 처리 관리자 ID',
    reason                         varchar(255)                        null comment '거절 사유',
    created_at                     timestamp default CURRENT_TIMESTAMP not null comment '레코드 생성 시각'
)
    comment '회원 가입 거절 히스토리';


create table lh_cs__users
(
    user_id             bigint auto_increment
        primary key,
    name                varchar(100)                             not null comment '사용자 이름',
    username            varchar(100)                             not null comment '로그인 아이디',
    phone_hash          char(64)                                 null comment '전화번호 SHA-256 해시',
    phone_encrypted     varbinary(256)                           null comment '암호화된 전화번호',
    phone_iv            varbinary(32)                            null comment '전화번호 암호화 IV',
    phone_tag           varbinary(32)                            null comment '전화번호 암호화 인증 태그',
    phone_verified_at   datetime                                 null comment '전화번호 인증 완료 시각',
    password_hash       varchar(255)                             not null comment '비밀번호 해시 (KCMVP PBKDF2-HMAC-SHA256)',
    password_salt       varchar(128)                             not null comment 'KCMVP 비밀번호 salt (256bit hex)',
    kdf_algorithm       varchar(50) default 'pbkdf2-hmac-sha256' not null comment 'KDF 알고리즘 (서버 정책 고정)',
    kdf_params          json                                     not null comment 'KDF 파라미터 {algorithm, iterations, hashLength}',
    pepper_version      int         default 1                    not null comment 'Pepper 버전 (HSM 키 회전용)',
    hash_created_at     timestamp   default CURRENT_TIMESTAMP    not null comment '해시 생성 시간 (감사 추적용)',
    profile_image_url   varchar(500)                             null comment '프로필 이미지 URL',
    department          varchar(100)                             null comment '부서',
    created_at          timestamp   default CURRENT_TIMESTAMP    null,
    updated_at          timestamp   default CURRENT_TIMESTAMP    null on update CURRENT_TIMESTAMP,
    signed_at           timestamp   default CURRENT_TIMESTAMP    null comment '가입 신청 시각',
    deleted_at          timestamp                                null comment '소프트 삭제',
    role                varchar(16) default 'USER'               null comment '사용자 역할 (SUPER_ADMIN, ADMIN, CONSULTANT, USER, VISITOR)' check (role in ('SUPER_ADMIN', 'ADMIN', 'CONSULTANT', 'USER', 'VISITOR')),
    status              varchar(16) default 'ACTIVE'             null comment '사용자 상태 (ACTIVE, INACTIVE, WAIT, DELETED, PASSWORD_CHANGE_REQUIRED)' check (status in ('ACTIVE', 'INACTIVE', 'WAIT', 'DELETED', 'PASSWORD_CHANGE_REQUIRED')),
    approval_status     varchar(16) default 'PENDING'            null comment '사용자 승인 상태 (PENDING, APPROVED, REJECTED)'  check (approval_status in ('PENDING', 'APPROVED', 'REJECTED')),
    approval_completed_at datetime                               null comment '가입 승인 완료 일시',
    approval_completed_by_user_id bigint                         null comment '가입 승인 처리 관리자 ID',
    is_confirmed_terms  tinyint(1) default 0                     not null comment '필수 약관 동의 여부',
    last_login_at       timestamp                                null comment '마지막 로그인 시간',
    login_attempt_count int         default 0                    null comment '로그인 시도 횟수',
    lock_reason         varchar(255)                             null comment '잠금 사유',
    lock_at             datetime                                 null comment '잠금 시각',
    last_login_attempts json                                     null comment '실패 내역 로그 (최대 5개)',
    locked_until        timestamp                                null comment '계정 잠금 해제 시간',
    lock_state          varchar(16) default 'UNLOCKED'           not null,
    constraint username_unique
        unique (username),
    constraint phone_hash_unique
        unique (phone_hash)
)
    comment '사용자 정보';

create table lh_cs__terms
(
    terms_id     bigint auto_increment
        primary key,
    title        varchar(255)                        not null comment '약관 제목',
    version      varchar(20)                         not null comment '약관 버전',
    is_required  tinyint(1) default 1                not null comment '필수 동의 여부',
    published_at datetime                            null comment '공개 일시',
    content      text                                not null comment '약관 본문',
    created_at   timestamp default CURRENT_TIMESTAMP null,
    updated_at   timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
)
    comment '약관 정보';

create table lh_cs__phone_verifications
(
    phone_verification_id bigint auto_increment
        primary key,
    phone_hash            char(64)                               null comment '전화번호 SHA-256 해시',
    phone_encrypted       varbinary(256)                         not null comment '암호화된 전화번호',
    phone_iv              varbinary(32)                          not null comment '암호화 IV',
    phone_tag             varbinary(32)                          not null comment '암호화 인증 태그',
    verification_code     char(6)                                not null comment '인증번호 6자리',
    expires_at            datetime                               not null comment '만료 시각',
    verified              tinyint(1) default 0                   not null comment '인증 여부',
    verified_at           datetime                               null comment '인증 완료 시각',
    attempt_count         int        default 0                   not null comment '인증 시도 횟수',
    created_at            timestamp   default CURRENT_TIMESTAMP  null,
    updated_at            timestamp   default CURRENT_TIMESTAMP  null on update CURRENT_TIMESTAMP,
    KEY phone_verifications_pk_hash (phone_hash)
)
    comment '전화번호 인증 코드 관리';


create index idx_phone_verifications_hash
    on lh_cs__phone_verifications (phone_hash);

create index idx_phone_verifications_expires_at
    on lh_cs__phone_verifications (expires_at);

create table lh_cs__refresh_tokens
(
    refresh_token_id bigint auto_increment
        primary key,
    user_id          bigint                              not null,
    token_hash       varchar(255)                        not null comment 'Refresh Token 해시값',
    expires_at       timestamp                           not null comment '만료 시간',
    created_at       timestamp default CURRENT_TIMESTAMP null,
    revoked_at       timestamp                           null comment '토큰 폐기 시간',
    constraint refresh_tokens_ibfk_1
        foreign key (user_id) references lh_cs__users (user_id)
            on delete cascade
)
    comment 'Refresh Token 관리';

create index idx_expires_at
    on lh_cs__refresh_tokens (expires_at);

create index idx_token_hash
    on lh_cs__refresh_tokens (token_hash);

create index idx_user_id
    on lh_cs__refresh_tokens (user_id);

create table lh_cs__user_sessions
(
    user_session_id bigint auto_increment
        primary key,
    user_id         bigint                              not null,
    ip_address      varchar(45)                         null comment 'IP 주소',
    user_agent      text                                null comment '사용자 에이전트',
    login_at        timestamp default CURRENT_TIMESTAMP null,
    logout_at       timestamp                           null,
    constraint user_sessions_ibfk_1
        foreign key (user_id) references lh_cs__users (user_id)
            on delete cascade
)
    comment '사용자 세션 로그';

create table lh_cs__login_allowed_ip_histories
(
    login_allowed_ip_history_id bigint auto_increment comment 'PK'
        primary key,
    login_allowed_ip_id         bigint                               not null comment 'login_allowed_ip 테이블의 PK',
    ip_address                  varchar(45)                          not null comment '변경된 IP 주소',
    description                 varchar(255)                         null comment 'IP 설명 스냅샷',
    is_active                   tinyint(1) default 1                 not null comment '허용 여부 스냅샷',
    action                      varchar(16)                          not null comment '변경 유형 (CREATE, UPDATE, DELETE)'
        check (action in ('CREATE', 'UPDATE', 'DELETE')),
    changed_by                  bigint                               not null comment '변경을 수행한 사용자 ID',
    created_at                  timestamp  default CURRENT_TIMESTAMP not null comment '이력 생성 시각',
    constraint fk_login_allowed_ip_history_changed_by
        foreign key (changed_by) references lh_cs__users (user_id)
            on update cascade,
    constraint fk_login_allowed_ip_history_ip_id
        foreign key (login_allowed_ip_id) references lh_cs__login_allowed_ip (login_allowed_ip_id)
            on update cascade on delete cascade
)
    comment '로그인 허용 IP 변경 이력';

create table if not exists lh_cs__notifications
(
    notification_id bigint auto_increment comment '공지 식별자'
        primary key,
    title           varchar(200)                         not null comment '공지 제목',
    content         text                                 not null comment '공지 내용',
    file_url        varchar(500)                         null comment '첨부 파일 URL',
    is_public       tinyint(1) default 1                 not null comment '공개 여부 (1: 공개, 0: 비공개)',
    created_by      bigint                               not null comment '작성자 ID',
    updated_by      bigint                               not null comment '최종 수정자 ID',
    created_at      timestamp  default CURRENT_TIMESTAMP not null comment '생성 일시',
    updated_at      timestamp  default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '수정 일시',
    constraint fk_notifications_created_by
        foreign key (created_by) references lh_cs__users (user_id)
            on update cascade on delete restrict,
    constraint fk_notifications_updated_by
        foreign key (updated_by) references lh_cs__users (user_id)
            on update cascade on delete restrict
)
    comment 'LH 공지사항';

create index idx_notifications_created_at
    on lh_cs__notifications (created_at);

create table if not exists lh_cs__question_answers
(
    question_answer_id bigint auto_increment comment 'Q&A 식별자'
        primary key,
    title              varchar(200)                         not null comment '질문 제목',
    content            text                                 not null comment '답변 본문',
    file_url           varchar(500)                         null comment '첨부 파일 URL',
    is_public          tinyint(1) default 1                 not null comment '공개 여부 (1: 공개, 0: 비공개)',
    created_by         bigint                               not null comment '작성자 ID',
    updated_by         bigint                               not null comment '최종 수정자 ID',
    created_at         timestamp  default CURRENT_TIMESTAMP not null comment '생성 일시',
    updated_at         timestamp  default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '수정 일시',
    constraint fk_question_answers_created_by
        foreign key (created_by) references lh_cs__users (user_id)
            on update cascade on delete restrict,
    constraint fk_question_answers_updated_by
        foreign key (updated_by) references lh_cs__users (user_id)
            on update cascade on delete restrict
)
    comment 'LH 질의응답';

create index idx_question_answers_created_at
    on lh_cs__question_answers (created_at);
