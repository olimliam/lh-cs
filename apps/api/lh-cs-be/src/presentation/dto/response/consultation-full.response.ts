import { ApiProperty } from '@nestjs/swagger';
import { ConsultationResponse } from './consultation.response';
import { TourFacilityResponse } from './tour-facility.response';
import { TourResponse } from './tour.response';
import { ConsultationEntity, TourFacilityEntity } from '@/infrastructure/repository/entity';

export class ConsultationFullResponse extends ConsultationResponse {
  @ApiProperty({
    description: '상담과 연관된 투어 정보',
    type: () => TourResponse,
  })
  tour: TourResponse | null;

  @ApiProperty({
    description: '투어 시설 목록',
    type: () => [TourFacilityResponse],
  })
  tourFacilities: TourFacilityResponse[];

  static fromEntity(entity: ConsultationEntity): ConsultationFullResponse {
    const dto = ConsultationResponse.fromEntity(
      entity
    ) as ConsultationFullResponse;

    dto.tour = entity.tour ? TourResponse.fromEntity(entity.tour) : null;
    dto.tourFacilities = (entity.tour?.tourFacilities || []).map((facility) =>
      ConsultationFullResponse.mapFacilityToResponse(facility)
    );

    return dto;
  }

  private static mapFacilityToResponse(
    facility: TourFacilityEntity
  ): TourFacilityResponse {
    const response = new TourFacilityResponse();
    response.id = `${facility.id}`;
    response.tourId = `${facility.tourId}`;
    response.facilityId = `${facility.facilityId}`;
    response.facilityTitle = facility.facility?.title || '';
    response.facilityDescription = facility.facility?.description;
    response.sceneId = `${facility.sceneId}`;
    response.cameraPosX = facility.cameraPosX;
    response.cameraPosY = facility.cameraPosY;
    response.cameraPosZ = facility.cameraPosZ;
    response.isDefaultStart = facility.isDefaultStart;
    response.displayOrder = facility.displayOrder;
    response.isActive = facility.isActive;
    response.type = facility.type;
    response.createdAt = facility.createdAt.toISOString();
    response.updatedAt = facility.updatedAt.toISOString();
    return response;
  }
}
