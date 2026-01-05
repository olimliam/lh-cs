import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserRoleEnum,
  UserStatusEnum,
  UserApprovalStatusEnum,
} from '@/infrastructure/repository/entity';

export class CreateUserDataResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: '로그인 아이디',
    example: '123456',
  })
  username: string;

  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  name: string;

  @ApiPropertyOptional({
    description: '부서',
    example: '개발팀',
  })
  department?: string;

  @ApiProperty({
    description: '사용자 권한',
    enum: UserRoleEnum,
    example: UserRoleEnum.CONSULTANT,
  })
  role: UserRoleEnum;

  @ApiProperty({
    description: '사용자 상태',
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
  })
  status: UserStatusEnum;

  @ApiProperty({
    description: '가입 승인 상태',
    enum: UserApprovalStatusEnum,
    example: UserApprovalStatusEnum.APPROVED,
  })
  approvalStatus: UserApprovalStatusEnum;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile/john.jpg',
  })
  profileImageUrl?: string;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}

export class CreateUserResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: 'User created successfully',
  })
  message: string;

  @ApiProperty({
    description: '생성된 사용자 정보',
    type: CreateUserDataResponse,
  })
  data: CreateUserDataResponse;
}
