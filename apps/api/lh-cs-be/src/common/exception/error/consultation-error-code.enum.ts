import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

/**
 * LH-CS-BE 전용 에러 코드
 * shared ErrorCode를 확장하여 상담실 관련 에러 코드 추가
 */
export enum ConsultationErrorCode {
  // 기존 shared ErrorCode 재사용
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND = SharedErrorCode.USER_NOT_FOUND,
  DB_UPDATE_FAILED = SharedErrorCode.DB_UPDATE_FAILED,
  DB_DELETE_FAILED = SharedErrorCode.DB_DELETE_FAILED,
  DB_CREATED_FAILED = SharedErrorCode.DB_CREATED_FAILED,

  // 상담실 생성 관련
  CONSULTATION_CREATED = 'CONSULTATION_CREATED',
  CONSULTATION_CREATE_FAILED = 'CONSULTATION_CREATE_FAILED',
  CONSULTATION_ALREADY_EXISTS = 'CONSULTATION_ALREADY_EXISTS',
  CONSULTATION_CODE_ALREADY_IN_USE = 'CONSULTATION_CODE_ALREADY_IN_USE',

  // 상담실 상태 관리
  CONSULTATION_STARTED = 'CONSULTATION_STARTED',
  CONSULTATION_START_FAILED = 'CONSULTATION_START_FAILED',
  CONSULTATION_ENDED = 'CONSULTATION_ENDED',
  CONSULTATION_END_FAILED = 'CONSULTATION_END_FAILED',
  CONSULTATION_DELETED = 'CONSULTATION_DELETED',
  CONSULTATION_DELETE_FAILED = 'CONSULTATION_DELETE_FAILED',
  CONSULTATION_FETCH_FAILED = 'CONSULTATION_FETCH_FAILED',
  CONSULTATION_STATS_FAILED = 'CONSULTATION_STATS_FAILED',
  CONSULTATION_UPDATE_FAILED = 'CONSULTATION_UPDATE_FAILED',

  // 상담실 조회 관련
  CONSULTATION_NOT_FOUND = 'CONSULTATION_NOT_FOUND',
  CONSULTATION_ACCESS_DENIED = 'CONSULTATION_ACCESS_DENIED',
  CONSULTATION_INVALID_CODE = 'CONSULTATION_INVALID_CODE',
  CONSULTATION_EXPIRED = 'CONSULTATION_EXPIRED',

  // 상담실 상태 검증
  CONSULTATION_INVALID_STATUS = 'CONSULTATION_INVALID_STATUS',
  CONSULTATION_ALREADY_STARTED = 'CONSULTATION_ALREADY_STARTED',
  CONSULTATION_ALREADY_ENDED = 'CONSULTATION_ALREADY_ENDED',
  CONSULTATION_NOT_READY = 'CONSULTATION_NOT_READY',
  CONSULTATION_IN_PROGRESS = 'CONSULTATION_IN_PROGRESS',

  // 방문자 관련
  VISITOR_ALREADY_ASSIGNED = 'VISITOR_ALREADY_ASSIGNED',
  VISITOR_NOT_ASSIGNED = 'VISITOR_NOT_ASSIGNED',
  VISITOR_ASSIGN_FAILED = 'VISITOR_ASSIGN_FAILED',

  // 코드 생성 관련
  CODE_GENERATION_FAILED = 'CODE_GENERATION_FAILED',
  DUPLICATE_CODE_DETECTED = 'DUPLICATE_CODE_DETECTED',

  // 투어/설비 관련
  TOUR_NOT_FOUND = 'TOUR_NOT_FOUND',
  FACILITY_NOT_FOUND = 'FACILITY_NOT_FOUND',
  CONSULTANT_NOT_FOUND = 'CONSULTANT_NOT_FOUND',
}

export type ConsultationErrorData = {
  code: ConsultationErrorCode;
  message: string;
};

/**
 * 상담실 관련 에러 데이터
 * shared ErrorData를 확장하여 상담실 관련 메시지 추가
 */
