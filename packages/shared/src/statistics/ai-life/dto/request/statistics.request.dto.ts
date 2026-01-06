import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { StatisticsSortEnum } from '../../enum/statistics-sort.enum';

export class StatisticsRequestDto {
  @IsDate()
  @Type(() => Date)
  public start!: Date;

  @IsDate()
  @Type(() => Date)
  public end!: Date;

  @IsOptional()
  @IsEnum(StatisticsSortEnum)
  sortType?: StatisticsSortEnum;
}
