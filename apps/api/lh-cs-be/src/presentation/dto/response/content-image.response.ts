import { ApiProperty } from '@nestjs/swagger';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';
import { ContentImageEntity } from '@/infrastructure/repository/entity/content-image.entity';

export class ContentImageResponse {
  @ApiProperty({ description: '콘텐츠 이미지 ID', example: '1001' })
  id: string;

  @ApiProperty({
    description: '연결된 콘텐츠 ID (미할당 시 null)',
    example: '42',
    nullable: true,
  })
  contentId: string | null;

  @ApiProperty({
    description: '콘텐츠 타입',
    enum: ContentOwnerType,
    example: ContentOwnerType.NOTIFICATION,
  })
  contentType: ContentOwnerType;

  @ApiProperty({
    description: 'S3 오브젝트 키',
    example: 'content-images/notification/uuid-inline.png',
  })
  s3Key: string;

  @ApiProperty({
    description: '공개 URL',
    example: 'https://cdn.example.com/content-images/notification/uuid-inline.png',
  })
  url: string;

  @ApiProperty({
    description: '업로드 파일명',
    example: 'inline-image.png',
    nullable: true,
  })
  fileName: string | null;

  @ApiProperty({
    description: '업로드 당시 Content-Type',
    example: 'image/png',
    nullable: true,
  })
  contentTypeHeader: string | null;

  @ApiProperty({
    description: '콘텐츠에서 사용 중 여부',
    example: true,
  })
  isUsed: boolean;

  @ApiProperty({
    description: '업로더 사용자 ID',
    example: '1',
  })
  uploadedBy: string;

  @ApiProperty({
    description: '생성 일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '갱신 일시',
    example: '2025-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(entity: ContentImageEntity): ContentImageResponse {
    return {
      id: entity.id,
      contentId: entity.contentId ?? null,
      contentType: entity.contentType,
      s3Key: entity.s3Key,
      url: entity.url,
      fileName: entity.fileName ?? null,
      contentTypeHeader: entity.contentTypeHeader ?? null,
      isUsed: entity.isUsed,
      uploadedBy: entity.uploadedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static fromEntities(
    entities: ContentImageEntity[]
  ): ContentImageResponse[] {
    return entities.map(ContentImageResponse.fromEntity);
  }
}
