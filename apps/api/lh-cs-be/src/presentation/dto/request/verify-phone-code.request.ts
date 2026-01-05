import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class VerifyPhoneCodeRequest {
  @ApiProperty({
    description: '전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자 10~11자리여야 합니다.',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '인증번호 (6자리 숫자)',
    example: '123456',
  })
  @IsString()
  @Matches(/^\d{6}$/)
  verificationCode: string;
}
