import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @ApiProperty({ description: '현재 비밀번호', example: 'currentPassword123' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ description: '새 비밀번호', example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: '새 비밀번호 확인', example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
