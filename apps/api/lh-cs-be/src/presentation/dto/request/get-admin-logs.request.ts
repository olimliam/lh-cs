import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationReqDto } from '@/common/dto/pagination.dto';
import { AdminActionType } from '@/infrastructure/repository/entity/admin-log.entity';

export enum AdminLogSortField {
  CREATED_AT = 'createdAt',
  ACTION_TYPE = 'actionType',
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAdminLogsRequest extends PaginationReqDto {
  @ApiPropertyOptional({ description: '액션 타입', enum: AdminActionType })
  @IsOptional()
  @IsEnum(AdminActionType, {
    message: `actionType must be one of: ${Object.values(AdminActionType).join(', ')}`,
  })
  actionType?: AdminActionType;

  @ApiPropertyOptional({ description: '상담사 ID', example: '123' })
  @IsOptional()
  @IsString()
  counselorId?: string;

  @ApiPropertyOptional({
    description: '정렬 필드',
    enum: AdminLogSortField,
    default: AdminLogSortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(AdminLogSortField)
  orderBy?: AdminLogSortField = AdminLogSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: '정렬 방향',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  orderDirection?: SortDirection = SortDirection.DESC;

  @ApiPropertyOptional({ description: '시작 날짜 (ISO8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료 날짜 (ISO8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
