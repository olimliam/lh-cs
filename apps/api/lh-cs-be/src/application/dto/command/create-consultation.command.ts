import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateConsultationCommand {
  @ApiProperty({
    description: '투어 ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  tourId: string;

  @ApiProperty({
    description: '상담원 ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: '시작 투어 시설 ID (tour_facilities 테이블 참조)',
    example: 1,
  })
  @IsNotEmpty()
  @IsString()
  startTourFacilityId: string;

  @ApiProperty({
    description: '상담실 이름',
    example: '84㎡ VIP 상담실',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  roomName?: string;

  @ApiProperty({
    description: '수용 인원',
    example: 2,
    required: false,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({
    description: '상담 코드 (고유 값)',
    example: 'LHC-20240201-01',
    maxLength: 30,
  })
  @IsNotEmpty({ message: '상담 코드는 필수입니다.' })
  @IsString({ message: '상담 코드는 문자열이어야 합니다.' })
  @MaxLength(30, { message: '상담 코드는 30자 이하여야 합니다.' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  consultationCode: string;

  // 🔥 자동 생성 필드들 (서비스에서 추가됨)
  roomNumber?: string; // 6자리 상담실 번호
  enterCode?: string; // 4자리 입장 코드
}
