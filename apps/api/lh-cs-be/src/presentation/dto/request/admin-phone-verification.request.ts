import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches } from 'class-validator';

export class AdminPhoneVerificationRequest {
  @ApiProperty({
    description: '조회할 전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @IsNotEmpty({ message: '전화번호를 입력해 주세요.' })
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자 10~11자리여야 합니다.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phoneNumber: string;
}
