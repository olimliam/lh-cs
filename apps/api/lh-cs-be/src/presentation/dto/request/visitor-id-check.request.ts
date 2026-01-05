import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VisitorIdCheckRequest {
  @ApiProperty({
    example: 'consultation_123',
    description: '상담실 ID (선택사항)',
    required: false,
  })
  @IsString()
  @IsOptional()
  consultationId?: string;
}