export const ConsultationErrorData: {
  [key in ConsultationErrorCode]: ConsultationErrorData;
} = {
  // 기존 shared ErrorData 재사용
  [ConsultationErrorCode.OK]: {
    code: ConsultationErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [ConsultationErrorCode.BAD_REQUEST]: {
    code: ConsultationErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [ConsultationErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ConsultationErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [ConsultationErrorCode.USER_NOT_FOUND]: {
    code: ConsultationErrorCode.USER_NOT_FOUND,
    message: SharedErrorData[SharedErrorCode.USER_NOT_FOUND].message,
  },
  [ConsultationErrorCode.DB_UPDATE_FAILED]: {
    code: ConsultationErrorCode.DB_UPDATE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_UPDATE_FAILED].message,
  },
  [ConsultationErrorCode.DB_DELETE_FAILED]: {
    code: ConsultationErrorCode.DB_DELETE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_DELETE_FAILED].message,
  },
  [ConsultationErrorCode.DB_CREATED_FAILED]: {
    code: ConsultationErrorCode.DB_CREATED_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_CREATED_FAILED].message,
  },

  // 상담실 생성 관련
  [ConsultationErrorCode.CONSULTATION_CREATED]: {
    code: ConsultationErrorCode.CONSULTATION_CREATED,
    message: '상담실이 성공적으로 생성되었습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_CREATE_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_CREATE_FAILED,
    message: '상담실 생성에 실패했습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_ALREADY_EXISTS]: {
    code: ConsultationErrorCode.CONSULTATION_ALREADY_EXISTS,
    message: '이미 동일한 상담실이 존재합니다.',
  },
  [ConsultationErrorCode.CONSULTATION_CODE_ALREADY_IN_USE]: {
    code: ConsultationErrorCode.CONSULTATION_CODE_ALREADY_IN_USE,
    message: '이미 사용중인 상담 코드입니다.',
  },

  // 상담실 상태 관리
  [ConsultationErrorCode.CONSULTATION_STARTED]: {
    code: ConsultationErrorCode.CONSULTATION_STARTED,
    message: '상담이 성공적으로 시작되었습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_START_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_START_FAILED,
    message: '상담 시작에 실패했습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_ENDED]: {
    code: ConsultationErrorCode.CONSULTATION_ENDED,
    message: '상담이 성공적으로 종료되었습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_END_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_END_FAILED,
    message: '상담 종료에 실패했습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_UPDATE_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_UPDATE_FAILED,
    message: '상담실 업데이트에 실패했습니다.',
  },

  [ConsultationErrorCode.CONSULTATION_DELETED]: {
    code: ConsultationErrorCode.CONSULTATION_DELETED,
    message: '상담실이 성공적으로 삭제되었습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_DELETE_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_DELETE_FAILED,
    message: '상담실 삭제에 실패했습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_FETCH_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_FETCH_FAILED,
    message: '상담실 조회에 실패했습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_STATS_FAILED]: {
    code: ConsultationErrorCode.CONSULTATION_STATS_FAILED,
    message: '상담실 통계 조회에 실패했습니다.',
  },

  // 상담실 조회 관련
  [ConsultationErrorCode.CONSULTATION_NOT_FOUND]: {
    code: ConsultationErrorCode.CONSULTATION_NOT_FOUND,
    message: '상담실을 찾을 수 없습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_ACCESS_DENIED]: {
    code: ConsultationErrorCode.CONSULTATION_ACCESS_DENIED,
    message: '상담실에 접근할 권한이 없습니다.',
  },
  [ConsultationErrorCode.CONSULTATION_INVALID_CODE]: {
    code: ConsultationErrorCode.CONSULTATION_INVALID_CODE,
    message: '유효하지 않은 입장 코드입니다.',
  },
  [ConsultationErrorCode.CONSULTATION_EXPIRED]: {
    code: ConsultationErrorCode.CONSULTATION_EXPIRED,
    message: '상담실 이용 시간이 만료되었습니다.',
  },

  // 상담실 상태 검증
  [ConsultationErrorCode.CONSULTATION_INVALID_STATUS]: {
    code: ConsultationErrorCode.CONSULTATION_INVALID_STATUS,
    message: '잘못된 상담실 상태입니다.',
  },
  [ConsultationErrorCode.CONSULTATION_ALREADY_STARTED]: {
    code: ConsultationErrorCode.CONSULTATION_ALREADY_STARTED,
    message: '이미 시작된 상담실입니다.',
  },
  [ConsultationErrorCode.CONSULTATION_ALREADY_ENDED]: {
    code: ConsultationErrorCode.CONSULTATION_ALREADY_ENDED,
    message: '이미 종료된 상담실입니다.',
  },
  [ConsultationErrorCode.CONSULTATION_NOT_READY]: {
    code: ConsultationErrorCode.CONSULTATION_NOT_READY,
    message: '상담 시작 준비가 되지 않은 상담실입니다.',
  },
  [ConsultationErrorCode.CONSULTATION_IN_PROGRESS]: {
    code: ConsultationErrorCode.CONSULTATION_IN_PROGRESS,
    message: '진행 중인 상담실은 삭제할 수 없습니다.',
  },

  // 방문자 관련
  [ConsultationErrorCode.VISITOR_ALREADY_ASSIGNED]: {
    code: ConsultationErrorCode.VISITOR_ALREADY_ASSIGNED,
    message: '이미 방문자가 할당된 상담실입니다.',
  },
  [ConsultationErrorCode.VISITOR_NOT_ASSIGNED]: {
    code: ConsultationErrorCode.VISITOR_NOT_ASSIGNED,
    message: '방문자가 할당되지 않은 상담실입니다.',
  },
  [ConsultationErrorCode.VISITOR_ASSIGN_FAILED]: {
    code: ConsultationErrorCode.VISITOR_ASSIGN_FAILED,
    message: '방문자 할당에 실패했습니다.',
  },

  // 코드 생성 관련
  [ConsultationErrorCode.CODE_GENERATION_FAILED]: {
    code: ConsultationErrorCode.CODE_GENERATION_FAILED,
    message: '코드 생성에 실패했습니다.',
  },
  [ConsultationErrorCode.DUPLICATE_CODE_DETECTED]: {
    code: ConsultationErrorCode.DUPLICATE_CODE_DETECTED,
    message: '중복된 코드가 감지되었습니다.',
  },

  // 투어/설비 관련
  [ConsultationErrorCode.TOUR_NOT_FOUND]: {
    code: ConsultationErrorCode.TOUR_NOT_FOUND,
    message: '투어를 찾을 수 없습니다.',
  },
  [ConsultationErrorCode.FACILITY_NOT_FOUND]: {
    code: ConsultationErrorCode.FACILITY_NOT_FOUND,
    message: '설비를 찾을 수 없습니다.',
  },
  [ConsultationErrorCode.CONSULTANT_NOT_FOUND]: {
    code: ConsultationErrorCode.CONSULTANT_NOT_FOUND,
    message: '상담원을 찾을 수 없습니다.',
  },
};

Object.freeze(ConsultationErrorData);
