import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { CreateConsultationCommand } from '@/application/dto/command';

/**
 * 상담실 생성 API 요청 DTO
 * - 컨트롤러에서 HTTP 요청을 받을 때 사용
 * - Swagger 문서화 포함
 * - 클라이언트 관점의 validation
 */
export class CreateConsultationRequest {
  @ApiProperty({
    description: '투어 ID',
    example: 1,
  })
  @IsNotEmpty({ message: '투어 ID는 필수입니다.' })
  @Transform(({ value }) => value)
  tourId: string;

  @ApiProperty({
    description: '시작 투어 시설 ID',
    example: 1,
  })
  @IsNotEmpty({ message: '시작 설비 ID는 필수입니다.' })
  @Transform(({ value }) => value)
  startTourFacilityId: string;

  @ApiProperty({
    description: '상담실 이름',
    example: '84㎡ VIP 상담실',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '상담실 이름은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '상담실 이름은 100자 이하여야 합니다.' })
  roomName?: string;

  @ApiProperty({
    description: '수용 인원',
    example: 2,
    required: false,
    minimum: 1,
    maximum: 10,
    default: 2,
  })
  @IsOptional()
  @IsNumber({}, { message: '수용 인원은 숫자여야 합니다.' })
  @Min(1, { message: '수용 인원은 최소 1명입니다.' })
  @Max(10, { message: '수용 인원은 최대 10명입니다.' })
  capacity?: number = 2;

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

  toCommand(userId: string): CreateConsultationCommand {
    if (!this.startTourFacilityId) {
      throw new BadRequestException('시작 설비 ID는 필수입니다.');
    }

    return {
      tourId: `${this.tourId}`,
      userId: `${userId}`,
      startTourFacilityId: `${this.startTourFacilityId}`,
      roomName: this.roomName,
      capacity: this.capacity,
      consultationCode: this.consultationCode,
    };
  }
}
