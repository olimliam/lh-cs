import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationReqDto } from '@/common/dto/pagination.dto';
import { LoginActionType } from '@/infrastructure/repository/entity/login-log.entity';

export enum LoginLogSortField {
  CREATED_AT = 'createdAt',
  ACTION_TYPE = 'actionType',
  COUNSELOR_ID = 'counselorId',
}

export class GetLoginLogsRequest extends PaginationReqDto {
  @ApiPropertyOptional({
    description: '로그인 액션 타입',
    enum: LoginActionType,
  })
  @IsOptional()
  @IsEnum(LoginActionType)
  actionType?: LoginActionType;

  @ApiPropertyOptional({ description: '상담사 ID', example: '123' })
  @IsOptional()
  @IsString()
  counselorId?: string;

  @ApiPropertyOptional({
    description: 'IP 주소(입력값을 암호화해 조회)',
    example: '192.168.0.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: '정렬 필드', enum: LoginLogSortField })
  @IsOptional()
  @IsIn(Object.values(LoginLogSortField))
  orderBy?: LoginLogSortField = LoginLogSortField.CREATED_AT;

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
