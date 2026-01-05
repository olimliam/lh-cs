import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectRegistrationRequest {
  @ApiPropertyOptional({ description: '거절 사유', maxLength: 255, example: '자격 요건 미충족' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
