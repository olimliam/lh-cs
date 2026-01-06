export enum ErrorCode {
  OK = 'OK',

  // 유저 관련
  USER_ALREADY_EXIST = 'USER_ALREADY_EXIST',
  USER_NOT_FOUND = 'USER_NOT_FOUND',

  // 외부 인프라 통신 문제
  SEND_EMAIL_FAIL = 'SEND_EMAIL_FAIL',
  S3_BUCKET_UPLOAD_FAIL = 'S3_BUCKET_UPLOAD_FAIL',
  ENCODING_SERVER_FAIL = 'ENCODING_SERVER_FAIL',
  AWS_KMS_API_FAIL = 'AWS_KMS_API_FAIL',
  UNSUPPORTED_HTTP_METHOD = 'UNSUPPORTED_HTTP_METHOD',

  // DB 관련
  DB_UPDATE_FAILED = 'DB_UPDATE_FAILED',
  DB_DELETE_FAILED = 'DB_DELETE_FAILED',
  DB_CREATED_FAILED = 'DB_CREATED_FAILED',

  DEFAULT_ERROR = 'DEFAULT_ERROR',

  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export type ErrorDataType = {
  code: ErrorCode;
  message: string;
};

export const ErrorData: { [key in ErrorCode]: ErrorDataType } = {
  [ErrorCode.OK]: {
    code: ErrorCode.OK,
    message: '성공',
  },
  [ErrorCode.USER_ALREADY_EXIST]: {
    code: ErrorCode.USER_ALREADY_EXIST,
    message: '이미 가입된 사용자입니다.',
  },
  [ErrorCode.USER_NOT_FOUND]: {
    code: ErrorCode.USER_NOT_FOUND,
    message: '사용자를 찾을 수 없습니다.',
  },
  [ErrorCode.SEND_EMAIL_FAIL]: {
    code: ErrorCode.SEND_EMAIL_FAIL,
    message: '이메일 전송 실패',
  },
  [ErrorCode.S3_BUCKET_UPLOAD_FAIL]: {
    code: ErrorCode.S3_BUCKET_UPLOAD_FAIL,
    message: 'S3 버킷 업로드 실패',
  },
  [ErrorCode.ENCODING_SERVER_FAIL]: {
    code: ErrorCode.ENCODING_SERVER_FAIL,
    message: '인코딩을 실패했습니다.',
  },
  [ErrorCode.AWS_KMS_API_FAIL]: {
    code: ErrorCode.AWS_KMS_API_FAIL,
    message: 'AWS KMS API 실패',
  },
  [ErrorCode.UNSUPPORTED_HTTP_METHOD]: {
    code: ErrorCode.UNSUPPORTED_HTTP_METHOD,
    message: '지원하지 않는 HTTP METHOD',
  },
  [ErrorCode.DB_UPDATE_FAILED]: {
    code: ErrorCode.DB_UPDATE_FAILED,
    message: 'DB 업데이트 실패',
  },
  [ErrorCode.DB_DELETE_FAILED]: {
    code: ErrorCode.DB_DELETE_FAILED,
    message: 'DB 삭제 실패',
  },
  [ErrorCode.DB_CREATED_FAILED]: {
    code: ErrorCode.DB_CREATED_FAILED,
    message: 'DB 생성 실패',
  },
  [ErrorCode.DEFAULT_ERROR]: {
    code: ErrorCode.DEFAULT_ERROR,
    message: '알 수 없는 오류가 발생했습니다.',
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: '서버 오류',
  },
  [ErrorCode.BAD_REQUEST]: {
    code: ErrorCode.BAD_REQUEST,
    message: 'request validation failed',
  },
};

Object.freeze(ErrorData);
