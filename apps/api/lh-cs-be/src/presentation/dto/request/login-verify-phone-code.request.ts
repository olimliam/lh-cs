import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class LoginVerifyPhoneCodeRequest {
  @ApiProperty({
    description: '로그인 2차 인증번호 (6자리 숫자)',
    example: '123456',
  })
  @IsString()
  @Length(6, 6)
  verificationCode: string;
}
