import { ApiProperty } from '@nestjs/swagger';

export class ConsultationSummaryResponse {
  @ApiProperty({ description: '전체 상담 건수', example: 120 })
  totalCount: number;

  @ApiProperty({ description: '일 평균 상담 건수', example: 6.3 })
  averageDailyCount: number;

  @ApiProperty({ description: '전체 상담 시간(초)', example: 45210 })
  totalDurationSec: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 378 })
  averageDurationSec: number;
}

export class ConsultationTrendItemResponse {
  @ApiProperty({ description: '통계 일자 (타임존 반영 ISO8601)', example: '2024-12-01' })
  statDate: string;

  @ApiProperty({ description: '상담 건수', example: 12 })
  consultationCount: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 420 })
  averageDurationSec: number;
}

export class TopConsultationItemResponse {
  @ApiProperty({ description: '식별자', example: '1' })
  id: string;

  @ApiProperty({ description: '명칭', example: '84㎡ A형' })
  title: string;

  @ApiProperty({ description: '상담 건수', example: 24 })
  consultationCount: number;

  @ApiProperty({ description: '전체 상담 시간(초)', example: 9200 })
  totalDurationSec: number;
}

export class ConsultationOverviewResponse {
  @ApiProperty({ type: () => ConsultationSummaryResponse })
  summary: ConsultationSummaryResponse;

  @ApiProperty({ type: () => [ConsultationTrendItemResponse] })
  trend: ConsultationTrendItemResponse[];

  @ApiProperty({ type: () => [TopConsultationItemResponse] })
  topTours: TopConsultationItemResponse[];

  @ApiProperty({ type: () => [TopConsultationItemResponse] })
  topFacilities: TopConsultationItemResponse[];
}

export class TourTrendItemResponse {
  @ApiProperty({ description: '투어 ID', example: '1' })
  tourId: string;

  @ApiProperty({ description: '투어 명칭', example: '84㎡ A형' })
  tourTitle: string;

  @ApiProperty({ description: '통계 일자', example: '2024-12-01' })
  statDate: string;

  @ApiProperty({ description: '상담 건수', example: 5 })
  consultationCount: number;
}

export class TourAggregateItemResponse {
  @ApiProperty({ description: '투어 ID', example: '1' })
  tourId: string;

  @ApiProperty({ description: '투어 명칭', example: '84㎡ A형' })
  tourTitle: string;

  @ApiProperty({ description: '상담 건수', example: 32 })
  consultationCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 12800 })
  totalDurationSec: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 400 })
  averageDurationSec: number;
}

export class TourStatisticsTotalResponse {
  @ApiProperty({ description: '총 상담 건수', example: 80 })
  consultationCount: number;

  @ApiProperty({ description: '총 상담 시간(초)', example: 30120 })
  totalDurationSec: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 376 })
  averageDurationSec: number;
}

export class TourStatisticsResponse {
  @ApiProperty({ type: () => [TourTrendItemResponse] })
  trend: TourTrendItemResponse[];

  @ApiProperty({ type: () => [TourAggregateItemResponse] })
  items: TourAggregateItemResponse[];

  @ApiProperty({ type: () => TourStatisticsTotalResponse })
  total: TourStatisticsTotalResponse;
}

export class FacilityAggregateItemResponse {
  @ApiProperty({ description: '시설 ID', example: '10' })
  facilityId: string;

  @ApiProperty({ description: '시설 명칭', example: '거실' })
  facilityTitle: string;

  @ApiProperty({ description: '상담 건수', example: 22 })
  consultationCount: number;

  @ApiProperty({ description: '상담 시간 합계(초)', example: 8800 })
  totalDurationSec: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 400 })
  averageDurationSec: number;
}

export class FacilityStatisticsTotalResponse {
  @ApiProperty({ description: '총 상담 건수', example: 54 })
  consultationCount: number;

  @ApiProperty({ description: '총 상담 시간(초)', example: 20100 })
  totalDurationSec: number;

  @ApiProperty({ description: '평균 상담 시간(초)', example: 372 })
  averageDurationSec: number;
}

export class FacilityStatisticsResponse {
  @ApiProperty({ type: () => [FacilityAggregateItemResponse] })
  items: FacilityAggregateItemResponse[];

  @ApiProperty({ type: () => FacilityStatisticsTotalResponse })
  total: FacilityStatisticsTotalResponse;
}
