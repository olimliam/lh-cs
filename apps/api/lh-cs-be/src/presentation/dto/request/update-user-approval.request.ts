import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { UserApprovalStatusEnum } from '@/infrastructure/repository/entity';

export class UpdateUserApprovalRequest {
  @ApiProperty({
    description: '변경할 가입 승인 상태',
    enum: UserApprovalStatusEnum,
    example: UserApprovalStatusEnum.APPROVED,
  })
  @IsEnum(UserApprovalStatusEnum)
  approvalStatus: UserApprovalStatusEnum;

  @ApiPropertyOptional({ description: '거절 사유', maxLength: 255, example: '자격 요건 미충족' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
