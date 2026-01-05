import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserRoleEnum,
  UserStatusEnum,
  UserApprovalStatusEnum,
  UserLockStatusEnum,
} from '@/infrastructure/repository/entity';

export class LoginHistoryItemResponse {
  @ApiProperty({
    description: '세션 ID',
    example: '67890',
  })
  id: string;

  @ApiPropertyOptional({
    description: '로그인 IP 주소',
    example: '192.168.1.100',
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: '사용자 에이전트',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

  @ApiProperty({
    description: '로그인 시간',
    example: '2024-01-15T09:00:00.000Z',
  })
  loginAt: Date;

  @ApiPropertyOptional({
    description: '로그아웃 시간',
    example: '2024-01-15T17:00:00.000Z',
  })
  logoutAt?: Date;

  @ApiProperty({
    description: '세션 활성 상태',
    example: false,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: '세션 지속 시간(분)',
    example: 480,
  })
  duration?: number;
}

export class UserDetailResponse {
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

  @ApiPropertyOptional({
    description: '전화번호',
    example: '01012345678',
  })
  phoneNumber?: string | null;

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

  @ApiPropertyOptional({
    description: '계정 비활성화 시각',
    example: '2024-03-15T10:30:00.000Z',
  })
  inactiveAt?: Date | null;

  @ApiProperty({
    description: '가입 승인 상태',
    enum: UserApprovalStatusEnum,
    example: UserApprovalStatusEnum.APPROVED,
  })
  approvalStatus: UserApprovalStatusEnum;

  @ApiPropertyOptional({
    description: '가입 신청 시각',
    example: '2024-01-01T00:00:00.000Z',
  })
  signedAt?: Date | null;

  @ApiPropertyOptional({
    description: '가입 승인 시각',
    example: '2024-01-02T00:00:00.000Z',
  })
  approvedAt?: Date | null;

  @ApiPropertyOptional({
    description: '프로필 이미지 URL',
    example: 'https://example.com/profile/john.jpg',
  })
  profileImageUrl?: string;

  @ApiPropertyOptional({
    description: '최근 로그인 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: '로그인 시도 횟수',
    example: 0,
  })
  loginAttemptCount: number;

  @ApiProperty({
    description: '계정 잠금 상태',
    enum: UserLockStatusEnum,
    example: UserLockStatusEnum.UNLOCKED,
  })
  lockStatus: UserLockStatusEnum;

  @ApiPropertyOptional({
    description: '계정 잠금 시작 시간',
    example: '2024-01-15T09:00:00.000Z',
  })
  lockAt?: Date | null;

  @ApiPropertyOptional({
    description: '계정 잠금 해제 시간',
    example: null,
  })
  lockedUntil?: Date;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '계정 수정일',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: '계정 삭제일 (사용중지 날짜)',
    example: null,
  })
  deletedAt?: Date;

  // @ApiProperty({
  //   description: '로그인 히스토리',
  //   type: [LoginHistoryItemResponse],
  // })
  // loginHistory: LoginHistoryItemResponse[];
}

export class GetUserDetailResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '사용자 상세 정보',
    type: UserDetailResponse,
  })
  data: UserDetailResponse;
}
