import { ApiProperty } from '@nestjs/swagger';
import { ConsultationEntity } from '../../../infrastructure/repository/entity/consultation.entity';

export class ConsultationVisitorInfoResponse {
  @ApiProperty({
    example: 'visitor_1234567890_uuid-here',
    nullable: true,
    description: '상담실에 할당된 방문자 ID (없으면 null)',
  })
  visitorId: string | null;

  @ApiProperty({
    example: 84,
    nullable: true,
    description: '투어 평형 정보 (제곱미터 단위)',
  })
  squareMeters: number | null;

  @ApiProperty({
    example: '커뮤니티 라운지',
    nullable: true,
    description: '시작 시설 이름 (startTourFacilityId 기준)',
  })
  facilityName: string | null;

  static fromEntity(
    entity: ConsultationEntity
  ): ConsultationVisitorInfoResponse {
    const response = new ConsultationVisitorInfoResponse();
    response.visitorId = entity.visitorId ?? null;
    response.squareMeters = entity.tour?.squareMeters ?? null;
    response.facilityName = entity.startTourFacility?.facility?.title ?? null;
    return response;
  }
}
