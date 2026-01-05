import { ApiProperty } from '@nestjs/swagger';

export class AdminPhoneVerificationResponse {
  @ApiProperty({
    description: '요청한 전화번호 (숫자만)',
    example: '01012345678',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '발급된 인증번호',
    example: '123456',
  })
  verificationCode: string;

  @ApiProperty({
    description: '인증번호 만료 시각',
    type: String,
    format: 'date-time',
    example: '2024-08-01T09:30:00.000Z',
  })
  expiresAt: Date;

  @ApiProperty({
    description: '현재까지 입력 시도 횟수',
    example: 2,
  })
  attemptCount: number;

  @ApiProperty({
    description: '인증 완료 여부',
    example: false,
  })
  verified: boolean;

  @ApiProperty({
    description: '인증번호가 발급된 시각',
    type: String,
    format: 'date-time',
    example: '2024-08-01T09:25:00.000Z',
  })
  createdAt: Date;
}
