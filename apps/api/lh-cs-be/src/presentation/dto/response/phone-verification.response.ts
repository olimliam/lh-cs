import { ApiProperty } from '@nestjs/swagger';

export class SendPhoneCodeDataResponse {
  @ApiProperty({
    description: '인증번호 만료 시각',
    example: '2024-08-01T09:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  expiresAt: Date;

  // @ApiProperty({
  //   description: '발급된 인증번호 (테스트 환경에서만 반환)',
  //   example: '123456',
  // })
  // code: string;
}

export class VerifyPhoneCodeDataResponse {
  @ApiProperty({
    description: '인증 성공 여부',
    example: true,
  })
  verified: boolean;
}
