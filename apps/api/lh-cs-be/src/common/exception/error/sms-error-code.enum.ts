import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum SmsErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,

  SMS_TEMPLATE_NOT_FOUND = 'SMS_TEMPLATE_NOT_FOUND',
  SMS_TEMPLATE_PLACEHOLDER_MISSING = 'SMS_TEMPLATE_PLACEHOLDER_MISSING',
  SMS_SENDER_NOT_CONFIGURED = 'SMS_SENDER_NOT_CONFIGURED',
  SMS_QUEUE_FAILED = 'SMS_QUEUE_FAILED',
  SMS_TARGET_PHONE_INVALID = 'SMS_TARGET_PHONE_INVALID',
}

export type SmsErrorData = {
  code: SmsErrorCode;
  message: string;
};

export const SmsErrorData: {
  [key in SmsErrorCode]: SmsErrorData;
} = {
  [SmsErrorCode.OK]: {
    code: SmsErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [SmsErrorCode.BAD_REQUEST]: {
    code: SmsErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [SmsErrorCode.INTERNAL_SERVER_ERROR]: {
    code: SmsErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [SmsErrorCode.SMS_TEMPLATE_NOT_FOUND]: {
    code: SmsErrorCode.SMS_TEMPLATE_NOT_FOUND,
    message: '사용할 수 있는 SMS 템플릿이 없습니다.',
  },
  [SmsErrorCode.SMS_TEMPLATE_PLACEHOLDER_MISSING]: {
    code: SmsErrorCode.SMS_TEMPLATE_PLACEHOLDER_MISSING,
    message: 'SMS 템플릿에 {인증번호} 자리표시자가 필요합니다.',
  },
  [SmsErrorCode.SMS_SENDER_NOT_CONFIGURED]: {
    code: SmsErrorCode.SMS_SENDER_NOT_CONFIGURED,
    message: 'SMS 발신 설정(SMS_SENDER_PHONE, SMS_AGENT_ID)이 없습니다.',
  },
  [SmsErrorCode.SMS_QUEUE_FAILED]: {
    code: SmsErrorCode.SMS_QUEUE_FAILED,
    message: 'SMS 전송 요청을 큐에 적재하지 못했습니다.',
  },
  [SmsErrorCode.SMS_TARGET_PHONE_INVALID]: {
    code: SmsErrorCode.SMS_TARGET_PHONE_INVALID,
    message: 'SMS 수신 전화번호가 올바르지 않습니다.',
  },
};

Object.freeze(SmsErrorData);
