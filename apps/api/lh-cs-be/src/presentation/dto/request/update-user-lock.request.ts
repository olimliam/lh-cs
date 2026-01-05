import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateUserLockRequest {
  @ApiPropertyOptional({
    description: '잠금 유지 시간(분). 설정하지 않으면 기본 정책을 사용합니다.',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;
}
