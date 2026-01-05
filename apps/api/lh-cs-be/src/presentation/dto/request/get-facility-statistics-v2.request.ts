import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { StatsFilterDto } from './stats-filter.dto';

export class GetFacilityStatisticsV2Request extends StatsFilterDto {
  @ApiPropertyOptional({
    description: 'Top N 시설 개수',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => (value !== undefined ? Number(value) : 5))
  top?: number = 5;
}
