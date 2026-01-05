import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserRoleEnum,
  UserStatusEnum,
  UserLockStatusEnum,
} from '@/infrastructure/repository/entity';

export class UserListItemResponse {
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

  @ApiPropertyOptional({
    description: '계정 비활성화 시각',
    example: '2024-03-15T10:30:00.000Z',
  })
  inactiveAt?: Date | null;

  @ApiPropertyOptional({
    description: '가입 신청 시각',
    example: '2024-02-29T12:00:00.000Z',
  })
  signedAt?: Date | null;

  @ApiProperty({
    description: '계정 생성일',
    example: '2024-02-29T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '잠금 상태 (LOCKED/UNLOCKED)',
    enum: UserLockStatusEnum,
    example: UserLockStatusEnum.UNLOCKED,
  })
  lockStatus: UserLockStatusEnum;

  @ApiPropertyOptional({
    description: '계정 잠금 시작 시각',
    example: '2024-01-15T10:30:00.000Z',
  })
  lockAt?: Date | null;
}

export class PaginationResponse {
  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 30,
  })
  limit: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 5,
  })
  totalPages: number;
}

export class UserStatusSummaryResponse {
  @ApiProperty({
    description: 'ACTIVE 상태 사용자 수',
    example: 42,
  })
  activeCount: number;

  @ApiProperty({
    description: 'INACTIVE 상태 사용자 수',
    example: 3,
  })
  inactiveCount: number;

  @ApiProperty({
    description: '잠금(Lock) 상태 사용자 수',
    example: 1,
  })
  lockedCount: number;
}

export class GetUsersResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '사용자 목록',
    type: [UserListItemResponse],
  })
  data: {
    users: UserListItemResponse[];
    pagination: PaginationResponse;
    summary: UserStatusSummaryResponse;
  };
}
