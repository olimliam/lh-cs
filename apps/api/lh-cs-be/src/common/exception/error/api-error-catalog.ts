import { ErrorCode, ErrorData as SharedErrorData, ErrorDataType } from '@packages/shared';
import { AuthErrorCode, AuthErrorData } from './auth-error-code.enum';
import {
  ConsultationErrorCode,
  ConsultationErrorData,
} from './consultation-error-code.enum';
import { TourErrorCode, TourErrorData } from './tour-error-code.enum';
import {
  FacilityErrorCode,
  FacilityErrorData,
} from './facility-error-code.enum';
import {
  NotificationErrorCode,
  NotificationErrorData,
} from './notification-error-code.enum';
import {
  QuestionAnswerErrorCode,
  QuestionAnswerErrorData,
} from './question-answer-error-code.enum';
import {
  PhoneVerificationErrorCode,
  PhoneVerificationErrorData,
} from './phone-verification-error-code.enum';
import {
  StatisticsErrorCode,
  StatisticsErrorData,
} from './statistics-error-code.enum';
import { UserErrorCode, UserErrorData } from './user-error-code.enum';
import {
  ContentImageErrorCode,
  ContentImageErrorData,
} from './content-image-error-code.enum';
import {
  SmsErrorCode,
  SmsErrorData,
} from './sms-error-code.enum';

/**
 * 에러 코드와 메시지를 도메인별로 합쳐서 관리하는 카탈로그 타입
 */
export type ErrorCatalog<Code extends string> = {
  [key in Code]: {
    code: Code;
    message: string;
  };
};

/**
 * API 전역에서 사용하는 에러 코드 유니온
 */
export type ApiErrorCode =
  | ErrorCode
  | AuthErrorCode
  | ConsultationErrorCode
  | TourErrorCode
  | FacilityErrorCode
  | NotificationErrorCode
  | QuestionAnswerErrorCode
  | PhoneVerificationErrorCode
  | StatisticsErrorCode
  | UserErrorCode
  | ContentImageErrorCode
  | SmsErrorCode;

const sharedCatalog = SharedErrorData as unknown as ErrorCatalog<ErrorCode>;
const authCatalog = AuthErrorData as unknown as ErrorCatalog<AuthErrorCode>;
const consultationCatalog =
  ConsultationErrorData as unknown as ErrorCatalog<ConsultationErrorCode>;
const tourCatalog = TourErrorData as unknown as ErrorCatalog<TourErrorCode>;
const facilityCatalog =
  FacilityErrorData as unknown as ErrorCatalog<FacilityErrorCode>;
const notificationCatalog =
  NotificationErrorData as unknown as ErrorCatalog<NotificationErrorCode>;
const questionAnswerCatalog =
  QuestionAnswerErrorData as unknown as ErrorCatalog<QuestionAnswerErrorCode>;
const phoneVerificationCatalog =
  PhoneVerificationErrorData as unknown as ErrorCatalog<PhoneVerificationErrorCode>;
const statisticsCatalog =
  StatisticsErrorData as unknown as ErrorCatalog<StatisticsErrorCode>;
const userCatalog = UserErrorData as unknown as ErrorCatalog<UserErrorCode>;
const contentImageCatalog =
  ContentImageErrorData as unknown as ErrorCatalog<ContentImageErrorCode>;
const smsCatalog = SmsErrorData as unknown as ErrorCatalog<SmsErrorCode>;

export const API_ERROR_CATALOG = {
  ...sharedCatalog,
  ...authCatalog,
  ...consultationCatalog,
  ...tourCatalog,
  ...facilityCatalog,
  ...notificationCatalog,
  ...questionAnswerCatalog,
  ...phoneVerificationCatalog,
  ...statisticsCatalog,
  ...userCatalog,
  ...contentImageCatalog,
  ...smsCatalog,
} as ErrorCatalog<ApiErrorCode>;

export const DEFAULT_SUCCESS_CODE: ErrorCode = ErrorCode.OK;
export const DEFAULT_ERROR_CODE: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;
export const DEFAULT_BAD_REQUEST_CODE: ErrorCode = ErrorCode.BAD_REQUEST;

/**
 * 런타임 코드 유효성 검사
 */
export const isApiErrorCode = (code: string): code is ApiErrorCode =>
  Object.prototype.hasOwnProperty.call(API_ERROR_CATALOG, code);

export const findErrorCodeByMessage = (message?: string): ApiErrorCode | null => {
  if (!message) {
    return null;
  }

  for (const key in API_ERROR_CATALOG) {
    if (Object.prototype.hasOwnProperty.call(API_ERROR_CATALOG, key)) {
      const entry = API_ERROR_CATALOG[key as ApiErrorCode];
      if (entry.message === message) {
        return entry.code;
      }
    }
  }

  return null;
};

export type ApiErrorPayload = ErrorDataType & { code: ApiErrorCode };
