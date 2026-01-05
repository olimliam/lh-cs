import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { transformToStringArray } from '@/common/transformer/transform-to-string-array';

export class CreateNotificationCommand {
  @ApiProperty({
    description: '공지 제목',
    example: '정기 점검 안내',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '공지 본문 내용',
    example: '2024년 12월 15일 01:00~05:00 시스템 점검 예정입니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: '공개 여부 (기본값: true)',
    default: true,
  })
  @IsBooleanAndBooleanString({ optional: true })
  isPublic?: boolean = true;

  @ApiPropertyOptional({
    description: '첨부 파일별 사용자 지정 이름 목록(FormData attachmentNames[])',
    type: [String],
    example: ['점검-안내.pdf', '별첨.zip'],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  attachmentNames?: string[];

  @ApiPropertyOptional({
    description: '본문에 포함된 인라인 이미지 ID 목록',
    type: [String],
    example: ['101', '102'],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  contentImageRefs?: string[];
}
