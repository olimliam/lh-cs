import { ConsultationStatus } from '@/infrastructure/repository/entity';
import { ApiProperty } from '@nestjs/swagger';
import { ReadConsultationEntity } from '@/infrastructure/repository/entity/read-consultation.entity';
import { ConsultationEntity } from '@/infrastructure/repository/entity/consultation.entity';

export class ConsultationDto {
  @ApiProperty({
    description: '상담실 ID',
    example: 1,
  })
  id: string;

  @ApiProperty({
    description: '상담실 번호',
    example: '123456',
  })
  roomNumber: string;

  @ApiProperty({
    description: '상담실 이름',
    example: '84㎡ 상담실',
    required: false,
  })
  roomName?: string;

  @ApiProperty({
    description: '상담 코드',
    example: 'CONSULTATION_001',
  })
  consultationCode: string;

  @ApiProperty({
    description: '입장 코드',
    example: '1234',
    required: false,
  })
  enterCode?: string;

  @ApiProperty({
    description: '상담실 상태',
    enum: ConsultationStatus,
    example: ConsultationStatus.READY,
  })
  status: ConsultationStatus;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '상담원 사용자 ID',
    example: '123',
  })
  userId: string;

  @ApiProperty({
    description: '상담원 이름',
    example: '김상담',
  })
  consultantName: string;

  @ApiProperty({
    description: '투어 CDN ID',
    example: 'tourCdnId',
  })
  tourCdnId: string;

  @ApiProperty({
    description: '투어 제목',
    example: '84㎡ 아파트 투어',
  })
  tourTitle: string;

  @ApiProperty({
    description: '평형 제곱미터',
    example: 84,
  })
  squareMeters: number;

  @ApiProperty({
    description: '투어 이미지 URL',
    example: 'https://cdn.example.com/tours/images/tour-thumbnail-001.jpg',
    required: false,
  })
  tourImageUrl?: string;

  @ApiProperty({
    description: '시설 제목',
    example: '거실',
  })
  facilityTitle: string;

  @ApiProperty({
    description: '상담 시작 시설 Scene ID',
    example: '12345',
  })
  startFacilitySceneId: string;

  @ApiProperty({
    description: '상담 시작 투어 시설 ID(tour_facility_id)',
    example: 'tour_facility_id',
    required: false,
  })
  startTourFacilityId?: string;

  @ApiProperty({
    description: '방문자 ID',
    example: 'visitor-uuid-123',
    required: false,
  })
  visitorId?: string;

  @ApiProperty({
    description: '상담 시작 시간 (CONSULTING 상태가 된 시점)',
    example: '2024-01-01T10:30:00Z',
    required: false,
  })
  consultingStartedAt?: Date;

  @ApiProperty({
    description: '상담 종료 요청 시간 (END 상태로 변경된 시점)',
    example: '2024-01-01T10:35:00Z',
    required: false,
  })
  endRequestedAt?: Date;

  @ApiProperty({
    description: '생성 시간',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시간',
    example: '2024-01-01T00:00:00Z',
  })
  updatedAt: Date;

  /**
   * ReadConsultationEntity에서 DTO로 변환 (성능 최적화용 - CQRS Read Model)
   */
  static fromReadEntity(entity: ReadConsultationEntity): ConsultationDto {
    const dto = new ConsultationDto();
    dto.id = entity.id;
    dto.roomNumber = entity.roomNumber;
    dto.roomName = entity.roomName;
    dto.consultationCode = entity.consultationCode;
    dto.enterCode = entity.enterCode;
    dto.status = entity.status;
    dto.isActive = entity.isActive;
    dto.userId = entity.userId;
    dto.consultantName = entity.consultantName;
    dto.tourCdnId = entity.tourCdnId;
    dto.tourTitle = entity.tourTitle;
    dto.squareMeters = entity.tourSquareMeters;
    dto.tourImageUrl = entity.tourImageUrl; // ReadModel에서 이미 비정규화된 데이터
    dto.facilityTitle = entity.facilityTitle;
    dto.startFacilitySceneId = entity.startFacilitySceneId;
    dto.startTourFacilityId = entity.tourFacilityId;
    dto.visitorId = entity.visitorId;
    dto.consultingStartedAt = entity.consultingStartedAt;
    dto.endRequestedAt = entity.endRequestedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  /**
   * ConsultationEntity에서 DTO로 변환 (JOIN 쿼리용 - 정규화 테이블)
   */
  static fromEntity(entity: ConsultationEntity): ConsultationDto {
    const dto = new ConsultationDto();
    dto.id = entity.id;
    dto.roomNumber = entity.roomNumber;
    dto.roomName = entity.roomName;
    dto.consultationCode = entity.consultationCode;
    dto.enterCode = entity.enterCode;
    dto.status = entity.status;
    dto.isActive = entity.isActive;
    dto.userId = entity.userId;
    dto.consultantName = entity.user?.name || '';
    dto.tourCdnId = entity.tour?.tourCdnId || '';
    dto.tourTitle = entity.tour?.title || '';
    dto.squareMeters = entity.tour?.squareMeters || 0;
    dto.tourImageUrl = entity.tour?.imageUrl; // JOIN된 tour 테이블에서 이미지 URL
    dto.facilityTitle = entity.startTourFacility?.facility?.title || '';
    dto.startFacilitySceneId = entity.startTourFacility?.sceneId || '';
    dto.startTourFacilityId = entity.startTourFacilityId;
    dto.visitorId = entity.visitorId;
    dto.consultingStartedAt = entity.consultingStartedAt;
    dto.endRequestedAt = entity.endRequestedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  /**
   * ReadConsultationEntity 배열을 DTO 배열로 변환
   */
  static fromReadEntities(
    entities: ReadConsultationEntity[]
  ): ConsultationDto[] {
    return entities.map((entity) => ConsultationDto.fromReadEntity(entity));
  }

  /**
   * ConsultationEntity 배열을 DTO 배열로 변환
   */
  static fromEntities(entities: ConsultationEntity[]): ConsultationDto[] {
    return entities.map((entity) => ConsultationDto.fromEntity(entity));
  }
}
