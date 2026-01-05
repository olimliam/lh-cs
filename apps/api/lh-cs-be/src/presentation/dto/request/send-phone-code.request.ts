import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class SendPhoneCodeRequest {
  @ApiProperty({
    description: '전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자 10~11자리여야 합니다.',
  })
  phoneNumber: string;
}
