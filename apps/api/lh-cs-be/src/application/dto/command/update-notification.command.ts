import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { transformToStringArray } from '@/common/transformer/transform-to-string-array';

export class UpdateNotificationCommand {
  @ApiPropertyOptional({
    description: '공지 제목',
    example: '정기 점검 안내 (변경)',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: '공지 본문 내용',
    example: '점검 시간이 02:00~06:00으로 변경되었습니다.',
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
