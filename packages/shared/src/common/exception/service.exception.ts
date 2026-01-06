// ENTITY_NOT_FOUND 값 객체(status, default-message)를 가진

import {
  DUPLICATED_ENTITY,
  ENTITY_NOT_FOUND,
  ErrorCode,
} from './error-code/error.code';

//  ServiceException 인스턴스 생성 메서드
export const EntityNotFoundException = (message?: string): ServiceException => {
  return new ServiceException(ENTITY_NOT_FOUND, message);
};

export const DuplicatedEntityException = (
  message?: string
): ServiceException => {
  return new ServiceException(DUPLICATED_ENTITY, message);
};

export class ServiceException extends Error {
  readonly errorCode: ErrorCode;

  constructor(errorCode: ErrorCode, message?: string) {
    if (!message) {
      message = errorCode.message;
    }

    super(message);

    this.errorCode = errorCode;
  }
}
