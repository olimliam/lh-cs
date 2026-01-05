import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationReqDto } from '@/common/dto/pagination.dto';

export enum ConsultationLogSortField {
  CREATED_AT = 'CREATED_AT',
  CONSULTATION_ID = 'CONSULTATION_ID',
  COUNSELOR_ID = 'COUNSELOR_ID',
  ACTION_TYPE = 'ACTION_TYPE',
}

export class GetConsultationLogsRequest extends PaginationReqDto {
  @ApiPropertyOptional({ description: '상담실 ID', example: 'room-001' })
  @IsOptional()
  @IsString()
  consultationId?: string;

  @ApiPropertyOptional({ description: '상담사 ID', example: '123' })
  @IsOptional()
  @IsString()
  counselorId?: string;

  @ApiPropertyOptional({ description: '투어 ID', example: 'tour-001' })
  @IsOptional()
  @IsString()
  tourId?: string;

  @ApiPropertyOptional({ description: '시설 ID', example: 'facility-001' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: '액션 타입', example: 'counselor_enter' })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiPropertyOptional({
    description: '정렬 필드',
    enum: ConsultationLogSortField,
  })
  @IsOptional()
  @IsEnum(ConsultationLogSortField)
  orderBy?: ConsultationLogSortField = ConsultationLogSortField.CREATED_AT;

  @ApiPropertyOptional({ description: '정렬 방향', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: '시작 날짜 (ISO8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료 날짜 (ISO8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
