import { FacilityTypeEnum } from '@/infrastructure/repository/entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 투어 시설 응답 DTO (Presentation Layer)
 */
export class TourFacilityResponse {
  @ApiProperty({
    description: '투어 시설 ID',
    type: String,
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '투어 ID',
    type: String,
    example: '1',
  })
  tourId: string;

  @ApiProperty({
    description: '시설 ID',
    type: String,
    example: '1',
  })
  facilityId: string;

  @ApiProperty({
    description: '시설명',
    type: String,
    example: 'LED 조명',
  })
  facilityTitle: string;

  @ApiProperty({
    description: '시설 설명',
    type: String,
    example: '에너지 효율적인 LED 조명 시스템',
    required: false,
  })
  facilityDescription?: string;

  @ApiProperty({
    description: 'Scene ID',
    type: String,
    example: '3',
  })
  sceneId: string;

  @ApiProperty({
    description: '카메라 포지션 X',
    type: Number,
    example: 2.5,
    required: false,
  })
  cameraPosX?: number;

  @ApiProperty({
    description: '카메라 포지션 Y',
    type: Number,
    example: 1.8,
    required: false,
  })
  cameraPosY?: number;

  @ApiProperty({
    description: '카메라 포지션 Z',
    type: Number,
    example: 0.0,
    required: false,
  })
  cameraPosZ?: number;

  @ApiProperty({
    description: '기본 시작 위치 여부',
    type: Boolean,
    example: false,
  })
  isDefaultStart: boolean;

  @ApiProperty({
    description: '표시 순서',
    type: Number,
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: '활성화 여부',
    type: Boolean,
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: '시설 유형',
    example: 'CONSTRUCTION',
  })
  type: FacilityTypeEnum;

  @ApiProperty({
    description: '생성 시간',
    type: String,
    format: 'date-time',
    example: '2025-08-25T12:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '수정 시간',
    type: String,
    format: 'date-time',
    example: '2025-08-25T12:00:00.000Z',
  })
  updatedAt: string;
}
