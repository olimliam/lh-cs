import { ApiProperty } from '@nestjs/swagger';
import { VerificationRemainingTimeResult } from '@/application/service/phone-verification.service';

export class RegisterCodeRemainingResponse {
  @ApiProperty({ example: '01012345678' })
  phoneNumber: string;

  @ApiProperty({ example: 240, description: '남은 시간(초)' })
  remainingSeconds: number;

  @ApiProperty({
    example: '2024-03-01T12:05:00.000Z',
    description: '인증번호 만료 시각(ISO 8601)',
  })
  expiresAt: string;

  @ApiProperty({ example: false, description: '인증번호 만료 여부' })
  isExpired: boolean;

  @ApiProperty({ example: false, description: '이미 인증이 완료되었는지 여부' })
  verified: boolean;

  @ApiProperty({
    example: '2024-03-01T12:01:00.000Z',
    description: '서버 기준 현재 시각(ISO 8601)',
  })
  serverTime: string;

  static from(
    result: VerificationRemainingTimeResult
  ): RegisterCodeRemainingResponse {
    const response = new RegisterCodeRemainingResponse();
    response.phoneNumber = result.phoneNumber;
    response.remainingSeconds = result.remainingSeconds;
    response.expiresAt = result.expiresAt.toISOString();
    response.isExpired = result.isExpired;
    response.verified = result.verified;
    response.serverTime = result.serverTime.toISOString();
    return response;
  }
}
