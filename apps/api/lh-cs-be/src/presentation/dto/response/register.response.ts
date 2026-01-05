import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

export class RegisterResponse {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '로그인 아이디' })
  username: string;

  @ApiProperty({ description: '사용자 이름' })
  name: string;

  @ApiProperty({ description: '사용자 역할', enum: UserRoleEnum })
  role: UserRoleEnum;

  @ApiProperty({ description: '계정 상태', enum: UserStatusEnum })
  status: UserStatusEnum;

  @ApiProperty({
    description: '가입 승인 상태',
    enum: UserApprovalStatusEnum,
  })
  approvalStatus: UserApprovalStatusEnum;

  @ApiProperty({
    description: '가입 신청 시각',
    example: '2024-03-01T00:00:00.000Z',
  })
  signedAt: Date;

  @ApiPropertyOptional({
    description: '소속 부서',
    example: '공동주택관리지원실',
    nullable: true,
  })
  department?: string | null;
}
