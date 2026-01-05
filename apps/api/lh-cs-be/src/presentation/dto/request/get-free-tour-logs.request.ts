import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationReqDto } from '@/common/dto/pagination.dto';
import { FreeTourLogEntity } from '@/infrastructure/repository/entity/free-tour-log.entity';

type FreeTourActionType = FreeTourLogEntity['actionType'];

export enum FreeTourLogSortField {
  CREATED_AT = 'CREATED_AT',
  SESSION_ID = 'SESSION_ID',
  ACTION_TYPE = 'ACTION_TYPE',
}

export class GetFreeTourLogsRequest extends PaginationReqDto {
  @ApiPropertyOptional({ description: '세션 ID', example: 'session-123' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: '투어 ID', example: 'tour-001' })
  @IsOptional()
  @IsString()
  tourId?: string;

  @ApiPropertyOptional({ description: '시설물 ID', example: 'facility-01' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: '액션 타입' })
  @IsOptional()
  @IsString()
  actionType?: FreeTourActionType;

  @ApiPropertyOptional({ description: '정렬 필드', enum: FreeTourLogSortField })
  @IsOptional()
  @IsEnum(FreeTourLogSortField)
  orderBy?: FreeTourLogSortField = FreeTourLogSortField.CREATED_AT;

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
