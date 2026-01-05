import { ApiProperty } from '@nestjs/swagger';
import {
  ConsultationErrorCode,
  ConsultationErrorData,
} from '../exception/error/consultation-error-code.enum';
import {
  API_ERROR_CATALOG,
  DEFAULT_SUCCESS_CODE,
  DEFAULT_ERROR_CODE,
} from '../exception/error/api-error-catalog';

/**
 * 상담실 관련 공통 응답 DTO
 * shared CommonResponse를 확장하여 상담실 전용 에러코드 지원
 */
export class ConsultationCommonResponse<T> {
  @ApiProperty({
    example: true,
    description: 'API 성공 여부',
  })
  success: boolean;

  @ApiProperty({
    example: 'CONSULTATION_CREATED',
    description: '상담실 관련 응답 코드',
    enum: ConsultationErrorCode,
  })
  code: ConsultationErrorCode;

  @ApiProperty({
    example: '상담실이 성공적으로 생성되었습니다.',
    description: '응답 메시지',
  })
  message: string;

  @ApiProperty({
    description: '성공 시 응답 데이터',
  })
  data?: T;

  constructor(
    success: boolean,
    code: ConsultationErrorCode,
    message: string,
    data?: T
  ) {
    this.success = success;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  /**
   * 성공 응답 생성
   */
  static success<T>(
    data: T,
    code: ConsultationErrorCode = ConsultationErrorCode.OK,
    message?: string
  ): ConsultationCommonResponse<T> {
    const catalogEntry =
      API_ERROR_CATALOG[code] ?? API_ERROR_CATALOG[DEFAULT_SUCCESS_CODE];
    const finalMessage =
      message || ConsultationErrorData[code]?.message || catalogEntry.message;
    const resolvedCode = (catalogEntry.code as ConsultationErrorCode) ?? code;

    return new ConsultationCommonResponse<T>(true, resolvedCode, finalMessage, data);
  }

  /**
   * 에러 응답 생성
   */
  static error(
    code: ConsultationErrorCode,
    message?: string
  ): ConsultationCommonResponse<null> {
    const catalogEntry =
      API_ERROR_CATALOG[code] ?? API_ERROR_CATALOG[DEFAULT_ERROR_CODE];
    const finalMessage =
      message || ConsultationErrorData[code]?.message || catalogEntry.message;
    const resolvedCode = (catalogEntry.code as ConsultationErrorCode) ?? code;

    return new ConsultationCommonResponse<null>(
      false,
      resolvedCode,
      finalMessage,
      null
    );
  }

  /**
   * 상담실 생성 성공 응답
   */
  static consultationCreated<T>(data: T): ConsultationCommonResponse<T> {
    return this.success(data, ConsultationErrorCode.CONSULTATION_CREATED);
  }

  /**
   * 상담 시작 성공 응답
   */
  static consultationStarted<T>(data: T): ConsultationCommonResponse<T> {
    return this.success(data, ConsultationErrorCode.CONSULTATION_STARTED);
  }

  /**
   * 상담 종료 성공 응답
   */
  static consultationEnded<T>(data: T): ConsultationCommonResponse<T> {
    return this.success(data, ConsultationErrorCode.CONSULTATION_ENDED);
  }

  /**
   * 상담실 삭제 성공 응답
   */
  static consultationDeleted(): ConsultationCommonResponse<null> {
    return this.success(null, ConsultationErrorCode.CONSULTATION_DELETED);
  }

  /**
   * 상담실을 찾을 수 없음 에러
   */
  static consultationNotFound(): ConsultationCommonResponse<null> {
    return this.error(ConsultationErrorCode.CONSULTATION_NOT_FOUND);
  }

  /**
   * 잘못된 상담실 상태 에러
   */
  static invalidConsultationStatus(): ConsultationCommonResponse<null> {
    return this.error(ConsultationErrorCode.CONSULTATION_INVALID_STATUS);
  }

  /**
   * 유효하지 않은 입장 코드 에러
   */
  static invalidAccessCode(): ConsultationCommonResponse<null> {
    return this.error(ConsultationErrorCode.CONSULTATION_INVALID_CODE);
  }
}
