import { ApiProperty } from '@nestjs/swagger';
import { ContentAttachmentEntity } from '@/infrastructure/repository/entity/content-attachment.entity';

export class ContentAttachmentResponse {
  @ApiProperty({ description: '첨부 ID', example: '101' })
  attachmentId: string;

  @ApiProperty({ description: '첨부 파일명', example: '안내문.pdf' })
  fileName: string;

  @ApiProperty({
    description: '첨부 파일 URL',
    example: 'https://cdn.example.com/qna/123/guide.pdf',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'S3 파일 키',
    example: 'qna/123/uuid-안내문.pdf',
  })
  fileKey: string;

  @ApiProperty({
    description: 'MIME 타입',
    example: 'application/pdf',
    nullable: true,
  })
  mimeType?: string | null;

  @ApiProperty({
    description: '파일 크기(Byte)',
    example: '204800',
    nullable: true,
  })
  fileSize?: string | null;

  @ApiProperty({
    description: '정렬 순서(1부터 시작)',
    example: 1,
    nullable: true,
  })
  order?: number | null;

  static fromEntity(
    entity: ContentAttachmentEntity
  ): ContentAttachmentResponse {
    return {
      attachmentId: entity.id,
      fileName: entity.fileName,
      fileUrl: entity.fileUrl,
      fileKey: entity.fileKey,
      mimeType: entity.mimeType ?? null,
      fileSize: entity.fileSize ?? null,
      order: entity.attachmentIndex ?? null,
    };
  }

  static fromEntities(
    entities: ContentAttachmentEntity[] | undefined | null
  ): ContentAttachmentResponse[] {
    if (!entities || entities.length === 0) {
      return [];
    }

    return entities
      .slice()
      .sort((a, b) => {
        const left = a.attachmentIndex ?? Number.MAX_SAFE_INTEGER;
        const right = b.attachmentIndex ?? Number.MAX_SAFE_INTEGER;
        if (left === right) {
          return a.id.localeCompare(b.id);
        }
        return left - right;
      })
      .map(ContentAttachmentResponse.fromEntity);
  }
}
