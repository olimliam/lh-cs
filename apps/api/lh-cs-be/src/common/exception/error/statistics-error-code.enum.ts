import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum StatisticsErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,

  STATISTICS_INVALID_TOUR_IDS = 'STATISTICS_INVALID_TOUR_IDS',
  STATISTICS_INVALID_FACILITY_IDS = 'STATISTICS_INVALID_FACILITY_IDS',
  STATISTICS_INVALID_DATE_RANGE = 'STATISTICS_INVALID_DATE_RANGE',
}

export type StatisticsErrorData = {
  code: StatisticsErrorCode;
  message: string;
};

export const StatisticsErrorData: {
  [key in StatisticsErrorCode]: StatisticsErrorData;
} = {
  [StatisticsErrorCode.OK]: {
    code: StatisticsErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [StatisticsErrorCode.BAD_REQUEST]: {
    code: StatisticsErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [StatisticsErrorCode.INTERNAL_SERVER_ERROR]: {
    code: StatisticsErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [StatisticsErrorCode.STATISTICS_INVALID_TOUR_IDS]: {
    code: StatisticsErrorCode.STATISTICS_INVALID_TOUR_IDS,
    message: 'tourIds[] 파라미터는 최소 1개 이상이어야 합니다.',
  },
  [StatisticsErrorCode.STATISTICS_INVALID_FACILITY_IDS]: {
    code: StatisticsErrorCode.STATISTICS_INVALID_FACILITY_IDS,
    message: 'facilityIds[] 파라미터는 최소 1개 이상이어야 합니다.',
  },
  [StatisticsErrorCode.STATISTICS_INVALID_DATE_RANGE]: {
    code: StatisticsErrorCode.STATISTICS_INVALID_DATE_RANGE,
    message: '유효한 날짜 형식을 입력해주세요.',
  },
};

Object.freeze(StatisticsErrorData);
