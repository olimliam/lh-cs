import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UploadContentImageCommand {
  @ApiProperty({
    description: '이미지를 사용할 콘텐츠 유형',
    enum: ContentOwnerType,
    example: ContentOwnerType.NOTIFICATION,
  })
  @IsEnum(ContentOwnerType)
  contentType: ContentOwnerType;

  @ApiPropertyOptional({
    description: '이미지를 연결할 콘텐츠 ID (신규 작성 시 생략)',
    example: '101',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsNumberString()
  contentId?: string;

  @ApiPropertyOptional({
    description: '원본 파일명 (지정하지 않으면 서버에서 생성)',
    example: 'inline-image.png',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @MaxLength(255)
  fileName?: string;
}
