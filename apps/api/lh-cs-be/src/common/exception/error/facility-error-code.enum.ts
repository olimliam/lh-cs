import {
  ErrorCode as SharedErrorCode,
  ErrorData as SharedErrorData,
} from '@packages/shared';

export enum FacilityErrorCode {
  OK = SharedErrorCode.OK,
  BAD_REQUEST = SharedErrorCode.BAD_REQUEST,
  INTERNAL_SERVER_ERROR = SharedErrorCode.INTERNAL_SERVER_ERROR,
  DB_UPDATE_FAILED = SharedErrorCode.DB_UPDATE_FAILED,

  FACILITY_CREATED = 'FACILITY_CREATED',
  FACILITY_FETCHED = 'FACILITY_FETCHED',
  FACILITY_LIST_FETCHED = 'FACILITY_LIST_FETCHED',
  FACILITY_UPDATED_SUCCESS = 'FACILITY_UPDATED_SUCCESS',
  FACILITY_DELETED_SUCCESS = 'FACILITY_DELETED_SUCCESS',
  FACILITY_HARD_DELETED_SUCCESS = 'FACILITY_HARD_DELETED_SUCCESS',

  FACILITY_NOT_FOUND = 'FACILITY_NOT_FOUND',
  FACILITY_ALREADY_EXISTS = 'FACILITY_ALREADY_EXISTS',
  FACILITY_UPDATE_FAILED = 'FACILITY_UPDATE_FAILED',
}

export type FacilityErrorData = {
  code: FacilityErrorCode;
  message: string;
};

export const FacilityErrorData: {
  [key in FacilityErrorCode]: FacilityErrorData;
} = {
  [FacilityErrorCode.OK]: {
    code: FacilityErrorCode.OK,
    message: SharedErrorData[SharedErrorCode.OK].message,
  },
  [FacilityErrorCode.BAD_REQUEST]: {
    code: FacilityErrorCode.BAD_REQUEST,
    message: SharedErrorData[SharedErrorCode.BAD_REQUEST].message,
  },
  [FacilityErrorCode.INTERNAL_SERVER_ERROR]: {
    code: FacilityErrorCode.INTERNAL_SERVER_ERROR,
    message: SharedErrorData[SharedErrorCode.INTERNAL_SERVER_ERROR].message,
  },
  [FacilityErrorCode.DB_UPDATE_FAILED]: {
    code: FacilityErrorCode.DB_UPDATE_FAILED,
    message: SharedErrorData[SharedErrorCode.DB_UPDATE_FAILED].message,
  },
  [FacilityErrorCode.FACILITY_CREATED]: {
    code: FacilityErrorCode.FACILITY_CREATED,
    message: '설비가 성공적으로 생성되었습니다.',
  },
  [FacilityErrorCode.FACILITY_FETCHED]: {
    code: FacilityErrorCode.FACILITY_FETCHED,
    message: '설비 상세 조회 성공',
  },
  [FacilityErrorCode.FACILITY_LIST_FETCHED]: {
    code: FacilityErrorCode.FACILITY_LIST_FETCHED,
    message: '설비 목록 조회 성공',
  },
  [FacilityErrorCode.FACILITY_UPDATED_SUCCESS]: {
    code: FacilityErrorCode.FACILITY_UPDATED_SUCCESS,
    message: '설비가 성공적으로 수정되었습니다.',
  },
  [FacilityErrorCode.FACILITY_DELETED_SUCCESS]: {
    code: FacilityErrorCode.FACILITY_DELETED_SUCCESS,
    message: '설비가 성공적으로 삭제되었습니다.',
  },
  [FacilityErrorCode.FACILITY_HARD_DELETED_SUCCESS]: {
    code: FacilityErrorCode.FACILITY_HARD_DELETED_SUCCESS,
    message: '설비가 완전히 삭제되었습니다.',
  },
  [FacilityErrorCode.FACILITY_NOT_FOUND]: {
    code: FacilityErrorCode.FACILITY_NOT_FOUND,
    message: '설비를 찾을 수 없습니다.',
  },
  [FacilityErrorCode.FACILITY_ALREADY_EXISTS]: {
    code: FacilityErrorCode.FACILITY_ALREADY_EXISTS,
    message: '이미 존재하는 설비입니다.',
  },
  [FacilityErrorCode.FACILITY_UPDATE_FAILED]: {
    code: FacilityErrorCode.FACILITY_UPDATE_FAILED,
    message: '설비 업데이트에 실패했습니다.',
  },
};

Object.freeze(FacilityErrorData);
