import {
  UserStatusEnum,
  UserRoleEnum,
  UserApprovalStatusEnum,
} from '@/infrastructure/repository/entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserResponse {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '사용자 이름' })
  name: string;

  @ApiProperty({ description: '로그인 아이디' })
  username: string;

  @ApiProperty({ description: '사용자 역할', enum: UserRoleEnum })
  role: UserRoleEnum;

  @ApiProperty({ description: '계정 상태', enum: UserStatusEnum })
  status: UserStatusEnum;

  @ApiProperty({
    description: '가입 승인 상태',
    enum: UserApprovalStatusEnum,
  })
  approvalStatus: UserApprovalStatusEnum;

  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  profileImageUrl?: string;

  @ApiProperty({ description: '마지막 로그인 시간', required: false })
  lastLoginAt?: Date;

  @ApiProperty({ description: '계정 생성일' })
  createdAt: Date;

  @ApiProperty({ description: '계정 수정일' })
  updatedAt: Date;
}

export class AuthResponse {
  @ApiProperty({ description: 'Access Token' })
  accessToken: string;

  @ApiPropertyOptional({ description: 'Refresh Token' })
  refreshToken?: string;

  @ApiPropertyOptional({ description: 'CSRF 방어용 토큰' })
  csrfToken?: string;

  @ApiProperty({ description: '비밀번호 변경 필요 여부' })
  passwordChangeRequired: boolean;

  @ApiProperty({ description: '사용자 정보', type: UserResponse })
  user: UserResponse;
}
