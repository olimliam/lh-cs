import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import {
  UserRoleEnum,
  UserStatusEnum,
  UserApprovalStatusEnum,
} from '@/infrastructure/repository/entity';

const FILTERABLE_ROLES: UserRoleEnum[] = [
  UserRoleEnum.ADMIN,
  UserRoleEnum.CONSULTANT,
];

export class GetUsersRequest {
  @ApiPropertyOptional({
    description: '페이지 번호',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '사용자 상태 필터 (다중 선택 가능)',
    enum: UserStatusEnum,
    isArray: true,
    example: [UserStatusEnum.ACTIVE, UserStatusEnum.INACTIVE],
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    }
    if (typeof value === 'string') {
      return [value.trim()].filter((item) => item.length > 0);
    }
    return undefined;
  })
  @IsEnum(UserStatusEnum, { each: true })
  @IsOptional()
  statuses?: UserStatusEnum[];

  @ApiPropertyOptional({
    description: '사용자 권한 필터 (다중 선택, 미지정 시 SUPER_ADMIN 제외 전체 조회)',
    enum: FILTERABLE_ROLES,
    isArray: true,
    example: [UserRoleEnum.ADMIN, UserRoleEnum.CONSULTANT],
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const items = Array.isArray(value) ? value : [value];
    const normalized = items
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0)
      .filter((item) => FILTERABLE_ROLES.includes(item as UserRoleEnum));
    return normalized.length ? normalized : undefined;
  })
  @IsIn(FILTERABLE_ROLES, { each: true })
  @IsOptional()
  roles?: UserRoleEnum[];

  @ApiPropertyOptional({
    description: '전화번호 (숫자 10~11자리, 정확 일치 검색)',
    example: '01012345678',
  })
  @IsString()
  @Matches(/^\d{10,11}$/)
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: '가입 승인 상태 필터 (다중 선택 가능)',
    enum: UserApprovalStatusEnum,
    isArray: true,
    example: [UserApprovalStatusEnum.PENDING, UserApprovalStatusEnum.APPROVED],
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0);
    }
    if (typeof value === 'string') {
      return [value.trim()].filter((item) => item.length > 0);
    }
    return undefined;
  })
  @IsEnum(UserApprovalStatusEnum, { each: true })
  @IsOptional()
  approvalStatuses?: UserApprovalStatusEnum[];

  @ApiPropertyOptional({
    description: '아이디 검색 (부분 일치)',
    example: 'hong',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: '이름 검색 (부분 일치)',
    example: '홍길동',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: '부서 검색 (부분 일치)',
    example: '영업',
  })
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({
    description: '정렬 기준',
    enum: ['createdAt', 'lastLoginAt', 'name'],
    example: 'createdAt',
  })
  @IsIn(['createdAt', 'lastLoginAt', 'name'])
  @IsOptional()
  sortBy?: 'createdAt' | 'lastLoginAt' | 'name' = 'createdAt';

  @ApiPropertyOptional({
    description: '정렬 순서',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
