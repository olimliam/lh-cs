import { ApiProperty } from '@nestjs/swagger';

export class PackageStatisticsResponseDto {
  @ApiProperty({ name: '패키지 총 방문수' })
  pageCount!: number;

  @ApiProperty({ name: '패키지별 통계 리스트' })
  packageStatisticsList!: PackageStatisticsDto[];
}

export class PackageStatisticsDto {
  @ApiProperty({ name: '패키지 이름' })
  name!: string;

  @ApiProperty({
    name: '클릭 횟수',
    description: '패키지 클릭, 패키지 내부 영상 클릭 수의 총합',
  })
  count!: number; // 클릭 횟수

  @ApiProperty({ name: '패키지 소개 영상별 통계 리스트' })
  videoStatisticsList!: PackageVideoStatisticsDto[];
}

export class PackageVideoStatisticsDto {
  @ApiProperty({ name: '영상 제목' })
  name!: string;

  @ApiProperty({ name: '클릭 횟수' })
  count!: number;
}
