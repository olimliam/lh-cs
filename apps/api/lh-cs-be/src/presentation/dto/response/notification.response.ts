import { ApiProperty } from '@nestjs/swagger';
import { NotificationEntity } from '@/infrastructure/repository/entity/notification.entity';
import { PaginationResDto } from '@/common/dto/pagination.dto';
import { ContentImageResponse } from './content-image.response';
import { ContentAttachmentResponse } from './content-attachment.response';

export class NotificationResponse {
  @ApiProperty({ description: '공지 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '공지 제목', example: '정기 점검 안내' })
  title: string;

  @ApiProperty({
    description: '공지 본문 내용',
    example: '2024년 12월 15일 01:00~05:00 시스템 점검 예정입니다.',
  })
  content: string;

  @ApiProperty({
    description: '생성 일시 (ISO8601)',
    example: '2024-12-01T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시 (ISO8601)',
    example: '2024-12-02T01:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '공개 여부',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({ description: '작성자 사용자명', example: 'admin' })
  createdBy: string;

  @ApiProperty({ description: '최종 수정자 사용자명', example: 'content-manager' })
  updatedBy: string;

  @ApiProperty({
    description: '본문에 포함된 인라인 이미지 목록',
    type: () => [ContentImageResponse],
  })
  contentImages: ContentImageResponse[];

  @ApiProperty({
    description: '첨부 파일 목록',
    type: () => [ContentAttachmentResponse],
  })
  attachments: ContentAttachmentResponse[];

  static fromEntity(entity: NotificationEntity): NotificationResponse {
    const attachments = ContentAttachmentResponse.fromEntities(
      entity.contentAttachments ?? []
    );
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isPublic: entity.isPublic,
      createdBy: entity.createdByUser?.username ?? entity.createdBy,
      updatedBy: entity.updatedByUser?.username ?? entity.updatedBy,
      contentImages: ContentImageResponse.fromEntities(
        entity.contentImages ?? []
      ),
      attachments,
    };
  }
}

export class PaginatedNotificationResponse extends PaginationResDto<NotificationResponse> {
  static from(
    data: NotificationEntity[],
    total: number,
    page: number,
    limit: number
  ): PaginatedNotificationResponse {
    const totalPages = Math.ceil(total / limit) || 1;
    return new PaginatedNotificationResponse({
      data: data.map(NotificationResponse.fromEntity),
      total,
      page,
      limit,
      totalPages,
    });
  }
}
