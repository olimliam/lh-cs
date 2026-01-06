import { ApiProperty } from '@nestjs/swagger';
import { StatisticsEnum } from '../../enum/statistics.enum';

export class CreateClickLogRequestDto {
  @ApiProperty({ example: 'product', description: '통계 페이지 타입' })
  pageType!: StatisticsEnum.PRODUCT | StatisticsEnum.PACKAGE;
  @ApiProperty({ example: 'product', description: '통계 컨텐츠 type ID' })
  type!: StatisticsEnum;
  @ApiProperty({ example: 1, description: '제품 또는 패키지 ID' })
  id?: number;
  @ApiProperty({ example: 1, description: '제품 또는 패키지 하위 컨텐츠 ID' })
  mediaId?: number;

  constructor(props: CreateClickLogRequestDto) {
    Object.assign(this, props);
  }
}
