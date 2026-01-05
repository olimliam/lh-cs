import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationResDto<T> {
  @ApiProperty({
    description: '전체 아이템 수',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: '현재 페이지 번호',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '한 페이지당 아이템 수',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: '결과 데이터 배열',
    type: [Object],
  })
  data: T[];

  constructor(data: Partial<PaginationResDto<T>>) {
    Object.assign(this, data);
  }
}

export class PaginationReqDto {
  @ApiProperty({
    description: '요청할 페이지 번호 (기본값: 1)',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: '한 페이지당 요청할 아이템 수 (기본값: 10)',
    example: 10,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    description: '정렬 기준 필드',
    required: false,
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({
    description: '정렬 방향 (ASC 또는 DESC) (기본값: DESC)',
    example: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC' = 'DESC';

  constructor(data: Partial<PaginationReqDto>) {
    Object.assign(this, data);
  }
}
