import { ApiProperty } from '@nestjs/swagger';
import {
  SceneImportDetail,
  SceneImportStatus,
  TourFacilitySceneImportResult,
} from '@/application/dto/response/tour-facility-scene-import.result';

export class TourFacilitySceneImportDetailResponse {
  @ApiProperty({ description: 'CSV 내 행 번호 (1-based)', example: 5 })
  rowIndex: number;

  @ApiProperty({ description: 'CSV 순번 값', example: '12', required: false })
  sequence?: string;

  @ApiProperty({ description: '시설명', example: '실외기실 루버창' })
  facilityTitle: string;

  @ApiProperty({ description: '투어 이름(참고용)', example: '부천도당' })
  tourName: string;

  @ApiProperty({ description: '투어 제곱미터', example: 31 })
  tourSquareMeters: number;

  @ApiProperty({ description: 'CSV에 포함된 URL', example: 'https://player...startID=589871', required: false })
  url?: string;

  @ApiProperty({ description: '적용된 Scene ID', example: '589871', required: false })
  sceneId?: string;

  @ApiProperty({
    description: '처리 상태',
    enum: SceneImportStatus,
    enumName: 'SceneImportStatus',
  })
  status: SceneImportStatus;

  @ApiProperty({ description: '결과 메시지', example: '씬 ID가 업데이트되었습니다.' })
  message: string;

  @ApiProperty({ description: '투어 ID', example: '101', required: false })
  tourId?: string;

  @ApiProperty({ description: '시설 ID', example: '55', required: false })
  facilityId?: string;

  @ApiProperty({ description: '투어 시설 ID', example: '2001', required: false })
  tourFacilityId?: string;

  @ApiProperty({ description: '기존 Scene ID', example: '123456', required: false })
  previousSceneId?: string;

  @ApiProperty({
    description: '추가 메타데이터(후속 확인용)',
    required: false,
    type: Object,
    additionalProperties: true,
  })
  metadata?: Record<string, unknown>;

  static from(detail: SceneImportDetail): TourFacilitySceneImportDetailResponse {
    const response = new TourFacilitySceneImportDetailResponse();
    response.rowIndex = detail.rowIndex;
    response.sequence = detail.sequence;
    response.facilityTitle = detail.facilityTitle;
    response.tourName = detail.tourName;
    response.tourSquareMeters = detail.tourSquareMeters;
    response.url = detail.url;
    response.sceneId = detail.sceneId;
    response.status = detail.status;
    response.message = detail.message;
    response.tourId = detail.tourId;
    response.facilityId = detail.facilityId;
    response.tourFacilityId = detail.tourFacilityId;
    response.previousSceneId = detail.previousSceneId;
    response.metadata = detail.metadata;
    return response;
  }
}

export class TourFacilitySceneImportResponse {
  @ApiProperty({ description: '총 처리 대상 행 수', example: 120 })
  totalRows: number;

  @ApiProperty({ description: '성공 건수', example: 100 })
  successCount: number;

  @ApiProperty({ description: '실패 건수', example: 10 })
  failureCount: number;

  @ApiProperty({ description: '보류(확인 필요) 건수', example: 10 })
  pendingCount: number;

  @ApiProperty({
    description: '성공 상세 목록',
    type: [TourFacilitySceneImportDetailResponse],
  })
  successes: TourFacilitySceneImportDetailResponse[];

  @ApiProperty({
    description: '실패 상세 목록',
    type: [TourFacilitySceneImportDetailResponse],
  })
  failures: TourFacilitySceneImportDetailResponse[];

  @ApiProperty({
    description: '보류 상세 목록',
    type: [TourFacilitySceneImportDetailResponse],
  })
  pending: TourFacilitySceneImportDetailResponse[];

  static fromResult(
    result: TourFacilitySceneImportResult
  ): TourFacilitySceneImportResponse {
    const response = new TourFacilitySceneImportResponse();
    response.totalRows = result.totalRows;
    response.successCount = result.successCount;
    response.failureCount = result.failureCount;
    response.pendingCount = result.pendingCount;
    response.successes = result.successes.map((detail) =>
      TourFacilitySceneImportDetailResponse.from(detail)
    );
    response.failures = result.failures.map((detail) =>
      TourFacilitySceneImportDetailResponse.from(detail)
    );
    response.pending = result.pending.map((detail) =>
      TourFacilitySceneImportDetailResponse.from(detail)
    );
    return response;
  }
}
