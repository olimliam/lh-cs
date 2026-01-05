import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogZoomSessionRequestDto {
  @ApiProperty({
    description: '상담 ID',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  consultationId: string;

  @ApiProperty({
    description: 'Zoom Video SDK sessionId',
    example: 'cc2i1PmPS3atMXA+RB8rQw==',
  })
  @IsString()
  @IsNotEmpty()
  zoomSessionId: string;
}
