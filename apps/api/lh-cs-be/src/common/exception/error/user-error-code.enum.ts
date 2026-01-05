import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum UserErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,
  USER_NOT_FOUND = SharedErrorCode.USER_NOT_FOUND,

  USER_PHONE_INVALID_FORMAT = 'USER_PHONE_INVALID_FORMAT',
  USER_PHONE_ALREADY_EXISTS = 'USER_PHONE_ALREADY_EXISTS',
  USER_PROFILE_IMAGE_TOO_LARGE = 'USER_PROFILE_IMAGE_TOO_LARGE',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  USER_PASSWORD_DATA_INCOMPLETE = 'USER_PASSWORD_DATA_INCOMPLETE',
  USER_PASSWORD_INCORRECT = 'USER_PASSWORD_INCORRECT',
  USER_PASSWORD_SAME_AS_BEFORE = 'USER_PASSWORD_SAME_AS_BEFORE',
  USER_PASSWORD_CONFIRMATION_MISMATCH = 'USER_PASSWORD_CONFIRMATION_MISMATCH',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN = 'USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN',
}

export type UserErrorData = {
  code: UserErrorCode;
  message: string;
};

export const UserErrorData: { [key in UserErrorCode]: UserErrorData } = {
  [UserErrorCode.OK]: {
    code: UserErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [UserErrorCode.BAD_REQUEST]: {
    code: UserErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [UserErrorCode.INTERNAL_SERVER_ERROR]: {
    code: UserErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [UserErrorCode.USER_NOT_FOUND]: {
    code: UserErrorCode.USER_NOT_FOUND,
    message: SharedErrorData[SharedErrorCode.USER_NOT_FOUND].message,
  },
  [UserErrorCode.USER_PHONE_INVALID_FORMAT]: {
    code: UserErrorCode.USER_PHONE_INVALID_FORMAT,
    message: '유효하지 않은 전화번호 형식입니다.',
  },
  [UserErrorCode.USER_PHONE_ALREADY_EXISTS]: {
    code: UserErrorCode.USER_PHONE_ALREADY_EXISTS,
    message: '이미 사용 중인 전화번호입니다.',
  },
  [UserErrorCode.USER_PROFILE_IMAGE_TOO_LARGE]: {
    code: UserErrorCode.USER_PROFILE_IMAGE_TOO_LARGE,
    message: '500KB 이하 이미지만 등록할 수 있습니다.',
  },
  [UserErrorCode.USER_UPDATE_FAILED]: {
    code: UserErrorCode.USER_UPDATE_FAILED,
    message: '사용자 정보 업데이트에 실패했습니다.',
  },
  [UserErrorCode.USER_PASSWORD_DATA_INCOMPLETE]: {
    code: UserErrorCode.USER_PASSWORD_DATA_INCOMPLETE,
    message: '비밀번호 변경에 필요한 정보가 없습니다. 다시 로그인 후 시도해 주세요.',
  },
  [UserErrorCode.USER_PASSWORD_INCORRECT]: {
    code: UserErrorCode.USER_PASSWORD_INCORRECT,
    message: '현재 비밀번호가 일치하지 않습니다. 확인 후 다시 시도해 주세요.',
  },
  [UserErrorCode.USER_PASSWORD_SAME_AS_BEFORE]: {
    code: UserErrorCode.USER_PASSWORD_SAME_AS_BEFORE,
    message: '새 비밀번호는 기존 비밀번호와 달라야 합니다.',
  },
  [UserErrorCode.USER_PASSWORD_CONFIRMATION_MISMATCH]: {
    code: UserErrorCode.USER_PASSWORD_CONFIRMATION_MISMATCH,
    message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
  },
  [UserErrorCode.USER_ALREADY_EXISTS]: {
    code: UserErrorCode.USER_ALREADY_EXISTS,
    message: '이미 사용중인 아이디입니다.',
  },
  [UserErrorCode.USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN]: {
    code: UserErrorCode.USER_PHONE_ALREADY_REGISTERED_CONTACT_ADMIN,
    message: '이미 가입되어 있는 전화번호 입니다. 관리자에게 문의 해주세요.',
  },
};

Object.freeze(UserErrorData);
