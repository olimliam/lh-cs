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

export class CreateQuestionAnswerCommand {
  @ApiProperty({
    description: '질문 제목',
    example: '상담 예약은 어떻게 하나요?',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '답변 본문 내용',
    example: '상담 예약은 관리자 포털에서 상담실을 생성하여 진행합니다.',
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
    example: ['공지안내.pdf', '별첨.zip'],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  @MaxLength(255, { each: true })
  attachmentNames?: string[];

  @ApiPropertyOptional({
    description: '본문 인라인 이미지 ID 목록',
    type: [String],
    example: ['201', '202'],
  })
  @IsOptional()
  @Transform(transformToStringArray)
  @IsArray()
  @IsString({ each: true })
  contentImageRefs?: string[];
}
