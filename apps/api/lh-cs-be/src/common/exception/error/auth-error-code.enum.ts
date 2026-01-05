import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

/**
 * LH-CS-BE 전용 에러 코드
 * shared ErrorCode를 확장하여 상담실 관련 에러 코드 추가
 */
export enum AuthErrorCode {
  // 기존 shared ErrorCode 재사용
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND = SharedErrorCode.USER_NOT_FOUND,
  USER_ALREADY_EXIST = SharedErrorCode.USER_ALREADY_EXIST,
  DB_UPDATE_FAILED = SharedErrorCode.DB_UPDATE_FAILED,
  DB_DELETE_FAILED = SharedErrorCode.DB_DELETE_FAILED,
  DB_CREATED_FAILED = SharedErrorCode.DB_CREATED_FAILED,

  INVALID_TOKEN = 'INVALID_TOKEN',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Refresh Token 관련
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_REVOKED = 'REFRESH_TOKEN_REVOKED',

  // CSRF 관련
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  CSRF_TOKEN_REQUIRED = 'CSRF_TOKEN_REQUIRED',

  // 세션 관련
  SESSION_TOKEN_MISMATCH = 'SESSION_TOKEN_MISMATCH',
  SESSION_INVALID_FOR_REFRESH = 'SESSION_INVALID_FOR_REFRESH',
  SESSION_EXPIRED_LOGIN_REQUIRED = 'SESSION_EXPIRED_LOGIN_REQUIRED',

  // 사용자 관련
  USER_INACTIVE = 'USER_INACTIVE',
  USER_NOT_APPROVED = 'USER_NOT_APPROVED',
  USER_NOT_FOUND_OR_INACTIVE = 'USER_NOT_FOUND_OR_INACTIVE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  LOGIN_PASSWORD_MISMATCH = 'LOGIN_PASSWORD_MISMATCH',
  PASSWORD_CONFIRMATION_MISMATCH = 'PASSWORD_CONFIRMATION_MISMATCH',

  AUTHORIZATION_HEADER_MISSING = 'AUTHORIZATION_HEADER_MISSING',

  // IP 화이트리스트 관련
  NOT_ALLOW_IP = 'NOT_ALLOW_IP',

  // 방문자 관련
  VISITOR_INVALID_ENTER_CODE = 'VISITOR_INVALID_ENTER_CODE',
  VISITOR_FORBIDDEN_CONSULTATION = 'VISITOR_FORBIDDEN_CONSULTATION',
  VISITOR_CONSULTATION_NOT_ACTIVE = 'VISITOR_CONSULTATION_NOT_ACTIVE',
  VISITOR_ID_INVALID_FORMAT = 'VISITOR_ID_INVALID_FORMAT',

  TERMS_NOT_AGREED = 'TERMS_NOT_AGREED',
}

export type AuthErrorData = {
  code: AuthErrorCode;
  message: string;
};

/**
 * 상담실 관련 에러 데이터
 * shared ErrorData를 확장하여 상담실 관련 메시지 추가
 */
