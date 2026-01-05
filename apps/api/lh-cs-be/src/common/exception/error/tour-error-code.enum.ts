import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum TourErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,
  DB_UPDATE_FAILED = SharedErrorCode.DB_UPDATE_FAILED,

  TOUR_CREATED = 'TOUR_CREATED',
  TOUR_FETCHED = 'TOUR_FETCHED',
  TOUR_LIST_FETCHED = 'TOUR_LIST_FETCHED',
  TOUR_UPDATED_SUCCESS = 'TOUR_UPDATED_SUCCESS',
  TOUR_DELETED_SUCCESS = 'TOUR_DELETED_SUCCESS',
  TOUR_HARD_DELETED_SUCCESS = 'TOUR_HARD_DELETED_SUCCESS',

  TOUR_ALREADY_EXISTS = 'TOUR_ALREADY_EXISTS',
  TOUR_NOT_FOUND = 'TOUR_NOT_FOUND',
  TOUR_UPDATE_FAILED = 'TOUR_UPDATE_FAILED',
}

export type TourErrorData = {
  code: TourErrorCode;
  message: string;
};

export const TourErrorData: { [key in TourErrorCode]: TourErrorData } = {
  [TourErrorCode.OK]: {
    code: TourErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [TourErrorCode.BAD_REQUEST]: {
    code: TourErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [TourErrorCode.INTERNAL_SERVER_ERROR]: {
    code: TourErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [TourErrorCode.DB_UPDATE_FAILED]: {
    code: TourErrorCode.DB_UPDATE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_UPDATE_FAILED].message,
  },
  [TourErrorCode.TOUR_CREATED]: {
    code: TourErrorCode.TOUR_CREATED,
    message: '투어가 성공적으로 생성되었습니다.',
  },
  [TourErrorCode.TOUR_FETCHED]: {
    code: TourErrorCode.TOUR_FETCHED,
    message: '투어 조회 성공',
  },
  [TourErrorCode.TOUR_LIST_FETCHED]: {
    code: TourErrorCode.TOUR_LIST_FETCHED,
    message: '투어 목록 조회 성공',
  },
  [TourErrorCode.TOUR_UPDATED_SUCCESS]: {
    code: TourErrorCode.TOUR_UPDATED_SUCCESS,
    message: '투어가 성공적으로 수정되었습니다.',
  },
  [TourErrorCode.TOUR_DELETED_SUCCESS]: {
    code: TourErrorCode.TOUR_DELETED_SUCCESS,
    message: '투어가 성공적으로 삭제되었습니다.',
  },
  [TourErrorCode.TOUR_HARD_DELETED_SUCCESS]: {
    code: TourErrorCode.TOUR_HARD_DELETED_SUCCESS,
    message: '투어가 완전히 삭제되었습니다.',
  },
  [TourErrorCode.TOUR_ALREADY_EXISTS]: {
    code: TourErrorCode.TOUR_ALREADY_EXISTS,
    message: '이미 존재하는 투어 ID입니다.',
  },
  [TourErrorCode.TOUR_NOT_FOUND]: {
    code: TourErrorCode.TOUR_NOT_FOUND,
    message: '투어를 찾을 수 없습니다.',
  },
  [TourErrorCode.TOUR_UPDATE_FAILED]: {
    code: TourErrorCode.TOUR_UPDATE_FAILED,
    message: '투어 업데이트에 실패했습니다.',
  },
};

Object.freeze(TourErrorData);
