import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, Matches } from 'class-validator';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toNumberArray(value: unknown): number[] {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v));
  }
  return [];
}

export class StatsFilterDto {
  @ApiProperty({
    description: '집계 시작일 (UTC, YYYY-MM-DD, 어제 이하)',
    example: '2025-12-01',
  })
  @IsNotEmpty()
  @Matches(DATE_REGEX, { message: 'startDate는 YYYY-MM-DD 형식이어야 합니다.' })
  startDate: string;

  @ApiProperty({
    description: '집계 종료일 (UTC, YYYY-MM-DD, 어제 이하)',
    example: '2025-12-10',
  })
  @IsNotEmpty()
  @Matches(DATE_REGEX, { message: 'endDate는 YYYY-MM-DD 형식이어야 합니다.' })
  endDate: string;

  @ApiPropertyOptional({
    description: '필터링할 투어 ID 목록',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toNumberArray(value))
  tourIds?: number[];

  @ApiPropertyOptional({
    description: '필터링할 시설 ID 목록(투어시설 ID 또는 facility_id)',
    type: [Number],
    example: [10, 11],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toNumberArray(value))
  facilityIds?: number[];

  @ApiPropertyOptional({
    description: '필터링할 상담원 ID 목록',
    type: [Number],
    example: [1001],
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toNumberArray(value))
  consultantIds?: number[];
}
