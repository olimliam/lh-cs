import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty({ description: '총 상담 세션 수', example: 120 })
  totalConsultations: number;

  @ApiProperty({ description: '총 상담 시간(초)', example: 45210 })
  totalSeconds: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 378 })
  avgSeconds: number;
}

export class DashboardTrendItemDto {
  @ApiProperty({ description: '통계 일자 (YYYY-MM-DD)', example: '2025-12-01' })
  statDate: string;

  @ApiProperty({ description: '상담 세션 수', example: 12 })
  consultationsCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 3600 })
  totalSeconds: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 300 })
  avgSeconds: number;
}

export class TourAggregateStatDto {
  @ApiProperty({ description: '투어 ID', example: '1' })
  tourId: string;

  @ApiProperty({ description: '투어 이름', example: '84㎡ A형' })
  tourTitle: string;

  @ApiProperty({ description: '상담 세션 수', example: 20 })
  consultationsCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 6000 })
  totalSeconds: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 300 })
  avgSeconds: number;
}

export class FacilityAggregateStatDto {
  @ApiProperty({ description: '투어 시설 ID', example: '101' })
  tourFacilityId: string;

  @ApiProperty({ description: '투어 ID', example: '1' })
  tourId: string;

  @ApiProperty({ description: '시설 ID', example: '10' })
  facilityId: string;

  @ApiProperty({ description: '평형명', example: '84㎡ A형' })
  tourTitle: string;

  @ApiProperty({ description: '시설명', example: '거실' })
  facilityTitle: string;

  @ApiProperty({ description: '상담 세션 수', example: 15 })
  consultationsCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 4200 })
  totalSeconds: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 280 })
  avgSeconds: number;
}

export class DashboardStatisticsResponse {
  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto;

  @ApiProperty({ type: [DashboardTrendItemDto] })
  trend: DashboardTrendItemDto[];

  @ApiProperty({ type: [TourAggregateStatDto] })
  topTours: TourAggregateStatDto[];

  @ApiProperty({ type: [FacilityAggregateStatDto] })
  topFacilities: FacilityAggregateStatDto[];
}

export class DashboardSummaryResponse {
  @ApiProperty({ type: DashboardSummaryDto })
  summary: DashboardSummaryDto;
}

export class DashboardTrendResponse {
  @ApiProperty({ type: [DashboardTrendItemDto] })
  trend: DashboardTrendItemDto[];
}

export class DashboardTopToursResponse {
  @ApiProperty({ type: [TourAggregateStatDto] })
  topTours: TourAggregateStatDto[];
}

export class DashboardTopFacilitiesResponse {
  @ApiProperty({ type: [FacilityAggregateStatDto] })
  topFacilities: FacilityAggregateStatDto[];
}
