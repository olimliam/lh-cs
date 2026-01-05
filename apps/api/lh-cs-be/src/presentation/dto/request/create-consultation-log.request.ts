import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export enum ConsultationLogActionTypeEnum {
  CONSULTATION_CREATE = 'CONSULTATION_CREATE',
  COUNSELOR_ENTER = 'COUNSELOR_ENTER',
  ADMIN_ENTER = 'ADMIN_ENTER',
  VISITOR_ENTER = 'VISITOR_ENTER',
  COUNSELOR_EXIT = 'COUNSELOR_EXIT',
  VISITOR_EXIT = 'VISITOR_EXIT',
  DRAWING_MODE_START = 'DRAWING_MODE_START',
  DRAWING_MODE_END = 'DRAWING_MODE_END',
  POP_OPEN = 'POP_OPEN',
  POP_CLOSE = 'POP_CLOSE',
  CONSULTATION_DESTROY = 'CONSULTATION_DESTROY',
}

export class CreateConsultationLogRequest {
  @ApiProperty({
    description: '이벤트 유형',
    enum: ConsultationLogActionTypeEnum,
    example: ConsultationLogActionTypeEnum.CONSULTATION_CREATE,
  })
  @IsEnum(ConsultationLogActionTypeEnum)
  @IsNotEmpty()
  actionType: ConsultationLogActionTypeEnum;

  @ApiProperty({
    description: '세부 값 (Admin ID, 씬ID, Marker ID 등)',
    example: 'admin_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionValue?: string;

  @ApiProperty({
    description: '상담실 번호',
    example: 'room_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  consultationId?: string;

  @ApiProperty({
    description: '사용자 ID (상담원, 고객 등)',
    example: '123',
    required: false,
  })
  @IsOptional()
  @IsString()
  counselorId?: string;

  @ApiProperty({
    description: '평형 타입 ID',
    example: 'type_A',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tourId?: string;

  @ApiProperty({
    description: '시설물 ID',
    example: 'eq_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  facilityId?: string;

  @ApiProperty({
    description: '접속 기기 정보',
    example: 'PC',
    required: false,
  })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({
    description: 'IP 주소 (저장 시 암호화 처리)',
    example: '192.168.1.100',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;
}
