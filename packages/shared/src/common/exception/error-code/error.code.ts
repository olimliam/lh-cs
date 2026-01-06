import { HttpStatus } from '@nestjs/common';

// src/common/exception/error-code/error.code.ts
class ErrorCodeVo {
  readonly status;
  readonly message;

  constructor(status: number, message: string) {
    this.status = status;
    this.message = message;
  }
}

export type ErrorCode = ErrorCodeVo;

// 아래에 에러코드 값 객체를 생성
// Create an error code instance below.
export const ENTITY_NOT_FOUND = new ErrorCodeVo(
  HttpStatus.NOT_FOUND,
  'Entity Not Found'
);
export const DUPLICATED_ENTITY = new ErrorCodeVo(
  HttpStatus.UNPROCESSABLE_ENTITY,
  'Duplicated Entity'
);
