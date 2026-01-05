import { ApiProperty } from '@nestjs/swagger';

export class ConsultationSessionItemResponse {
  @ApiProperty({ description: '상담 ID', example: '10001' })
  consultationId: string;

  @ApiProperty({ description: '투어 ID', example: '1', required: false })
  tourId?: string | null;

  @ApiProperty({ description: '투어 이름', example: '84㎡ A형', required: false })
  tourTitle?: string | null;

  @ApiProperty({
    description: '투어 시설 ID (tour_facility_id)',
    example: '101',
    required: false,
  })
  tourFacilityId?: string | null;

  @ApiProperty({ description: '시설 ID', example: '10', required: false })
  facilityId?: string | null;

  @ApiProperty({
    description: '시설 이름',
    example: '거실',
    required: false,
  })
  facilityTitle?: string | null;

  @ApiProperty({
    description: '상담원 ID',
    example: '9001',
    required: false,
  })
  consultantId?: string | null;

  @ApiProperty({
    description: '상담 시작 시각 (UTC)',
    example: '2025-03-02T01:02:03.000Z',
  })
  startedAt: Date;

  @ApiProperty({
    description: '상담 종료 시각 (UTC)',
    example: '2025-03-02T01:32:03.000Z',
  })
  endedAt: Date;

  @ApiProperty({ description: '상담 소요 시간(초)', example: 1800 })
  durationSeconds: number;

  @ApiProperty({ description: '통계 기준 일자', example: '2025-03-02' })
  statDate: string;
}

export class PaginatedConsultationSessionsResponse {
  @ApiProperty({ type: [ConsultationSessionItemResponse] })
  data: ConsultationSessionItemResponse[];

  @ApiProperty({ description: '전체 건수', example: 120 })
  total: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지 크기', example: 20 })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수', example: 6 })
  totalPages: number;
}
