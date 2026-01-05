import { ApiProperty } from '@nestjs/swagger';
import {
  DashboardSummaryDto,
  TourAggregateStatDto,
  FacilityAggregateStatDto,
} from './dashboard-statistics.response';

export class TourDailyStatDto {
  @ApiProperty({ description: '투어 ID', example: '1' })
  tourId: string;

  @ApiProperty({ description: '투어 이름', example: '84㎡ A형' })
  tourTitle: string;

  @ApiProperty({ description: '통계 일자 (YYYY-MM-DD)', example: '2025-03-02' })
  statDate: string;

  @ApiProperty({ description: '상담 세션 수', example: 5 })
  consultationsCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 1800 })
  totalSeconds: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 360 })
  avgSeconds: number;
}

export class FacilityDailyStatDto {
  @ApiProperty({ description: '투어 시설 ID', example: '101' })
  tourFacilityId: string;

  @ApiProperty({ description: '투어 ID', example: '1' })
  tourId: string;

  @ApiProperty({ description: '시설 ID', example: '10' })
  facilityId: string;

  @ApiProperty({ description: '시설 이름', example: '거실' })
  facilityTitle: string;

  @ApiProperty({ description: '통계 일자 (YYYY-MM-DD)', example: '2025-03-02' })
  statDate: string;

  @ApiProperty({ description: '상담 세션 수', example: 3 })
  consultationsCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 1200 })
  totalSeconds: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 400 })
  avgSeconds: number;
}

export class TourStatisticsV2Response {
  @ApiProperty({ type: [TourAggregateStatDto] })
  totals: TourAggregateStatDto[];

  @ApiProperty({ type: [TourDailyStatDto] })
  trend: TourDailyStatDto[];

  @ApiProperty({ type: DashboardSummaryDto })
  overall: DashboardSummaryDto;
}

export class FacilityStatisticsV2Response {
  @ApiProperty({ type: [FacilityAggregateStatDto] })
  totals: FacilityAggregateStatDto[];

  @ApiProperty({ type: [FacilityDailyStatDto] })
  trend: FacilityDailyStatDto[];

  @ApiProperty({ type: DashboardSummaryDto })
  overall: DashboardSummaryDto;
}
