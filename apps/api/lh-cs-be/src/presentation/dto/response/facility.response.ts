import { ApiProperty } from '@nestjs/swagger';
import { FacilityEntity } from '../../../infrastructure/repository/entity/facility.entity';
import { FacilityTypeEnum } from '@/infrastructure/repository/entity';

export class FacilityResponse {
  @ApiProperty({
    description: '설비 ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '시설명',
    example: '거실 조명',
  })
  title: string;

  @ApiProperty({
    description: '시설 설명',
    example: '거실 중앙에 위치한 메인 조명입니다.',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '생성일시',
    example: '2024-08-24T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-08-24T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '시설 유형',
    example: 'CONSTRUCTION',
  })
  type: FacilityTypeEnum;

  /**
   * FacilityEntity를 FacilityResponseDto로 변환
   */
  static fromEntity(facility: FacilityEntity): FacilityResponse {
    const dto = new FacilityResponse();
    dto.id = facility.id.toString();
    dto.title = facility.title;
    dto.description = facility.description;
    dto.isActive = facility.isActive;
    dto.createdAt = facility.createdAt;
    dto.updatedAt = facility.updatedAt;
    return dto;
  }

  /**
   * FacilityEntity 배열을 FacilityResponseDto 배열로 변환
   */
  static fromEntities(facilities: FacilityEntity[]): FacilityResponse[] {
    return facilities.map((facility) => FacilityResponse.fromEntity(facility));
  }
}
