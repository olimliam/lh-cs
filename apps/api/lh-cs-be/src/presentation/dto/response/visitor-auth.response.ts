import { ApiProperty } from '@nestjs/swagger';

export class VisitorAuthResponse {
  @ApiProperty({
    example: true,
    description: '인증 성공 여부',
  })
  success: boolean;

  @ApiProperty({
    example: 'consultation_123',
    description: '상담실 ID',
  })
  consultationId: string;

  @ApiProperty({
    example: 'uuid_123',
    description: '방문자 ID',
  })
  visitorId?: string;

  @ApiProperty({
    example: '김상담',
    description: '상담사 이름',
  })
  consultantName: string;

  @ApiProperty({
    example: '상담실 입장 성공',
    description: '응답 메시지',
    required: false,
  })
  message?: string;
}
