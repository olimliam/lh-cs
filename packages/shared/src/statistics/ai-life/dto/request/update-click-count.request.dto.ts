import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { StatisticsEnum } from '../../enum/statistics.enum';

export class updateClickCountRequestDto {
  @IsEnum(StatisticsEnum)
  pageType!: StatisticsEnum;
  @IsDate()
  @IsOptional()
  date?: Date;
}
