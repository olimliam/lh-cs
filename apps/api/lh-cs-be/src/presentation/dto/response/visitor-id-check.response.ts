import { ApiProperty } from '@nestjs/swagger';
import { ConsultationStatus } from '../../../infrastructure/repository/entity/consultation.entity';

export class VisitorIdCheckResponse {
  @ApiProperty({
    example: true,
    description: '검증 성공 여부',
  })
  success: boolean;

  @ApiProperty({
    example: 'visitor_1234567890_uuid-here',
    description: '방문자 ID (검증된 또는 새로 생성된)',
  })
  visitorId: string;

  @ApiProperty({
    example: true,
    description: '기존에 존재하는 visitor ID 여부',
  })
  isExisting: boolean;

  @ApiProperty({
    example: 'WAITING',
    enum: ConsultationStatus,
    description: '현재 상담 상태 (상담중인 경우)',
    required: false,
  })
  consultationStatus?: ConsultationStatus;

  @ApiProperty({
    example: 'consultation_123',
    description: '현재 진행중인 상담실 ID (상담중인 경우)',
    required: false,
  })
  activeConsultationId?: string;

  @ApiProperty({
    example: '방문자 ID가 유효합니다',
    description: '응답 메시지',
    required: false,
  })
  message?: string;
}