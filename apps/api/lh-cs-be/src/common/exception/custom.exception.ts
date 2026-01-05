import { HttpException, HttpStatus } from '@nestjs/common';
import {
  API_ERROR_CATALOG,
  ApiErrorCode,
  DEFAULT_ERROR_CODE,
} from './error/api-error-catalog';

export class CustomException extends HttpException {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, status: HttpStatus, messageOverride?: string) {
    const catalogEntry = API_ERROR_CATALOG[code] ?? API_ERROR_CATALOG[DEFAULT_ERROR_CODE];
    const payloadCode = catalogEntry.code;
    const payloadMessage = messageOverride ?? catalogEntry.message;

    super({ code: payloadCode, message: payloadMessage }, status);

    this.code = payloadCode;
  }
}
