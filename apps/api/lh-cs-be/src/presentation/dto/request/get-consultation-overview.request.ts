import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetConsultationOverviewRequest {
  @ApiPropertyOptional({ description: '시작 일시 (ISO8601)', example: '2024-12-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료 일시 (ISO8601)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: '통계 계산용 타임존 (IANA)',
    example: 'Asia/Seoul',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiPropertyOptional({ description: '일별 추이 구간(일)', example: 7, default: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  trendDays?: number = 7;

  @ApiPropertyOptional({ description: 'Top 평형/시설 집계 기간(일)', example: 7, default: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  topDays?: number = 7;

  @ApiPropertyOptional({ description: 'Top 목록 수', example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  topLimit?: number = 5;
}
