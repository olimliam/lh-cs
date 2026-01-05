import { ApiProperty } from '@nestjs/swagger';
import { TourEntity } from '../../../infrastructure/repository/entity/tour.entity';

export class TourResponse {
  @ApiProperty({
    description: '투어 ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '투어 접근 ID',
    example: 'tour_84_a_type',
  })
  tourCdnId: string;

  @ApiProperty({
    description: '평형 제곱미터',
    example: 84,
  })
  squareMeters: number;

  @ApiProperty({
    description: '평형 정보 제목',
    example: '84㎡ A타입',
  })
  title: string;

  @ApiProperty({
    description: '투어 이미지 URL',
    example: 'https://example.com/tour-image.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: '투어 설명',
    example: '넓은 거실과 3개의 방이 있는 84평형 A타입 투어입니다.',
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

  /**
   * TourEntity를 TourResponseDto로 변환
   */
  static fromEntity(tour: TourEntity): TourResponse {
    const dto = new TourResponse();
    dto.id = tour.id.toString();
    dto.tourCdnId = tour.tourCdnId;
    dto.squareMeters = tour.squareMeters;
    dto.title = tour.title;
    dto.imageUrl = tour.imageUrl;
    dto.description = tour.description;
    dto.isActive = tour.isActive;
    dto.createdAt = tour.createdAt;
    dto.updatedAt = tour.updatedAt;
    return dto;
  }

  /**
   * TourEntity 배열을 TourResponseDto 배열로 변환
   */
  static fromEntities(tours: TourEntity[]): TourResponse[] {
    return tours.map((tour) => TourResponse.fromEntity(tour));
  }
}
