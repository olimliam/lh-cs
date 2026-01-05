import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum PhoneVerificationErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,

  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  PHONE_ALREADY_REGISTERED = 'PHONE_ALREADY_REGISTERED',
  VERIFICATION_CODE_REQUIRED = 'VERIFICATION_CODE_REQUIRED',
  VERIFICATION_CODE_EXPIRED = 'VERIFICATION_CODE_EXPIRED',
  VERIFICATION_ATTEMPT_EXCEEDED = 'VERIFICATION_ATTEMPT_EXCEEDED',
  VERIFICATION_CODE_MISMATCH = 'VERIFICATION_CODE_MISMATCH',
  VERIFICATION_RECORD_NOT_FOUND = 'VERIFICATION_RECORD_NOT_FOUND',
  VERIFICATION_CODE_INVALID_FORMAT = 'VERIFICATION_CODE_INVALID_FORMAT',
}

export type PhoneVerificationErrorData = {
  code: PhoneVerificationErrorCode;
  message: string;
};

export const PhoneVerificationErrorData: {
  [key in PhoneVerificationErrorCode]: PhoneVerificationErrorData;
} = {
  [PhoneVerificationErrorCode.OK]: {
    code: PhoneVerificationErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [PhoneVerificationErrorCode.BAD_REQUEST]: {
    code: PhoneVerificationErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [PhoneVerificationErrorCode.INTERNAL_SERVER_ERROR]: {
    code: PhoneVerificationErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [PhoneVerificationErrorCode.INVALID_PHONE_FORMAT]: {
    code: PhoneVerificationErrorCode.INVALID_PHONE_FORMAT,
    message: '유효하지 않은 전화번호 형식입니다.',
  },
  [PhoneVerificationErrorCode.PHONE_ALREADY_REGISTERED]: {
    code: PhoneVerificationErrorCode.PHONE_ALREADY_REGISTERED,
    message: '이미 가입된 전화번호입니다.',
  },
  [PhoneVerificationErrorCode.VERIFICATION_CODE_REQUIRED]: {
    code: PhoneVerificationErrorCode.VERIFICATION_CODE_REQUIRED,
    message: '인증번호를 먼저 요청해 주세요.',
  },
  [PhoneVerificationErrorCode.VERIFICATION_CODE_EXPIRED]: {
    code: PhoneVerificationErrorCode.VERIFICATION_CODE_EXPIRED,
    message: '인증번호가 만료되었습니다.',
  },
  [PhoneVerificationErrorCode.VERIFICATION_ATTEMPT_EXCEEDED]: {
    code: PhoneVerificationErrorCode.VERIFICATION_ATTEMPT_EXCEEDED,
    message: '인증번호 입력 제한 횟수를 초과했습니다.',
  },
  [PhoneVerificationErrorCode.VERIFICATION_CODE_MISMATCH]: {
    code: PhoneVerificationErrorCode.VERIFICATION_CODE_MISMATCH,
    message: '인증번호가 일치하지 않습니다.',
  },
  [PhoneVerificationErrorCode.VERIFICATION_RECORD_NOT_FOUND]: {
    code: PhoneVerificationErrorCode.VERIFICATION_RECORD_NOT_FOUND,
    message: '해당 전화번호로 발급된 인증번호가 없습니다.',
  },
  [PhoneVerificationErrorCode.VERIFICATION_CODE_INVALID_FORMAT]: {
    code: PhoneVerificationErrorCode.VERIFICATION_CODE_INVALID_FORMAT,
    message: '인증번호는 숫자 6자리 형식이어야 합니다.',
  },
};

Object.freeze(PhoneVerificationErrorData);
