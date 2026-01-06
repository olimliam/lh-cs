// import { ProductStatistics } from '../../../../domain/product/model/product-statistics';

export class ProductStatisticsResponseDto {
  pageCount!: number; // 제품 페이지 방문 수
  productStatisticsList!: ProductStatisticsDto[];

  // constructor(pageCount: number, productStatisticsList: ProductStatistics[]) {}
}

export class ProductStatisticsDto {
  name!: string;
  count!: number; // 제품 + 제품카드 + 동영상 count의 총합
  videoStatisticsList!: ProductVideoStatisticsDto[];

  // constructor(name: string, count: number, Statistics) {}
}

export class ProductVideoStatisticsDto {
  name!: string;
  count!: number;
}
