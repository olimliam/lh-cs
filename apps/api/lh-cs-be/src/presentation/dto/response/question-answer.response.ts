import { ApiProperty } from '@nestjs/swagger';
import { PaginationResDto } from '@/common/dto/pagination.dto';
import { QuestionAnswerEntity } from '@/infrastructure/repository/entity/question-answer.entity';
import { ContentImageResponse } from './content-image.response';
import { ContentAttachmentResponse } from './content-attachment.response';

export class QuestionAnswerResponse {
  @ApiProperty({ description: 'Q&A ID', example: '1' })
  id: string;

  @ApiProperty({ description: '질문 제목', example: '상담 예약은 어떻게 하나요?' })
  title: string;

  @ApiProperty({
    description: '답변 본문 내용',
    example: '관리자 포털의 상담실 생성 메뉴에서 예약하실 수 있습니다.',
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

  @ApiProperty({ description: '작성자 사용자명', example: 'consultant01' })
  createdBy: string;

  @ApiProperty({ description: '최종 수정자 사용자명', example: 'content-manager' })
  updatedBy: string;

  @ApiProperty({
    description: '본문 인라인 이미지 목록',
    type: () => [ContentImageResponse],
  })
  contentImages: ContentImageResponse[];

  @ApiProperty({
    description: '첨부 파일 목록',
    type: () => [ContentAttachmentResponse],
  })
  attachments: ContentAttachmentResponse[];

  static fromEntity(entity: QuestionAnswerEntity): QuestionAnswerResponse {
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

export class PaginatedQuestionAnswerResponse extends PaginationResDto<QuestionAnswerResponse> {
  static from(
    data: QuestionAnswerEntity[],
    total: number,
    page: number,
    limit: number
  ): PaginatedQuestionAnswerResponse {
    const totalPages = Math.ceil(total / limit) || 1;
    return new PaginatedQuestionAnswerResponse({
      data: data.map(QuestionAnswerResponse.fromEntity),
      total,
      page,
      limit,
      totalPages,
    });
  }
}
