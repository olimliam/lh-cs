import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatusEnum } from '@/infrastructure/repository/entity';

export class UpdateUserStatusRequest {
  @ApiProperty({
    description: '사용자 상태',
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
  })
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum;

  @ApiPropertyOptional({
    description: '상태 변경 사유',
    example: '정책 위반으로 인한 계정 정지',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
