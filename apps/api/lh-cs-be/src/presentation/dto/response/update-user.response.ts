import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserApprovalStatusEnum,
  UserRoleEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

export class UpdateUserDataResponse {
  @ApiProperty({ description: '사용자 ID', example: '4' })
  id: string;

  @ApiProperty({ description: '로그인 아이디', example: 'user01' })
  username: string;

  @ApiProperty({ description: '사용자 이름', example: '홍길동' })
  name: string;

  @ApiPropertyOptional({ description: '소속 부서', example: '상담운영팀' })
  department?: string | null;

  @ApiPropertyOptional({
    description: '전화번호',
    example: '01012345678',
    nullable: true,
  })
  phoneNumber?: string | null;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://cdn.example.com/avatar.png',
    nullable: true,
  })
  profileImageUrl?: string | null;

  @ApiProperty({
    description: '사용자 역할',
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

  @ApiProperty({
    description: '수정 시각',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class UpdateUserResponse {
  @ApiProperty({ description: '요청 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '결과 메시지',
    example: 'User updated successfully',
  })
  message: string;

  @ApiProperty({
    description: '수정된 사용자 정보',
    type: UpdateUserDataResponse,
  })
  data: UpdateUserDataResponse;
}
