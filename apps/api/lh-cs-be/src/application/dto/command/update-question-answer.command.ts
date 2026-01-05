import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { transformToStringArray } from '@/common/transformer/transform-to-string-array';

export class UpdateQuestionAnswerCommand {
  @ApiPropertyOptional({
    description: '질문 제목',
    example: '상담 예약 절차 안내 (수정)',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: '답변 본문 내용',
    example: '변경된 절차는 공지사항을 참고해주세요.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: '기존 첨부 파일 전체 삭제 여부',
    default: false,
  })
  @IsBooleanAndBooleanString({ optional: true })
  removeExistingFiles?: boolean;

  @ApiPropertyOptional({
    description: '공개 여부',
    default: true,
  })
  @IsBooleanAndBooleanString({ optional: true })
  isPublic?: boolean;

  @ApiPropertyOptional({
    description:
      '새 첨부 파일별 사용자 지정 이름 목록(FormData attachmentNames[])',
    type: [String],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  attachmentNames?: string[];

  @ApiPropertyOptional({
    description: '삭제할 첨부 ID 배열(FormData attachmentIdsToRemove[])',
    type: [String],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  attachmentIdsToRemove?: string[];

  @ApiPropertyOptional({
    description: '본문 인라인 이미지 ID 목록',
    type: [String],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  contentImageRefs?: string[];
}
