import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, Length } from 'class-validator';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { IsStrongPassword } from '@/common/decorator/strong-password.decorator';

export class CreateUserRequest {
  @ApiProperty({
    description: '로그인 아이디 (숫자 6~20자리)',
    example: '123456',
  })
  @IsString()
  @Length(6, 20)
  @Matches(/^\d{6,20}$/)
  username: string;

  @ApiProperty({
    description: `비밀번호 (보안 정책)
- 최소 8자 이상
- 대문자, 소문자, 숫자, 특수문자 포함
- 연속된 문자나 반복 문자 3개 이상 금지
- 일반적인 패턴(password, 123456 등) 금지`,
    example: 'SecurePassword12#$',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  })
  password: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: '전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @IsString()
  @Matches(/^\d{10,11}$/)
  phoneNumber: string;

  @ApiPropertyOptional({
    description: '부서',
    example: '개발팀',
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: '사용자 권한',
    enum: UserRoleEnum,
    example: UserRoleEnum.CONSULTANT,
  })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile/john.jpg',
  })
  @IsString()
  @IsOptional()
  profileImageUrl?: string;
}
