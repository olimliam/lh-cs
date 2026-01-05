import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { FreeTourActionType } from '@/infrastructure/repository/entity';

export class CreateFreeTourLogRequest {
  @ApiProperty({
    description: '이벤트 유형',
    enum: FreeTourActionType,
    example: FreeTourActionType.VISITOR_ENTER,
  })
  @IsEnum(FreeTourActionType)
  @IsNotEmpty()
  actionType: FreeTourActionType;

  @ApiProperty({
    description: '세부 값 (씬 ID 등, 씬 이동시에만 사용)',
    example: 'scene_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionValue?: string;

  @ApiProperty({
    description: '고객 임시 ID (세션 추적용)',
    example: 'temp_12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sessionId?: string;

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
    description: '접속 기기 정보 (PC, Android, iOS)',
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
