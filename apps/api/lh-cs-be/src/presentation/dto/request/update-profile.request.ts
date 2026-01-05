import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { IsBooleanAndBooleanString } from '@/common/decorator/is-boolean-and-boolean-string.decorator';

const transformOptionalString = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return value;
};

export class UpdateProfileRequest {
  @ApiPropertyOptional({ description: '사용자 이름', example: '홍길동' })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: '부서명', example: '상담운영팀' })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: '전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자 10~11자리여야 합니다.',
  })
  phoneNumber?: string;

  @ApiProperty({
    description: '프로필 이미지 수정 여부',
  })
  @IsBooleanAndBooleanString()
  isEditProfileImage: boolean;
}

export class UpdateProfileFormRequest extends UpdateProfileRequest {
  @ApiPropertyOptional({
    description: '업로드할 프로필 이미지 파일',
    type: 'string',
    format: 'binary',
  })
  profileImage?: string;
}
