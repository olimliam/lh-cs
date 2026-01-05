import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserApprovalStatusEnum,
  UserStatusEnum,
} from '@/infrastructure/repository/entity';

export class UpdateUserStatusDataResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: '변경된 사용자 상태',
    example: UserStatusEnum.INACTIVE,
  })
  status: string;

  @ApiPropertyOptional({
    description: '계정 비활성화 시각 (INACTIVE 시)',
    example: '2024-01-15T10:30:00.000Z',
  })
  inactiveAt?: Date | null;

  @ApiProperty({
    description: '상태 변경 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class UpdateUserStatusResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: 'User status updated successfully',
  })
  message: string;

  @ApiProperty({
    description: '상태 변경 결과',
    type: UpdateUserStatusDataResponse,
  })
  data: UpdateUserStatusDataResponse;
}

export class InactivateUserDataResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: '변경된 사용자 상태',
    enum: UserStatusEnum,
    example: UserStatusEnum.INACTIVE,
  })
  status: UserStatusEnum;

  @ApiProperty({
    description: '로그인 아이디(중단 시 변경되지 않음)',
    example: 'user123',
  })
  username: string;

  @ApiProperty({
    description: '비식별화된 이름',
    example: '중지된 사용자',
  })
  name: string;

  @ApiPropertyOptional({
    description: '계정 비활성화 시각 (INACTIVE 시)',
    example: '2024-01-15T10:30:00.000Z',
  })
  inactiveAt?: Date | null;

  @ApiProperty({
    description: '상태 변경 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class InactivateUserResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: 'User inactivated successfully',
  })
  message: string;

  @ApiProperty({
    description: '사용자 중단 결과',
    type: InactivateUserDataResponse,
  })
  data: InactivateUserDataResponse;
}

export class UpdateUserApprovalDataResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '12345',
  })
  id: string;

  @ApiProperty({
    description: '변경된 승인 상태',
    enum: UserApprovalStatusEnum,
    example: UserApprovalStatusEnum.APPROVED,
  })
  approvalStatus: UserApprovalStatusEnum;

  @ApiProperty({
    description: '현재 사용자 상태',
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
  })
  status: UserStatusEnum;

  @ApiPropertyOptional({
    description: '계정 비활성화 시각 (INACTIVE 시)',
    example: '2024-01-15T10:30:00.000Z',
  })
  inactiveAt?: Date | null;

  @ApiProperty({
    description: '변경 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class UpdateUserApprovalResponse {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: 'User approval status updated successfully',
  })
  message: string;

  @ApiProperty({
    description: '승인 상태 변경 결과',
    type: UpdateUserApprovalDataResponse,
  })
  data: UpdateUserApprovalDataResponse;
}

export class ChangePasswordDataResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '12345',
  })
  userId: string;

  @ApiProperty({
    description: '비밀번호 변경 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  changedAt: Date;

  @ApiProperty({
    description: '변경한 관리자 ID',
    example: '67890',
  })
  changedBy: string;
}

export class ChangePasswordResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: 'Password changed successfully',
  })
  message: string;

  @ApiProperty({
    description: '비밀번호 변경 결과',
    type: ChangePasswordDataResponse,
  })
  data: ChangePasswordDataResponse;
}

export class DeleteUserResponse {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: 'User deleted successfully',
  })
  message: string;
}

export class UserLockDataResponse {
  @ApiProperty({
    description: '사용자 ID',
    example: '12345',
  })
  id: string;

  @ApiPropertyOptional({
    description: '계정 잠금 해제 예정 시간 (잠금 해제 시 null)',
    example: '2024-01-15T11:00:00.000Z',
  })
  lockedUntil?: Date | null;

  @ApiProperty({
    description: '현재 로그인 시도 횟수',
    example: 5,
  })
  loginAttemptCount: number;

  @ApiProperty({
    description: '갱신 시간',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class UpdateUserLockResponse {
  @ApiProperty({ description: '성공 여부', example: true })
  success: boolean;

  @ApiProperty({ description: '메시지', example: 'User locked successfully' })
  message: string;

  @ApiProperty({
    description: '잠금 상태 변경 결과',
    type: UserLockDataResponse,
  })
  data: UserLockDataResponse;
}
