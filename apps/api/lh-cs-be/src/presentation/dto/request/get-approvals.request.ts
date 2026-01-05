import { PaginationReqDto } from '@/common/dto/pagination.dto';
import { AdminApprovalState } from '@/application/dto/user/user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetApprovalsRequest extends PaginationReqDto {
  @ApiProperty({
    description: '조회할 가입 상태',
    enum: AdminApprovalState,
    example: AdminApprovalState.PENDING,
  })
  @IsEnum(AdminApprovalState)
  state: AdminApprovalState;

  @ApiPropertyOptional({
    description: '아이디 검색 (부분 일치) - REJECTED/PENDING에서 사용',
    example: 'hong',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: '이름 검색 (부분 일치) - REJECTED/PENDING에서 사용',
    example: '홍길동',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: '부서 검색 (부분 일치) - REJECTED/PENDING에서 사용',
    example: '영업',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsOptional()
  @IsString()
  department?: string;
}
