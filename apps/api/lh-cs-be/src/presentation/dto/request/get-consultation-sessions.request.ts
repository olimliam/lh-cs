import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { StatsFilterDto } from './stats-filter.dto';

export class GetConsultationSessionsRequest extends StatsFilterDto {
  @ApiPropertyOptional({ description: '페이지 번호', example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지 크기',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => (value !== undefined ? Number(value) : 20))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'durationSeconds 정렬 방향',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