export const AuthErrorData: {
  [key in AuthErrorCode]: AuthErrorData;
} = {
  // 기존 shared ErrorData 재사용
  [AuthErrorCode.OK]: {
    code: AuthErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [AuthErrorCode.BAD_REQUEST]: {
    code: AuthErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [AuthErrorCode.INTERNAL_SERVER_ERROR]: {
    code: AuthErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [AuthErrorCode.USER_NOT_FOUND]: {
    code: AuthErrorCode.USER_NOT_FOUND,
    message: SharedErrorData[SharedErrorCode.USER_NOT_FOUND].message,
  },
  [AuthErrorCode.USER_ALREADY_EXIST]: {
    code: AuthErrorCode.USER_ALREADY_EXIST,
    message: SharedErrorData[SharedErrorCode.USER_ALREADY_EXIST].message,
  },
  [AuthErrorCode.DB_UPDATE_FAILED]: {
    code: AuthErrorCode.DB_UPDATE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_UPDATE_FAILED].message,
  },
  [AuthErrorCode.DB_DELETE_FAILED]: {
    code: AuthErrorCode.DB_DELETE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_DELETE_FAILED].message,
  },
  [AuthErrorCode.DB_CREATED_FAILED]: {
    code: AuthErrorCode.DB_CREATED_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_CREATED_FAILED].message,
  },
  [AuthErrorCode.INVALID_TOKEN]: {
    code: AuthErrorCode.INVALID_TOKEN,
    message: '유효하지 않은 access token입니다.',
  },
  [AuthErrorCode.INVALID_REFRESH_TOKEN]: {
    code: AuthErrorCode.INVALID_REFRESH_TOKEN,
    message: '유효하지 않은 refresh token입니다.',
  },
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    code: AuthErrorCode.INVALID_CREDENTIALS,
    message: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
  // Refresh Token 관련
  [AuthErrorCode.REFRESH_TOKEN_NOT_FOUND]: {
    code: AuthErrorCode.REFRESH_TOKEN_NOT_FOUND,
    message: 'Refresh token을 찾을 수 없습니다.',
  },
  [AuthErrorCode.REFRESH_TOKEN_EXPIRED]: {
    code: AuthErrorCode.REFRESH_TOKEN_EXPIRED,
    message: 'Refresh token이 만료되었습니다.',
  },
  [AuthErrorCode.REFRESH_TOKEN_REVOKED]: {
    code: AuthErrorCode.REFRESH_TOKEN_REVOKED,
    message: 'Refresh token이 폐기되었습니다.',
  },
  // CSRF 관련
  [AuthErrorCode.CSRF_TOKEN_INVALID]: {
    code: AuthErrorCode.CSRF_TOKEN_INVALID,
    message: '유효하지 않은 CSRF token입니다.',
  },
  [AuthErrorCode.CSRF_TOKEN_REQUIRED]: {
    code: AuthErrorCode.CSRF_TOKEN_REQUIRED,
    message: 'CSRF token이 필요합니다.',
  },
  // 세션 관련
  [AuthErrorCode.SESSION_TOKEN_MISMATCH]: {
    code: AuthErrorCode.SESSION_TOKEN_MISMATCH,
    message: '세션의 토큰과 요청의 토큰이 일치하지 않습니다.',
  },
  [AuthErrorCode.SESSION_INVALID_FOR_REFRESH]: {
    code: AuthErrorCode.SESSION_INVALID_FOR_REFRESH,
    message: '토큰 갱신을 위한 세션이 유효하지 않습니다.',
  },
  [AuthErrorCode.SESSION_EXPIRED_LOGIN_REQUIRED]: {
    code: AuthErrorCode.SESSION_EXPIRED_LOGIN_REQUIRED,
    message: '세션이 만료되어 다시 로그인해야 합니다.',
  },
  // 사용자 관련
  [AuthErrorCode.USER_INACTIVE]: {
    code: AuthErrorCode.USER_INACTIVE,
    message: '비활성화된 사용자입니다.',
  },
  [AuthErrorCode.USER_NOT_APPROVED]: {
    code: AuthErrorCode.USER_NOT_APPROVED,
    message: '승인되지 않은 계정입니다.',
  },
  [AuthErrorCode.USER_NOT_FOUND_OR_INACTIVE]: {
    code: AuthErrorCode.USER_NOT_FOUND_OR_INACTIVE,
    message: '사용자를 찾을 수 없거나 비활성화된 계정입니다.',
  },
  [AuthErrorCode.ACCOUNT_LOCKED]: {
    code: AuthErrorCode.ACCOUNT_LOCKED,
    message: '계정이 일시적으로 잠겨 있습니다.',
  },
  [AuthErrorCode.LOGIN_PASSWORD_MISMATCH]: {
    code: AuthErrorCode.LOGIN_PASSWORD_MISMATCH,
    message: '비밀번호가 일치하지 않습니다.',
  },
  [AuthErrorCode.PASSWORD_CONFIRMATION_MISMATCH]: {
    code: AuthErrorCode.PASSWORD_CONFIRMATION_MISMATCH,
    message: '비밀번호 확인이 일치하지 않습니다.',
  },
  [AuthErrorCode.AUTHORIZATION_HEADER_MISSING]: {
    code: AuthErrorCode.AUTHORIZATION_HEADER_MISSING,
    message: 'Authorization header가 누락되었습니다.',
  },
  [AuthErrorCode.NOT_ALLOW_IP]: {
    code: AuthErrorCode.NOT_ALLOW_IP,
    message: '허용되지 않은 IP 주소입니다.',
  },
  // 방문자 관련
  [AuthErrorCode.VISITOR_INVALID_ENTER_CODE]: {
    code: AuthErrorCode.VISITOR_INVALID_ENTER_CODE,
    message: '잘못된 입장 코드입니다.',
  },
  [AuthErrorCode.VISITOR_FORBIDDEN_CONSULTATION]: {
    code: AuthErrorCode.VISITOR_FORBIDDEN_CONSULTATION,
    message: '해당 상담실에 입장할 수 없습니다. 올바른 상담실 링크를 사용해주세요.',
  },
  [AuthErrorCode.VISITOR_CONSULTATION_NOT_ACTIVE]: {
    code: AuthErrorCode.VISITOR_CONSULTATION_NOT_ACTIVE,
    message: '상담실이 종료되었거나 비활성화되었습니다.',
  },
  [AuthErrorCode.VISITOR_ID_INVALID_FORMAT]: {
    code: AuthErrorCode.VISITOR_ID_INVALID_FORMAT,
    message: '유효하지 않은 visitor ID 형식입니다.',
  },
  [AuthErrorCode.TERMS_NOT_AGREED]: {
    code: AuthErrorCode.TERMS_NOT_AGREED,
    message: '약관 동의가 필요합니다.',
  },
};

Object.freeze(AuthErrorData);
