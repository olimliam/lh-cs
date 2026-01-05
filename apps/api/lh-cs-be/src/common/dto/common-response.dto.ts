import { ApiProperty } from '@nestjs/swagger';
import {
  API_ERROR_CATALOG,
  ApiErrorCode,
  DEFAULT_SUCCESS_CODE,
  DEFAULT_ERROR_CODE,
} from '../exception/error/api-error-catalog';

export class CommonResponse<T> {
  @ApiProperty({
    example: true,
    description: 'API 성공 여부',
  })
  success: boolean;

  @ApiProperty({
    example: 'OK',
    description: '도메인 통합 에러 코드',
    enum: Object.keys(API_ERROR_CATALOG),
  })
  code: ApiErrorCode;

  @ApiProperty({
    example: '성공',
    description: 'code에 대한 설명',
  })
  message: string;

  @ApiProperty({
    description: '성공 시 API 응답 데이터',
  })
  data?: T;

  constructor(success: boolean, code: ApiErrorCode, message: string, data?: T) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(
    data: T,
    code: ApiErrorCode = DEFAULT_SUCCESS_CODE,
    message?: string
  ): CommonResponse<T> {
    const catalogEntry = API_ERROR_CATALOG[code] ?? API_ERROR_CATALOG[DEFAULT_SUCCESS_CODE];
    const resolvedMessage = message ?? catalogEntry.message;

    return new CommonResponse<T>(true, catalogEntry.code, resolvedMessage, data);
  }

  static error(
    code: ApiErrorCode,
    message?: string
  ): CommonResponse<null> {
    const catalogEntry = API_ERROR_CATALOG[code] ?? API_ERROR_CATALOG[DEFAULT_ERROR_CODE];
    const resolvedMessage = message ?? catalogEntry.message;

    return new CommonResponse<null>(false, catalogEntry.code, resolvedMessage, null);
  }
}
