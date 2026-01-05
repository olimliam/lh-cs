import { ApiProperty } from '@nestjs/swagger';

/**
 * API 에러 응답 스키마
 */
export class ErrorResponse {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '에러 메시지',
    example: '잘못된 요청입니다.',
  })
  message: string;

  @ApiProperty({
    description: '에러 타입',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: '요청 경로',
    example: '/tours/123/facilities',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: '타임스탬프',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

/**
 * 유효성 검사 에러 응답 스키마
 */
export class ValidationErrorResponse {
  @ApiProperty({
    description: 'HTTP 상태 코드',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: '유효성 검사 실패 상세 정보',
    example: ['facilityId는 필수입니다.', 'sceneId는 숫자여야 합니다.'],
    type: [String],
  })
  message: string[];

  @ApiProperty({
    description: '에러 타입',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: '요청 경로',
    example: '/tours/123/facilities',
    required: false,
  })
  path?: string;

  @ApiProperty({
    description: '타임스탬프',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

/**
 * 비즈니스 로직 에러 응답 스키마
 */
export class ConflictErrorResponseDto extends ErrorResponse {
  @ApiProperty({
    description: '충돌 상세 정보',
    example: {
      tourId: '123',
      facilityId: '456',
      sceneId: '789',
      reason: '이미 해당 위치에 시설이 배치되어 있습니다.',
    },
    required: false,
  })
  details?: object;
}
