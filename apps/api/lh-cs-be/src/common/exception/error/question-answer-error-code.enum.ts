import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';
import { ALLOWED_ATTACHMENT_MESSAGE } from '@/common/utils/attachment.util';

export enum QuestionAnswerErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,

  QUESTION_ANSWER_NOT_FOUND = 'QUESTION_ANSWER_NOT_FOUND',
  QUESTION_ANSWER_INVALID_ATTACHMENT = 'QUESTION_ANSWER_INVALID_ATTACHMENT',
}

export type QuestionAnswerErrorData = {
  code: QuestionAnswerErrorCode;
  message: string;
};

export const QuestionAnswerErrorData: {
  [key in QuestionAnswerErrorCode]: QuestionAnswerErrorData;
} = {
  [QuestionAnswerErrorCode.OK]: {
    code: QuestionAnswerErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [QuestionAnswerErrorCode.BAD_REQUEST]: {
    code: QuestionAnswerErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [QuestionAnswerErrorCode.INTERNAL_SERVER_ERROR]: {
    code: QuestionAnswerErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [QuestionAnswerErrorCode.QUESTION_ANSWER_NOT_FOUND]: {
    code: QuestionAnswerErrorCode.QUESTION_ANSWER_NOT_FOUND,
    message: 'Q&A를 찾을 수 없습니다.',
  },
  [QuestionAnswerErrorCode.QUESTION_ANSWER_INVALID_ATTACHMENT]: {
    code: QuestionAnswerErrorCode.QUESTION_ANSWER_INVALID_ATTACHMENT,
    message: ALLOWED_ATTACHMENT_MESSAGE,
  },
};

Object.freeze(QuestionAnswerErrorData);
