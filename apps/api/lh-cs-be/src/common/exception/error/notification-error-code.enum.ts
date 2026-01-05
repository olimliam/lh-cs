import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';
import { ALLOWED_ATTACHMENT_MESSAGE } from '@/common/utils/attachment.util';

export enum NotificationErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,
  DB_UPDATE_FAILED = SharedErrorCode.DB_UPDATE_FAILED,

  NOTIFICATION_NOT_FOUND = 'NOTIFICATION_NOT_FOUND',
  NOTIFICATION_INVALID_ATTACHMENT = 'NOTIFICATION_INVALID_ATTACHMENT',
}

export type NotificationErrorData = {
  code: NotificationErrorCode;
  message: string;
};

export const NotificationErrorData: {
  [key in NotificationErrorCode]: NotificationErrorData;
} = {
  [NotificationErrorCode.OK]: {
    code: NotificationErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [NotificationErrorCode.BAD_REQUEST]: {
    code: NotificationErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [NotificationErrorCode.INTERNAL_SERVER_ERROR]: {
    code: NotificationErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [NotificationErrorCode.DB_UPDATE_FAILED]: {
    code: NotificationErrorCode.DB_UPDATE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_UPDATE_FAILED].message,
  },
  [NotificationErrorCode.NOTIFICATION_NOT_FOUND]: {
    code: NotificationErrorCode.NOTIFICATION_NOT_FOUND,
    message: '공지사항을 찾을 수 없습니다.',
  },
  [NotificationErrorCode.NOTIFICATION_INVALID_ATTACHMENT]: {
    code: NotificationErrorCode.NOTIFICATION_INVALID_ATTACHMENT,
    message: ALLOWED_ATTACHMENT_MESSAGE,
  },
};

Object.freeze(NotificationErrorData);
