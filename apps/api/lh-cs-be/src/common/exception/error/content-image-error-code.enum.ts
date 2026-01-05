import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum ContentImageErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,

  CONTENT_IMAGE_INVALID_PAYLOAD = 'CONTENT_IMAGE_INVALID_PAYLOAD',
  CONTENT_IMAGE_INVALID_MIME_TYPE = 'CONTENT_IMAGE_INVALID_MIME_TYPE',
  CONTENT_IMAGE_MAX_SIZE_EXCEEDED = 'CONTENT_IMAGE_MAX_SIZE_EXCEEDED',
  CONTENT_IMAGE_UPLOAD_FAILED = 'CONTENT_IMAGE_UPLOAD_FAILED',
  CONTENT_IMAGE_NOT_FOUND = 'CONTENT_IMAGE_NOT_FOUND',
  CONTENT_IMAGE_FORBIDDEN = 'CONTENT_IMAGE_FORBIDDEN',
}

export type ContentImageErrorData = {
  code: ContentImageErrorCode;
  message: string;
};

export const ContentImageErrorData: {
  [key in ContentImageErrorCode]: ContentImageErrorData;
} = {
  [ContentImageErrorCode.OK]: {
    code: ContentImageErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [ContentImageErrorCode.BAD_REQUEST]: {
    code: ContentImageErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [ContentImageErrorCode.INTERNAL_SERVER_ERROR]: {
    code: ContentImageErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [ContentImageErrorCode.CONTENT_IMAGE_INVALID_PAYLOAD]: {
    code: ContentImageErrorCode.CONTENT_IMAGE_INVALID_PAYLOAD,
    message: '유효한 Base64 이미지 데이터를 입력해주세요.',
  },
  [ContentImageErrorCode.CONTENT_IMAGE_INVALID_MIME_TYPE]: {
    code: ContentImageErrorCode.CONTENT_IMAGE_INVALID_MIME_TYPE,
    message: '지원하지 않는 이미지 형식입니다.',
  },
  [ContentImageErrorCode.CONTENT_IMAGE_MAX_SIZE_EXCEEDED]: {
    code: ContentImageErrorCode.CONTENT_IMAGE_MAX_SIZE_EXCEEDED,
    message: '허용된 이미지 최대 용량을 초과했습니다.',
  },
  [ContentImageErrorCode.CONTENT_IMAGE_UPLOAD_FAILED]: {
    code: ContentImageErrorCode.CONTENT_IMAGE_UPLOAD_FAILED,
    message: '이미지 업로드에 실패했습니다.',
  },
  [ContentImageErrorCode.CONTENT_IMAGE_NOT_FOUND]: {
    code: ContentImageErrorCode.CONTENT_IMAGE_NOT_FOUND,
    message: '이미지 정보를 찾을 수 없습니다.',
  },
  [ContentImageErrorCode.CONTENT_IMAGE_FORBIDDEN]: {
    code: ContentImageErrorCode.CONTENT_IMAGE_FORBIDDEN,
    message: '이미지에 접근할 권한이 없습니다.',
  },
};

Object.freeze(ContentImageErrorData);
