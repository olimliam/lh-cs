import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VisitorAuthRequest {
  @ApiProperty({
    example: 'visitor_1234567890_uuid-here',
    description: 'Visitor의 고유 ID',
  })
  @IsString()
  @IsNotEmpty()
  visitorId: string;

  @ApiProperty({
    example: '1234',
    description: '상담실 입장 코드 (4자리)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: '입장 코드는 4자리여야 합니다' })
  enterCode: string;

  @ApiProperty({
    example: 'consultation_uuid-here',
    description: '상담실 고유 ID',
  })
  @IsString()
  @IsNotEmpty()
  consultationId: string;
}
