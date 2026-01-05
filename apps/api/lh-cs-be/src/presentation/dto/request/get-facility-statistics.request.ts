import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, ArrayMaxSize, IsString } from 'class-validator';

export class GetFacilityStatisticsRequest {
  @ApiPropertyOptional({ description: '시작 일시 (ISO8601)', example: '2024-12-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료 일시 (ISO8601)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '타임존 (IANA)', example: 'Asia/Seoul', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiPropertyOptional({
    description: '대상 설비 ID 목록',
    type: [String],
    example: ['10', '11'],
  })
  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item) => String(item))
      : value !== undefined
        ? [String(value)]
        : []
  )
  @IsArray()
  @ArrayMaxSize(50)
  facilityIds?: string[];
}
