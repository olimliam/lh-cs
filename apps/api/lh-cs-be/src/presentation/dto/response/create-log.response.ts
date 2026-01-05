import { ApiProperty } from '@nestjs/swagger';

export class CreateLogResponse {
  @ApiProperty({
    description: '생성된 로그 ID',
    example: '123456789',
  })
  id: string;

  @ApiProperty({
    description: '로그 생성 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '생성된 시간',
    example: '2024-09-29T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '메시지',
    example: '로그가 성공적으로 생성되었습니다.',
  })
  message: string;
}