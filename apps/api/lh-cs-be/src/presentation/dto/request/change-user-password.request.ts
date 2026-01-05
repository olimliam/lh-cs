import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { IsStrongPassword } from '@/common/decorator/strong-password.decorator';

export class ChangeUserPasswordRequest {
  @ApiProperty({
    description: `새 비밀번호 (보안 정책)
- 최소 8자 이상
- 대문자, 소문자, 숫자, 특수문자 포함
- 연속된 문자나 반복 문자 3개 이상 금지
- 일반적인 패턴(password, 123456 등) 금지`,
    example: 'NewSecurePassword12#$',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  })
  newPassword: string;

  @ApiPropertyOptional({
    description: '비밀번호 변경 사유',
    example: '사용자 요청에 의한 비밀번호 재설정',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
